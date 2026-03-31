import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Plus } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { Phrase, Story } from "../schemas";
import { useNavigate, useParams } from "react-router-dom";
import { getStoryById } from "../services/stories";
import ListVocabularies from "./stories/ListVocabularies";
import TryExercises from "./stories/TryExercises";
import CreateFlashcardModal from "./flashcards/CreateFlashcard";
import { incrementStreak } from "../services/streaks";
import { useCustomToast } from "../hooks/useCustomToast";

export const StoryViewer = () => {
    const navigate = useNavigate();
    const { showStreakToast } = useCustomToast();
    const [story, setStory] = useState<Story | null>(null);
    const [showTranslations, setShowTranslations] = useState(true);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const { id } = useParams();

    const activePhraseRef = useRef<HTMLDivElement | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);

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

    const verifyUpdateStreak = async () => {
        try {
            const result = await incrementStreak();
            if (result.incremented) {
                showStreakToast();
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (activePhraseRef.current) {
            activePhraseRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }

        if(story && story.phrases[currentPhraseIndex] && isCurrentPhrase(story.phrases[currentPhraseIndex])) {
            //Si es la última frase, verificar racha
            if(currentPhraseIndex === story.phrases.length - 1) {
                verifyUpdateStreak()
            }
        }
    }, [currentPhraseIndex]);

    const handleShowTranslations = async () => {
        setShowTranslations(!showTranslations);
        await new Promise((resolve) => setTimeout(resolve, 100)); 
        if (activePhraseRef.current) {
            activePhraseRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    const handleCreateFlashcard = (phrase: Phrase) => {
        setSelectedPhrase(phrase);
        setModalOpen(true);
    };

    // Callback cuando se crea la flashcard
    const onCreatedFlashcard = () => {
        setModalOpen(false);
        setSelectedPhrase(null);
    };

    if (story)
        return (
            <div className="flex flex-col items-center">

                <ListVocabularies vocabularies={story.vocabularies} />

                <CreateFlashcardModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    flashcard={
                        selectedPhrase
                            ? {
                                front: "",
                                back: "",
                                example: `${selectedPhrase.english} / ${selectedPhrase.spanish}`,
                            }
                            : undefined
                    }
                    onCreated={onCreatedFlashcard}
                />

                {/* Lyrics-like phrases */}
                <div className="w-full max-w-7xl mx-auto relative">

                    {/* Header - Moderno Glassmorphism */}
                    <div className="w-full flex items-center justify-between py-3 px-4 md:px-6 sticky top-4 z-10 mb-4">
                        <div className="flex items-center gap-3 w-full">
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 text-gray-300 hover:text-white hover:border-neutral-600 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm font-medium">Back</span>
                            </button>

                            <div className="flex-1"></div>

                            <button
                                onClick={handleShowTranslations}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 text-gray-300 hover:text-white hover:border-blue-500/50 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                {showTranslations ? (
                                    <Eye className="w-4 h-4 text-blue-400" />
                                ) : (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium">{showTranslations ? "Hide" : "Show"}</span>
                            </button>
                        </div>
                    </div>

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
                                    <div className="flex gap-2 items-center justify-center">
                                        <p>
                                            {story.idiom === "English" ? phrase.english : phrase.spanish}
                                        </p>
                                        <button
                                            className="ml-2 text-green-400 hover:text-green-600 transition"
                                            onClick={() => handleCreateFlashcard(phrase)}
                                            title="Agregar frase a Flashcards"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {showTranslations && (
                                        <p className="italic text-gray-400 text-base">
                                            {story.idiom === "English" ? phrase.spanish : phrase.english}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <AudioPlayer
                        story={story}
                        currentPhraseIndex={currentPhraseIndex}
                        setCurrentPhraseIndex={setCurrentPhraseIndex}
                        setCurrentTime={setCurrentTime}
                    />
                </div>

                <TryExercises exercises={story.exercises} />
            </div>
        );
    return <div>Story not found...</div>;
};
