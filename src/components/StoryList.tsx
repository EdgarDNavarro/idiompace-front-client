import { BookOpen, Users, Play, Search } from "lucide-react";
import { PaginationMeta, Story } from "../schemas";
import { useEffect, useState } from "react";
import { getStories } from "../services/stories";
import { useNavigate } from "react-router-dom";
import { Pagination } from "./Pagination";
import ViewDailyPhrase from "./daily/ViewDailyPhrase";
import DailyGrid from "./daily/DailyGrid";
import { StreakCounter } from "./streak/StreakCounter";
import { createStreak, getStreaks } from "../services/streaks";
import { isAxiosError } from "axios";

const CATEGORIES = [
    "Infantil", "Educativo", "Ciencia", "Ficción", "Conversacion", "Trabajo", "Viajes", "Comida", "Programacion",
    "Salud", "Negocios", "Tecnologia", "Universidad", "Escuela", "Hogar", "Deportes", "Cuerpo humano", "Animales",
    "Naturaleza", "Numeros", "Pasado continuo", "Presente simple", "Futuro going to", "Presente perfecto",
    "Past perfect", "Reported speech", "Voz pasiva", "Futuro will", "Presente continuo", "Past simple",
    "Condicionales", "Modales", "Phrasal verbs"
];

export const StoryList = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });

    const [idiom, setIdiom] = useState("English");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [searching, setSearching] = useState(false);
    const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });

    const navigate = useNavigate();

    const goToStory = (id: Story["id"]) => {
        navigate("/stories/" + id);
    };

    const getFromApiStories = async (page = 1, preferIdiom = idiom) => {
        setSearching(true);
        try {
            const result = await getStories(page, meta.limit, preferIdiom, title, category);
            setStories(result.data);
            setMeta(result.meta);
        } catch (error) {
            console.log(error);
        } finally {
            setSearching(false);
        }
    };

    const getStreaksFromApi = async (repected = false) => {
        
        try {
            const result = await getStreaks();
            setStreak(result);
            
        } catch (error) {
            console.log(error);
            if(isAxiosError(error) && error.status === 404) {
                await createStreak();

                if(repected) return
                getStreaksFromApi(true)
            }
        }
    }

    useEffect(() => {
        getStreaksFromApi()
        const storedIdiom = localStorage.getItem("preferredIdiom");
        if (storedIdiom) {
            setIdiom(storedIdiom);
            getFromApiStories(1, storedIdiom);
        } else {
            localStorage.setItem("preferredIdiom", idiom);
            getFromApiStories(1, idiom);
        }

    }, []);

    const handleIdiomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const idiom = e.target.value;
        localStorage.setItem("preferredIdiom", idiom);
        setIdiom(idiom);
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        getFromApiStories(1);
    };

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

            <StreakCounter 
                currentStreak={streak.currentStreak}
                longestStreak={streak.longestStreak}
            />

            {/* Barra de búsqueda */}
            <form
                onSubmit={handleSearch}
                className="flex flex-wrap gap-4 items-end mb-8 bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow"
            >
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Idioma</label>
                    <select
                        value={idiom}
                        onChange={handleIdiomChange}
                        className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
                    >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-gray-400 mb-1">Título</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Buscar por título"
                        className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white w-full"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Categoría</label>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
                    >
                        <option value="">Todas</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition font-semibold"
                    disabled={searching}
                >
                    <Search className="w-5 h-5" />
                    Buscar
                </button>
            </form>

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

            <ViewDailyPhrase />

            <DailyGrid />
        </div>
    );
};
