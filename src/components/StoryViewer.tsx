import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { Phrase, Story } from "../schemas";
import { useNavigate, useParams } from "react-router-dom";
import { getStoryById } from "../services/stories";
import TryTest from "./stories/TryTests";

export const StoryViewer = () => {
    const navigate = useNavigate();
    const [story, setStory] = useState<Story | null>(null);
    const [showTranslations, setShowTranslations] = useState(true);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const { id } = useParams();

    const activePhraseRef = useRef<HTMLDivElement | null>(null);

    const isCurrentPhrase = (phrase: Phrase): boolean => {
        return currentTime >= phrase.startTime && currentTime < phrase.endTime;
    };

    useEffect(() => {
        const getFromApiStories = async () => {
            try {
                const story = await getStoryById(id as string);
                setStory(story.data);
            } catch (error) {
                console.log(error);
            }
        };
        getFromApiStories();
    }, []);

    useEffect(() => {
        if (activePhraseRef.current) {
        activePhraseRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
        }
    }, [currentPhraseIndex]);

    if (story)
        return (
            <div className="flex flex-col items-center relative">
                {/* Header */}
                <div className="w-full flex items-center justify-between py-4 px-6">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <button
                        onClick={() => setShowTranslations(!showTranslations)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {showTranslations ? (
                            <Eye className="w-4 h-4" />
                        ) : (
                            <EyeOff className="w-4 h-4" />
                        )}
                        {showTranslations ? "Hide" : "Show"} Translations
                    </button>
                </div>

                {/* Lyrics-like phrases */}
                <div className="w-full max-w-3xl max-h-[60vh] overflow-y-auto scrollbar-hide">
                    <div className="flex flex-col items-center gap-6 py-12 transition-all duration-500">
                        {story.phrases.map((phrase, index) => {
                            const active = isCurrentPhrase(phrase);
                            const isNear =
                                Math.abs(index - currentPhraseIndex) === 1 ||
                                index === currentPhraseIndex;

                            return (
                                <div
                                    ref={index === currentPhraseIndex ? activePhraseRef : null}
                                    key={index}
                                    className={`text-center transition-all duration-500 ${
                                        active
                                            ? "text-2xl font-bold text-green-400"
                                            : isNear
                                            ? "text-xl text-gray-300"
                                            : "text-lg text-gray-600 opacity-50"
                                    }`}
                                >
                                    <p>{phrase.english}</p>
                                    {showTranslations && (
                                        <p className="italic text-gray-400 text-base">
                                            {phrase.spanish}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <AudioPlayer
                    story={story}
                    currentPhraseIndex={currentPhraseIndex}
                    setCurrentPhraseIndex={setCurrentPhraseIndex}
                    setCurrentTime={setCurrentTime}
                />

                <TryTest tests={story.tests} />
            </div>
        );
    return <div>Story not found...</div>;
};
