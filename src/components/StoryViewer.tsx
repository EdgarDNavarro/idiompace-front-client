import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Plus } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { Phrase, Story } from "../schemas";
import { useNavigate, useParams } from "react-router-dom";
import { getStoryById } from "../services/stories";
import ListVocabularies from "./stories/ListVocabularies";
import TryExercises from "./stories/TryExercises";
import CreateFlashcardModal from "./flashcards/CreateFlashcard";
import { getStreaks, updateStreak } from "../services/streaks";
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
            const streak = await getStreaks()
            if(!streak.updatedAt) return
            const updatedAt = new Date(streak.updatedAt);
            const today = new Date();

            const wasUpdatedToday =
            updatedAt.getFullYear() === today.getFullYear() &&
            updatedAt.getMonth() === today.getMonth() &&
            updatedAt.getDate() === today.getDate();

            if(!wasUpdatedToday) {
                await updateStreak(streak.currentStreak + 1, Math.max(streak.longestStreak, streak.currentStreak + 1))
                showStreakToast();
            }
        } catch (error) {
            
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
                <div className="w-full max-w-6xl relative ">

                    {/* Header */}
                    <div className="w-full flex items-center justify-between py-4 px-6 sticky top-6 z-10 backdrop-blur-sm rounded-md md:backdrop-blur-0">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>

                        <button
                            onClick={handleShowTranslations}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                        >
                            {showTranslations ? (
                                <Eye className="w-4 h-4" />
                            ) : (
                                <EyeOff className="w-4 h-4" />
                            )}
                            {showTranslations ? "Hide" : "Show"} Translations
                        </button>
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
