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

export const StreakSchema = z.object({
    id: z.number(),
    currentStreak: z.number(),
    longestStreak: z.number(),
    userId: z.string(),
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

const VerbPersonSchema = z.object({
    singular_first_person: z.string(),
    singular_second_person: z.string(),
    singular_formal_second_person: z.string(),
    singular_third_person: z.string(),
    plural_first_person: z.string(),
    plural_second_person: z.string(),
    plural_formal_second_person: z.string(),
    plural_third_person: z.string(),
});

const NonPersonalSchema = z.object({
    infinitive: z.string(),
    participle: z.string(),
    gerund: z.string(),
    compound_infinitive: z.string(),
    compound_gerund: z.string(),
});

const IndicativeSchema = z.object({
    present: VerbPersonSchema,
    present_perfect: VerbPersonSchema,
    imperfect: VerbPersonSchema,
    past_perfect: VerbPersonSchema,
    preterite: VerbPersonSchema,
    past_anterior: VerbPersonSchema,
    future: VerbPersonSchema,
    future_perfect: VerbPersonSchema,
    conditional: VerbPersonSchema,
    conditional_perfect: VerbPersonSchema,
});

const SubjunctiveSchema = z.object({
    present: VerbPersonSchema,
    present_perfect: VerbPersonSchema,
    imperfect: VerbPersonSchema,
    past_perfect: VerbPersonSchema,
    future: VerbPersonSchema,
    future_perfect: VerbPersonSchema,
});

const ImperativeSchema = z.object({
    singular_second_person: z.string(),
    singular_formal_second_person: z.string(),
    plural_second_person: z.string(),
    plural_formal_second_person: z.string(),
});

const ConjugationsSchema = z.object({
    non_personal: NonPersonalSchema,
    indicative: IndicativeSchema,
    subjunctive: SubjunctiveSchema,
    imperative: ImperativeSchema,
});


export const RaeSchema = z.object({
    word: z.string(),
    meanings: z.array(
        z.object({
            origin: z.object({
                raw: z.string(),
                type: z.string(),
                voice: z.string().nullable().optional(),
                text: z.string(),
            }).optional(),
            senses: z.array(
                z.object({
                    raw: z.string(),
                    meaning_number: z.number(),
                    category: z.string(),
                    usage: z.string().nullable().optional(),
                    verb_category: z.string().nullable().optional(),
                    description: z.string(),
                    synonyms: z.array(z.string()).nullable().optional(),
                    antonyms: z.array(z.string()).nullable().optional(),
                })
            ),
            conjugations: ConjugationsSchema.optional(),
        })
    ),
    suggestions: z.any().nullable().optional(),
});


export const EnglishEntrySchema = z.object({
    word: z.string(),
    phonetic: z.string().optional(),
    phonetics: z.array(
        z.object({
        text: z.string().optional(),
        audio: z.string().optional(),
        sourceUrl: z.string().optional(),
        license: z
            .object({
                name: z.string(),
                url: z.string(),
            }).optional(),
        })
    ),
    meanings: z.array(
        z.object({
            partOfSpeech: z.string(),
            definitions: z.array(
                z.object({
                    definition: z.string(),
                    synonyms: z.array(z.string()),
                    antonyms: z.array(z.string()),
                    example: z.string().optional(),
                })
            ),
            synonyms: z.array(z.string()),
            antonyms: z.array(z.string()),
        })
    ),
    license: z
        .object({
            name: z.string(),
            url: z.string(),
        }).optional(),
    sourceUrls: z.array(z.string()),
});

export type Vocabulary = z.infer<typeof VocabularySchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Streak = z.infer<typeof StreakSchema>;

export type Daily = z.infer<typeof DailySchema>;

export type Deck = z.infer<typeof DeckSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;

export type Test = z.infer<typeof TestSchema>;
export type Phrase = z.infer<typeof PhraseSchema>;
export type Story = z.infer<typeof StorySchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type EnglishEntry = z.infer<typeof EnglishEntrySchema>;