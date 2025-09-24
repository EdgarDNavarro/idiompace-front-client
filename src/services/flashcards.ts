import api from "../conf/axios";
import { z } from "zod";
import { FlashcardSchema, Flashcard } from "../schemas";

// Obtener todas las flashcards del usuario autenticado
export const getFlashcards = async (): Promise<Flashcard[]> => {
    const response = await api.get("/flashcards");
    const parsed = z.array(FlashcardSchema).safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid flashcards schema");
    }
    return parsed.data;
};

// Obtener flashcards "a estudiar" (due)
export const getDueFlashcards = async (): Promise<Flashcard[]> => {
    const response = await api.get("/flashcards/due");
    const parsed = z.array(FlashcardSchema).safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid flashcards schema");
    }
    return parsed.data;
};

// Crear una flashcard
export const createFlashcard = async (flashcard: Pick<Flashcard, "front" | "back" | "example">) => {
    const response = await api.post("/flashcards", flashcard);
    const parsed = FlashcardSchema.safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid flashcard schema");
    }
    return parsed.data;
};

// Editar una flashcard
export const updateFlashcard = async (id: number, flashcard: Partial<Flashcard>) => {
    const response = await api.put(`/flashcards/${id}`, flashcard);
    const parsed = FlashcardSchema.safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid flashcard schema");
    }
    return parsed.data;
};

// Eliminar una flashcard
export const deleteFlashcard = async (id: number) => {
    const response = await api.delete(`/flashcards/${id}`);
    return response.data;
};

// Marcar como correcta una flashcard (spaced repetition)
export const markFlashcardCorrect = async (id: number) => {
    const response = await api.put(`/flashcards/mark-correct/${id}`);
    return response.data;
};

// Marcar como incorrecta una flashcard (spaced repetition)
export const markFlashcardWrong = async (id: number) => {
    const response = await api.put(`/flashcards/mark-wrong/${id}`);
    return response.data;
};