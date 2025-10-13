import { z } from "zod";
import api from "../conf/axios";
import { VocabularySchema } from "../schemas";

export const getVocabularies = async (storyId?: number) => {
    const params = storyId ? { storyId } : {};
    const response = await api.get("/vocabularies", { params });
    const vocabularies = response.data.data;
    const parsed = z.array(VocabularySchema).safeParse(vocabularies);

    if (!parsed.success) {
        throw new Error("Invalid vocabularies schema");
    }

    return parsed.data;
};