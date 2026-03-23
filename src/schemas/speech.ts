import { z } from "zod";

// Schema para el token de Scribe
export const ScribeTokenSchema = z.object({
    token: z.string(),
});

// Schema alternativo si el backend devuelve solo el string
export const ScribeTokenResponseSchema = z.union([
    ScribeTokenSchema,
    z.string(), // Fallback para respuesta directa como string
]);

// Schema para la respuesta de clear session
export const ClearSessionResponseSchema = z.object({
    ok: z.boolean(),
    message: z.string().optional(),
});

// Schema para los parámetros de chat
export const ChatParamsSchema = z.object({
    text: z.string().min(1, "El texto no puede estar vacío"),
    voiceId: z.string().min(1, "El voiceId no puede estar vacío"),
    idiom: z.enum(["English", "Spanish"], "El idioma debe ser 'English' o 'Spanish'"),
    sessionId: z.string().uuid("El sessionId debe ser un UUID válido"),
});

// Schema para flashcard generada
export const GeneratedFlashcardSchema = z.object({
    front: z.string(),
    back: z.string(),
    example: z.string(),
});

export const GeneratedFlashcardsResponseSchema = z.array(GeneratedFlashcardSchema);

// Type exports
export type ScribeTokenResponse = z.infer<typeof ScribeTokenResponseSchema>;
export type ClearSessionResponse = z.infer<typeof ClearSessionResponseSchema>;
export type ChatParams = z.infer<typeof ChatParamsSchema>;
export type GeneratedFlashcard = z.infer<typeof GeneratedFlashcardSchema>;
