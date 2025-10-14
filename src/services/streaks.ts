
import api from "../conf/axios";
import { StreakSchema } from "../schemas";


export const getStreaks = async () => {
    const response = await api.get("/streaks");
    const parsed = StreakSchema.safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid streak schema");
    }
    return parsed.data;
};

export const createStreak = async () => {
    const response = await api.post("/streaks");
    const parsed = StreakSchema.safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid streak schema");
    }
    return parsed.data;
};

export const updateStreak = async (currentStreak: number, longestStreak: number) => {
    const response = await api.put(`/streaks`, { currentStreak, longestStreak });
    console.log(response);
    const parsed = StreakSchema.safeParse(response.data.data);
    if (!parsed.success) {
        throw new Error("Invalid streak schema");
    }
    return parsed.data;
};