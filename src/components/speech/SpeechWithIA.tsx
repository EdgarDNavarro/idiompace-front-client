
import { useState, useRef, useCallback, useEffect } from "react";
import { Scribe, RealtimeEvents, RealtimeConnection, CommitStrategy } from "@elevenlabs/client";
import { chatWithSpeech, getScribeToken, clearChatSession } from "../../services/speech";

// Estados posibles de la llamada
const CallState = {
    IDLE: "idle",           // Sin llamada activa
    CONNECTING: "connecting", // Pidiendo token y conectando STT
    LISTENING: "listening", // Micrófono activo, esperando al usuario
    THINKING: "thinking",  // Transcripción enviada, esperando respuesta
    SPEAKING: "speaking",  // Reproduciendo audio de la IA
} as const;

type CallStateType = typeof CallState[keyof typeof CallState];

const SpeechWithIA = () => {
    const [callState, setCallState] = useState<CallStateType>(CallState.IDLE);
    const [transcript, setTranscript] = useState(""); // Texto parcial en tiempo real
    const [error, setError] = useState<string | null>(null);

    // Refs para no recrear en cada render
    const scribeRef = useRef<RealtimeConnection | null>(null);        // Conexión STT de ElevenLabs
    const sessionIdRef = useRef<string | null>(null);     // ID único de sesión
    const audioContextRef = useRef<AudioContext | null>(null);  // AudioContext para reproducir audio
    const audioQueueRef = useRef<ArrayBuffer[]>([]);      // Cola de chunks de audio pendientes
    const isPlayingRef = useRef(false);    // Si hay audio reproduciéndose ahora mismo
    const isMutedRef = useRef(false);      // Para silenciar micro mientras habla la IA


    const playNextChunk = useCallback(async () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;

            // La IA terminó de hablar → reactivar micrófono
            setCallState(CallState.LISTENING);
            isMutedRef.current = false;
            return;
        }

        isPlayingRef.current = true;
        const chunk = audioQueueRef.current.shift();

        if (!chunk || !audioContextRef.current) return;

        try {
            const audioBuffer = await audioContextRef.current.decodeAudioData(chunk);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = playNextChunk; // Encadenar el siguiente chunk al terminar
            source.start();
        } catch {
            // Si un chunk falla (puede pasar con los primeros bytes), pasar al siguiente
            playNextChunk();
        }
    }, []);

    const enqueueAudioChunk = useCallback((arrayBuffer: ArrayBuffer) => {
        audioQueueRef.current.push(arrayBuffer);
        if (!isPlayingRef.current) {
            playNextChunk();
        }
    }, [playNextChunk]);

    // ── Enviar transcripción al backend ─────────────────────────────────────
    const sendTranscript = useCallback(async (text: string) => {
        if (!text.trim() || !sessionIdRef.current) return;

        setTranscript("");
        setCallState(CallState.THINKING);
        isMutedRef.current = true; // Silenciar micro mientras responde la IA

        try {
            // Usar el service que valida con Zod
            const response = await chatWithSpeech({ 
                text, 
                sessionId: sessionIdRef.current 
            });

            setCallState(CallState.SPEAKING);

            // Leer el stream de audio chunk a chunk
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No se pudo obtener el reader del stream");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                // Cada value es un Uint8Array → lo convertimos a ArrayBuffer para AudioContext
                enqueueAudioChunk(value.buffer);
            }

        } catch (err) {
            console.error("[sendTranscript] Error:", err);
            const errorMessage = err instanceof Error ? err.message : "Error al obtener respuesta";
            setError(errorMessage);
            setCallState(CallState.LISTENING);
            isMutedRef.current = false;
        }
    }, [enqueueAudioChunk]);

    // ── Iniciar llamada ──────────────────────────────────────────────────────
    const startCall = useCallback(async () => {
        setError(null);
        setCallState(CallState.CONNECTING);

        try {
            // 1. Crear AudioContext (debe crearse tras un gesto del usuario)
            audioContextRef.current = new AudioContext();

            // 2. Generar sessionId único para esta llamada
            sessionIdRef.current = crypto.randomUUID();

            // 3. Pedir token STT al backend (validado con Zod)
            const token = await getScribeToken();

            // 4. Conectar Scribe (STT de ElevenLabs) con el micrófono
            const connection = Scribe.connect({
                token,
                modelId: "scribe_v2_realtime",
                microphone: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                commitStrategy: CommitStrategy.VAD,
                vadSilenceThresholdSecs: 1.5,
                vadThreshold: 0.4,
                minSpeechDurationMs: 100,
                minSilenceDurationMs: 100,
            });

            scribeRef.current = connection;

            // Transcript parcial → mostrar en tiempo real lo que dice el usuario
            connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data) => {
                if (!isMutedRef.current) {
                    setTranscript(data.text);
                }
            });

            // Transcript confirmado → enviar a Claude
            connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {

                if (!isMutedRef.current && data.text.trim()) {
                    sendTranscript(data.text);
                }
            });

            connection.on(RealtimeEvents.SESSION_STARTED, () => {
                setCallState(CallState.LISTENING);
            });

            connection.on(RealtimeEvents.ERROR, (err) => {
                console.error("[Scribe] Error:", err);
                setError("Error en el reconocimiento de voz.");
                setCallState(CallState.IDLE);
            });

            connection.on(RealtimeEvents.CLOSE, () => {
                // Solo actualizar estado si no fue un cierre intencionado
                setCallState((prev) =>
                    prev !== CallState.IDLE ? CallState.IDLE : prev
                );
            });

        } catch (err) {
            console.error("[startCall] Error:", err);
            setError("No se pudo iniciar la llamada. Comprueba los permisos del micrófono.");
            setCallState(CallState.IDLE);
        }
    }, [sendTranscript]);

    // ── Terminar llamada ─────────────────────────────────────────────────────
    const endCall = useCallback(async () => {
        // Cerrar STT
        scribeRef.current?.close();
        scribeRef.current = null;

        // Parar audio
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        audioContextRef.current?.close();
        audioContextRef.current = null;

        // Limpiar sesión en el backend (validado con Zod)
        if (sessionIdRef.current) {
            try {
                await clearChatSession(sessionIdRef.current);
            } catch (err) {
                console.warn("[endCall] No se pudo limpiar la sesión:", err);
            }
            sessionIdRef.current = null;
        }

        setTranscript("");
        setCallState(CallState.IDLE);
        isMutedRef.current = false;
    }, []);

    // Limpiar si el componente se desmonta con la llamada activa
    useEffect(() => {
        return () => {
            scribeRef.current?.close();
            audioContextRef.current?.close();
        };
    }, []);

    // ── UI mínima ────────────────────────────────────────────────────────────
    const isInCall = callState !== CallState.IDLE;

    return (
        <div>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <p>Estado: <strong>{callState}</strong></p>

            {transcript && (
                <p style={{ fontStyle: "italic", color: "#555" }}>"{transcript}"</p>
            )}

            {!isInCall ? (
                <button onClick={startCall}>
                    Iniciar llamada
                </button>
            ) : (
                <button onClick={endCall} disabled={callState === CallState.CONNECTING}>
                    Colgar
                </button>
            )}
        </div>
    );
 
}
 
export default SpeechWithIA;