import { z } from "zod";

export const TestSchema = z.object({
    id: z.number(),
    ask: z.string(),
    answer: z.string(),
    phrase: z.string(),
    storyId: z.number(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const VocabularySchema = z.object({
    id: z.number().optional(),
    vocabulary: z.string(),
    translation: z.string(),
    example: z.string(),
    storyId: z.number(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const ExerciseSchema = z.object({
    id: z.number().optional(),
    question: z.string(),
    optionA: z.string(),
    optionB: z.string(),
    optionC: z.string(),
    optionD: z.string(),
    correctOption: z.string().min(1).max(1), // 'A', 'B', 'C', 'D'
    explanation: z.string(),
    storyId: z.number(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const PhraseSchema = z.object({
    startTime: z.number(),
    endTime: z.number(),
    english: z.string(),
    spanish: z.string(),
});

export const StorySchema = z.object({
    id: z.number(),
    title: z.string(),
    idiom: z.string(),
    description: z.string(),
    phrases: z.array(PhraseSchema),
    categories: z.array(z.string()),
    is_interactive: z.boolean(),
    level: z.string(),
    tests: z.array(TestSchema),
    vocabularies: z.array(VocabularySchema),
    exercises: z.array(ExerciseSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const paginationMetaSchema = z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
});

export const DeckSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    userId: z.string(),
    flashcardCount: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const FlashcardSchema = z.object({
    id: z.number().optional(),
    front: z.string(),
    back: z.string(),
    example: z.string(),
    successCount: z.number().optional(),
    failCount: z.number().optional(),
    interval: z.number().optional(),
    easiness: z.number().optional(),
    lastReviewedAt: z.string().nullable().optional(),
    nextReviewAt: z.string().nullable().optional(),
    deckId: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});



export const DailySchema = z.object({
    id: z.number().optional(),
    phrase: z.string(),
    phrase_translation: z.string(),
    example: z.string(),
    example_translation: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type Vocabulary = z.infer<typeof VocabularySchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;

export type Daily = z.infer<typeof DailySchema>;

export type Deck = z.infer<typeof DeckSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;

export type Test = z.infer<typeof TestSchema>;
export type Phrase = z.infer<typeof PhraseSchema>;
export type Story = z.infer<typeof StorySchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;