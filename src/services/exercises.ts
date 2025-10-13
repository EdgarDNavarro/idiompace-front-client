import { z } from "zod";
import api from "../conf/axios";
import { ExerciseSchema } from "../schemas";

export const getExercises = async (storyId: number) => {
    const params = { storyId };
    const response = await api.get("/exercises", { params });
    const exercises = response.data.data;
    const parsed = z.array(ExerciseSchema).safeParse(exercises);

    if (!parsed.success) {
        throw new Error("Invalid exercises schema");
    }

    return parsed.data;
};