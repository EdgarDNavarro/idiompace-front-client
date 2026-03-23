import api from "../conf/axios";
import { 
    ChatParamsSchema, 
    ScribeTokenResponseSchema, 
    ClearSessionResponseSchema,
    type ChatParams 
} from "../schemas/speech";

/**
 * Realiza una conversación con la IA y retorna el stream de audio
 * @throws {Error} Si la validación falla o hay error en la petición
 */
export const chatWithSpeech = async ({ text, sessionId, voiceId, idiom }: ChatParams): Promise<Response> => {
    // Validar parámetros con Zod
    const validatedParams = ChatParamsSchema.parse({ text, sessionId, voiceId, idiom });
    
    const baseURL = import.meta.env.VITE_API_URL;
    
    const response = await fetch(`${baseURL}/api/speech/chat`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedParams),
        credentials: 'include', // Para enviar las cookies de autenticación (better-auth)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `Error en chat: ${response.statusText}`);
    }

    return response;
};

/**
 * Limpia la sesión de chat del backend
 * @throws {Error} Si hay error en la petición o validación falla
 */
export const clearChatSession = async (sessionId: string) => {
    if (!sessionId || typeof sessionId !== 'string') {
        throw new Error("sessionId debe ser un string válido");
    }
    
    const response = await api.delete(`/speech/session/${sessionId}`);
    
    // Validar respuesta
    const validated = ClearSessionResponseSchema.parse(response.data);
    return validated;
};

/**
 * Obtiene un token de ElevenLabs para Scribe (STT)
 * @throws {Error} Si el token no es válido o hay error en la petición
 */
export const getScribeToken = async (): Promise<string> => {
    const response = await api.get("/speech/scribe-token");
    
    // Validar con schema
    const validated = ScribeTokenResponseSchema.parse(response.data);
    
    // Extraer token según el formato
    if (typeof validated === 'string') {
        return validated;
    }
    
    return validated.token;
};
