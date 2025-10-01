import { BookOpen, Users, Play } from "lucide-react";
import { PaginationMeta, Story } from "../schemas";
import { useEffect, useState } from "react";
import { getStories } from "../services/stories";
import { useNavigate } from "react-router-dom";
import { Pagination } from "./Pagination";
import ViewDailyPhrase from "./daily/ViewDailyPhrase";
import DailyGrid from "./daily/DailyGrid";

export const StoryList = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });

    const navigate = useNavigate();

    const goToStory = (id: Story["id"]) => {
        navigate("/stories/" + id);
    };

    const getFromApiStories = async (page = 1) => {
        try {
            const result = await getStories(page, meta.limit);
            setStories(result.data);
            setMeta(result.meta);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getFromApiStories();
    }, []);

    const getLevelColor = (level: string) => {
        switch (level) {
            case "low":
                return "text-green-500 border border-green-500";
            case "middle":
                return "text-yellow-400 border border-yellow-400";
            case "high":
                return "text-red-400 border border-red-400";
            default:
                return "text-gray-800";
        }
    };

    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-100 mb-8">
                English Learning Stories
            </h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                    <div
                        key={story.id}
                        onClick={() => goToStory(story.id)}
                        className="bg-neutral-900 rounded-xl shadow-md border border-neutral-800 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors">
                                {story.title}
                            </h3>
                            <div className="bg-neutral-800 p-2 rounded-lg group-hover:bg-neutral-700 transition-colors">
                                <Play className="w-5 h-5 text-green-500" />
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-400 mb-4 line-clamp-2">
                            {story.description}
                        </p>

                        {/* Categorías */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {story.categories.map((cat, idx) => (
                                <span
                                    key={idx}
                                    className="bg-green-800/30 text-green-300 px-2 py-0.5 rounded-full text-xs font-medium border border-green-700"
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    {story.idiom}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    {story.phrases.length} phrases
                                </div>
                            </div>

                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(
                                    story.level
                                )}`}
                            >
                                {story.level}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {meta && (
                <Pagination meta={meta} onPageChange={getFromApiStories} />
            )}

            <ViewDailyPhrase/>

            <DailyGrid/>
        </div>
    );
};
