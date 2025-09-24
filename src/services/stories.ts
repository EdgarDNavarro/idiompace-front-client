import api from "../conf/axios";
import { z } from "zod";
import { paginationMetaSchema, StorySchema } from "../schemas";


export const getStories = async (page = 1, limit = 10) => {
    const response = await api.get('/stories', {
        params: { page, limit },
    });

    const stories = response.data.data;
    const parsed = z.array(StorySchema).safeParse(stories);
    const parsedMeta = paginationMetaSchema.safeParse(response.data.meta);

    if (!parsed.success) {
        throw new Error("Invalid stories schema");
    }

    if (!parsedMeta.success) {
        throw new Error("Invalid pagination schema");
    }

    return { data: parsed.data, meta: parsedMeta.data };
};

export const getStoryById = async (id: string) => {
    const response = await api.get(`/stories/${id}`);
    return response.data;
};

export const createStory = async (storyData: any) => {
    const response = await api.post('/stories', storyData);
    return response.data;
};

export const updateStory = async (id: string, storyData: any) => {
    const response = await api.put(`/stories/${id}`, storyData);
    return response.data;
};

export const deleteStory = async (id: string) => {
    const response = await api.delete(`/stories/${id}`);
    return response.data;
};