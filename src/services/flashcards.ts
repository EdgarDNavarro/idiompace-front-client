import api from "../conf/axios";
import { z } from "zod";
import { FlashcardSchema, Flashcard, DeckSchema, Deck } from "../schemas";

// Obtener todos los decks del usuario autenticado
export const getDecks = async (): Promise<Deck[]> => {
    const response = await api.get("/flashcards/decks");
    const parsed = z.array(DeckSchema).safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid decks schema");
    }
    return parsed.data;
};

// Crear un deck
export const createDeck = async (name: string) => {
    const response = await api.post("/flashcards/decks", { name });
    const parsed = DeckSchema.safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid deck schema");
    }
    return parsed.data;
};

// Eliminar un deck
export const deleteDeck = async (id: string) => {
    const response = await api.delete(`/flashcards/decks/${id}`);
    return response.data;
};

// Obtener todas las flashcards de un deck
export const getFlashcards = async (deckId: string): Promise<Flashcard[]> => {
    const response = await api.get(`/flashcards/list/${deckId}`);
    const parsed = z.array(FlashcardSchema).safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid flashcards schema");
    }
    return parsed.data;
};

// Obtener flashcards "a estudiar" (due) por deck
export const getDueFlashcards = async (deckId: string): Promise<Flashcard[]> => {
    const response = await api.get(`/flashcards/due/${deckId}`);
    const parsed = z.array(FlashcardSchema).safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid flashcards schema");
    }
    return parsed.data;
};

export const getAllDueFlashcards = async (): Promise<Flashcard[]> => {
    const response = await api.get(`/flashcards/all/due`);
    const parsed = z.array(FlashcardSchema).safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid flashcards schema");
    }
    return parsed.data;
};

// Crear una flashcard en un deck
export const createFlashcard = async (
    flashcard: Pick<Flashcard, "front" | "back" | "example" | "deckId"> 
) => {
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

// Generar flashcards desde un PDF
export const generateFlashcardsFromPdf = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/upload/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data as { data: { front: string; back: string; example: string }[]; pages: number };
};

// Generar flashcards desde una imagen
export const generateFlashcardsFromImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data as { data: { front: string; back: string; example: string }[] };
};

// Subir CSV para crear flashcards masivamente
export const uploadFlashcardsCsv = async (file: File, deckId: number, delimiter: string = ",") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("deckId", deckId.toString());
    formData.append("delimiter", delimiter);

    const response = await api.post("/flashcards/decks/flashcards/upload-csv", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    console.log(response.data);
    
    return response.data;
};