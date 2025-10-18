import axios from "axios";
import { EnglishEntrySchema, RaeSchema } from "../schemas";
import z from "zod";


export const getSpanishWordDefinition = async (word: string) => {
    try {
        const response = await  axios.get(`https://rae-api.com/api/words/${word}`);
        console.log(response);
        
        const data = RaeSchema.safeParse(response.data.data);
        console.log(data);
        
        if (!data.success) {
            throw new Error("Invalid exercises schema");
        }

        return data.data;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch Spanish word definition");
    }
}

export const getEnglishWordDefinition = async (word: string) => {
    try {
        const response = await axios.get(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)}`);
        const data = JSON.parse(response.data.contents);
        const parsed = z.array(EnglishEntrySchema).safeParse(data);
        
        if (!parsed.success) {
            throw new Error("Invalid exercises schema");
        }

        return parsed.data;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to fetch english word definition");
    }
}