import { Search } from "lucide-react";
import { PaginationMeta, Story } from "../schemas";
import { useEffect, useState } from "react";
import { getStories } from "../services/stories";
import ViewDailyPhrase from "./daily/ViewDailyPhrase";
import DailyGrid from "./daily/DailyGrid";
import { StreakCounter } from "./streak/StreakCounter";
import { createStreak, getStreaks } from "../services/streaks";
import { isAxiosError } from "axios";
import { CATEGORIES_ENGLISH, CATEGORIES_SPANISH, spanishVoices, englishVoices } from "../schemas/categories";
import { StoriesGrid } from "./stories/StoriesGrid";

export const StoryList = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [myStories, setMyStories] = useState<Story[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 1,
    });
    const [myMeta, setMyMeta] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 1,
    });

    const [idiom, setIdiom] = useState("English");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [voice, setVoice] = useState("");
    const [searching, setSearching] = useState(false);
    const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
    const currentCategories = idiom === "English" ? CATEGORIES_ENGLISH : CATEGORIES_SPANISH;
    const currentVoices = idiom === "English" ? englishVoices : spanishVoices;

    const getFromApiStories = async (page = 1, preferIdiom = idiom) => {
        setSearching(true);
        try {
            const result = await getStories(page, meta.limit, preferIdiom, title, category, voice);
            setStories(result.data);
            setMeta(result.meta);
        } catch (error) {
            console.log(error);
        } finally {
            setSearching(false);
        }
    };

    const getMyStories = async (page = 1, preferIdiom = idiom) => {
        try {
            const result_my = await getStories(page, myMeta.limit, preferIdiom, title, category, voice, true);
            setMyStories(result_my.data);
            setMyMeta(result_my.meta);
        } catch (error) {
            console.log(error);
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
            getMyStories(1, storedIdiom);
        } else {
            localStorage.setItem("preferredIdiom", idiom);
            getFromApiStories(1, idiom);
            getMyStories(1, idiom);
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
        getMyStories(1);
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
                        {currentCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-gray-400 mb-1">Voz</label>
                    <select
                        value={voice}
                        onChange={e => setVoice(e.target.value)}
                        className="px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
                    >
                        <option value="">Todas</option>
                        {currentVoices.map(voice => (
                            <option key={voice.id} value={voice.name}>{voice.name}</option>
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

            <StoriesGrid 
                stories={myStories} 
                title="Mis Historias" 
                meta={myMeta}
                onPageChange={getMyStories}
            />

            <StoriesGrid 
                stories={stories} 
                title="Historias de la Comunidad" 
                meta={meta}
                onPageChange={getFromApiStories}
            />

            <ViewDailyPhrase />

            <DailyGrid />
        </div>
    );
};
