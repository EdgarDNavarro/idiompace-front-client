
import { useState, useRef, useCallback, useEffect } from "react";
import { Scribe, RealtimeEvents, RealtimeConnection, CommitStrategy } from "@elevenlabs/client";
import { chatWithSpeech, getScribeToken, clearChatSession } from "../../services/speech";
import { englishVoices, spanishVoices } from "../../schemas/categories";
import { PhoneCallIcon, PhoneOffIcon, SpeechIcon, TimerIcon } from "lucide-react";
import { Orb } from "../elevelabs/Orb";

// Estados posibles de la llamada
const CallState = {
    IDLE: "idle",           // Sin llamada activa
    CONNECTING: "connecting", // Pidiendo token y conectando STT
    LISTENING: "listening", // Micrófono activo, esperando al usuario
    THINKING: "thinking",  // Transcripción enviada, esperando respuesta
    SPEAKING: "speaking",  // Reproduciendo audio de la IA
} as const;

type CallStateType = typeof CallState[keyof typeof CallState];

const RACHEL_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel - inglés nativo (default)
const MAX_CALL_DURATION = 180; // 3 minutos en segundos
const WARNING_TIME = 170; // 2:50 - faltando 10 segundos

const SpeechWithIA = () => {
    const [callState, setCallState] = useState<CallStateType>(CallState.IDLE);
    const [transcript, setTranscript] = useState(""); // Texto parcial en tiempo real
    const [error, setError] = useState<string | null>(null);
    const [idiom, setIdiom] = useState<"English" | "Spanish">("English");
    const [voiceId, setVoiceId] = useState(RACHEL_VOICE_ID);
    const [callDuration, setCallDuration] = useState(0); // Tiempo en segundos

    // Refs para no recrear en cada render
    const scribeRef = useRef<RealtimeConnection | null>(null);        // Conexión STT de ElevenLabs
    const sessionIdRef = useRef<string | null>(null);     // ID único de sesión
    const audioContextRef = useRef<AudioContext | null>(null);  // AudioContext para reproducir audio
    const audioQueueRef = useRef<ArrayBuffer[]>([]);      // Cola de chunks de audio pendientes
    const isPlayingRef = useRef(false);    // Si hay audio reproduciéndose ahora mismo
    const isMutedRef = useRef(false);      // Para silenciar micro mientras habla la IA
    const warningShownRef = useRef(false); // Para evitar múltiples warnings
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const outputVolumeRef = useRef(0);     // Volumen de salida para el orbe (0-1)

    // Obtener las voces según el idioma seleccionado
    const currentVoices = idiom === "English" ? englishVoices : spanishVoices;

    // Formatear tiempo como MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    const playNextChunk = useCallback(async () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            outputVolumeRef.current = 0; // Reset volume cuando termina

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
            
            // Crear analizador para obtener el volumen
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            source.connect(analyser);
            analyser.connect(audioContextRef.current.destination);
            
            // Actualizar volumen en tiempo real
            const updateVolume = () => {
                if (isPlayingRef.current) {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    outputVolumeRef.current = Math.min(average / 128, 1); // Normalizar a 0-1
                    requestAnimationFrame(updateVolume);
                }
            };
            updateVolume();
            
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
                sessionId: sessionIdRef.current,
                voiceId,
                idiom
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
    }, [enqueueAudioChunk, voiceId, idiom]);

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
        // Limpiar timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        
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
        setCallDuration(0);
        isMutedRef.current = false;
        warningShownRef.current = false;
        outputVolumeRef.current = 0;
    }, []);

    // Limpiar si el componente se desmonta con la llamada activa
    useEffect(() => {
        return () => {
            scribeRef.current?.close();
            audioContextRef.current?.close();
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    // ── Gestionar timer de llamada y límite de tiempo ───────────────────────
    useEffect(() => {
        // Solo correr timer si la llamada está activa (no IDLE ni CONNECTING)
        if (callState !== CallState.IDLE && callState !== CallState.CONNECTING) {
            // Iniciar timer
            timerIntervalRef.current = setInterval(() => {
                setCallDuration(prev => {
                    const newDuration = prev + 1;

                    // A los 170 segundos (2:50), enviar mensaje de despedida
                    if (newDuration === WARNING_TIME && !warningShownRef.current) {
                        warningShownRef.current = true;
                        const farewellMessage = idiom === "English" 
                            ? "Our time is almost up. Please say goodbye."
                            : "Nuestro tiempo casi se acaba. Por favor despídete.";
                        
                        // Enviar mensaje automático
                        sendTranscript(farewellMessage);
                    }

                    // A los 180 segundos (3:00), terminar llamada
                    if (newDuration >= MAX_CALL_DURATION) {
                        endCall();
                        return MAX_CALL_DURATION;
                    }

                    return newDuration;
                });
            }, 1000);
        } else {
            // Si no hay llamada activa, limpiar timer
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }

        // Cleanup al cambiar de estado
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [callState, idiom, sendTranscript, endCall]);

    // ── UI mínima ────────────────────────────────────────────────────────────
    const isInCall = callState !== CallState.IDLE;
    
    // Mapear CallState a AgentState para el Orb de ElevenLabs
    const getAgentState = (): "thinking" | "listening" | "talking" | null => {
        switch (callState) {
            case CallState.IDLE:
                return null;
            case CallState.CONNECTING:
                return "thinking";
            case CallState.LISTENING:
                return "listening";
            case CallState.THINKING:
                return "thinking";
            case CallState.SPEAKING:
                return "talking";
            default:
                return null;
        }
    };

    return (
        <div >
            <div >
                <h2 className="text-4xl font-bold text-green-400 mb-6 text-center flex justify-center gap-3 items-center"><SpeechIcon className="w-10 h-10"/> Speech with IA </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200">
                        {error}
                    </div>
                )}

                {/* Orbe de partículas 3D reactivo al estado */}
                <div className={`${isInCall ? 'mb-8' : 'mb-6'} flex justify-center `}>
                    <div className={`
                        w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]
                        rounded-full 
                        bg-black/20
                        shadow-[0_0_60px_rgba(0,0,0,0.4),inset_0_0_40px_rgba(0,0,0,0.6)]
                        transition-all 
                        duration-700
                    `}>
                        <Orb 
                            agentState={getAgentState()}
                            colors={
                                callState === CallState.SPEAKING ? ["#10b981", "#34d399"] : // Verde
                                callState === CallState.LISTENING ? ["#3b82f6", "#60a5fa"] : // Azul
                                callState === CallState.THINKING || callState === CallState.CONNECTING ? ["#fbbf24", "#fcd34d"] : // Amarillo
                                ["#4a5568", "#6b7280"] // Gris para IDLE
                            }
                            volumeMode="auto"
                            outputVolumeRef={outputVolumeRef}
                            className="w-full h-full"
                            seed={21210703} // Seed fijo para animaciones consistentes
                        />
                        {/* <Orb state={callState} /> */}
                    </div>
                </div>

                {/* Contenedor de controles durante la llamada - centrados */}
                {isInCall && (
                    <div className="flex flex-col items-center gap-4 mb-6">
                        {/* Contador de tiempo */}
                        <div className="flex items-center gap-2 bg-gray-800/50 px-6 py-3 rounded-full">
                            <TimerIcon className="w-5 h-5 text-gray-400" />
                            <span 
                                className={`text-2xl font-mono font-bold ${
                                    callDuration >= WARNING_TIME 
                                        ? "text-red-400 animate-pulse" 
                                        : callDuration >= 120 
                                            ? "text-yellow-400" 
                                            : "text-gray-300"
                                }`}
                            >
                                {formatTime(callDuration)}
                            </span>
                            <span className="text-gray-500 text-sm">/ {formatTime(MAX_CALL_DURATION)}</span>
                        </div>

                        {/* Botón de colgar */}
                        <button 
                            onClick={endCall} 
                            disabled={callState === CallState.CONNECTING}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-8 rounded-full transition-colors duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-red-600/50"
                        >
                            <PhoneOffIcon className="w-5 h-5" />
                            Colgar
                        </button>

                        {/* Ayuda */}
                        {callState === CallState.LISTENING && (
                            <div className="text-center text-sm text-gray-400 mt-2">
                                Habla en inglés y la IA te responderá
                            </div>
                        )}
                    </div>
                )}

                {/* Configuración (solo visible cuando no hay llamada activa) */}
                {!isInCall && (
                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Selector de idioma */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Idioma
                                </label>
                                <select
                                    value={idiom}
                                    onChange={(e) => {
                                        const newIdiom = e.target.value as "English" | "Spanish";
                                        setIdiom(newIdiom);
                                        // Resetear a Rachel al cambiar idioma
                                        setVoiceId(RACHEL_VOICE_ID);
                                    }}
                                    className="filter-select w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-gray-400"
                                >
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                </select>
                            </div>

                            {/* Selector de voz */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Voz del Profesor
                                </label>
                                <select
                                    value={voiceId}
                                    onChange={(e) => setVoiceId(e.target.value)}
                                    className="filter-select w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-gray-400"
                                >
                                    {currentVoices.map((voice) => (
                                        <option key={voice.id} value={voice.id}>
                                            {voice.name} ({voice.gender}) - {voice.accent}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                       
                    </div>
                )}

                {/* Banner de advertencia de tiempo */}
                {isInCall && callDuration >= WARNING_TIME && (
                    <div className="mb-4 p-4 bg-red-900/30 border-2 border-red-500 rounded-lg animate-pulse">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">⚠️</span>
                            <div>
                                <p className="text-red-300 font-bold text-lg">
                                    {idiom === "English" 
                                        ? "Time is running out!" 
                                        : "¡El tiempo se está agotando!"}
                                </p>
                                <p className="text-red-400 text-sm">
                                    {idiom === "English"
                                        ? `The call will end in ${MAX_CALL_DURATION - callDuration} seconds`
                                        : `La llamada terminará en ${MAX_CALL_DURATION - callDuration} segundos`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón de iniciar llamada (solo visible cuando NO hay llamada) */}
                {!isInCall && (
                    <div className="flex justify-center">
                        <button 
                            onClick={startCall}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-600/50"
                        >
                            <PhoneCallIcon className="w-5 h-5" />
                            Iniciar llamada
                        </button>
                    </div>
                )}

                                {/* Transcripción en tiempo real */}
                {transcript && (
                    <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-400 mb-1">Tú:</p>
                        <p className="text-gray-200 italic">"{transcript}"</p>
                    </div>
                )}
            </div>
        </div>
    );
 
}
 
export default SpeechWithIA;