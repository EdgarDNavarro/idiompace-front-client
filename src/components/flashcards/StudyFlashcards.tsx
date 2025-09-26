import React, { useEffect, useState } from "react";
import {
    getDueFlashcards,
    markFlashcardCorrect,
    markFlashcardWrong,
} from "../../services/flashcards";
import { Flashcard } from "../../schemas";
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const StudyFlashcards: React.FC = () => {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [current, setCurrent] = useState(0);
    const [showBack, setShowBack] = useState(false);
    const [loading, setLoading] = useState(true);
    const [answering, setAnswering] = useState(false);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const fetchDue = async () => {
            setLoading(true);
            try {
                const data = await getDueFlashcards();
                console.log(data);
                setFlashcards(data);
                setFinished(data.length === 0);
            } catch (e) {
                setFlashcards([]);
                setFinished(true);
            } finally {
                setLoading(false);
            }
        };
        fetchDue();
    }, []);

    const handleShowBack = () => setShowBack(true);

    const handleAnswer = async (correct: boolean) => {
        if (!flashcards[current]) return;
        setAnswering(true);
        try {
            if (correct) {
                await markFlashcardCorrect(flashcards[current].id!);
            } else {
                await markFlashcardWrong(flashcards[current].id!);
            }
        } catch (e) {
            // Opcional: mostrar error
        } finally {
            setAnswering(false);
            setShowBack(false);
            if (current + 1 < flashcards.length) {
                setCurrent(current + 1);
            } else {
                setFinished(true);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <Loader2 className="animate-spin w-10 h-10 text-green-400 mb-4" />
                <span className="text-gray-300">Cargando tarjetas...</span>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
                <h2 className="text-2xl font-bold text-green-300 mb-2">¡Has terminado tus flashcards!</h2>
                <p className="text-gray-400">Vuelve en un rato para seguir practicando.</p>
                <Link to={"/flashcards"} className="mt-6 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">
                    Volver <ArrowLeft className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    const card = flashcards[current];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="mb-6 text-gray-400">
                Tarjeta {current + 1} de {flashcards.length}
            </div>
            <div
                className={`w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none ${
                    showBack ? "" : "hover:scale-105"
                }`}
                style={{ minHeight: 220 }}
                onClick={!showBack ? handleShowBack : undefined}
            >
                <div className="text-2xl font-bold text-white text-center mb-2">
                    {card.front}
                </div>
                {showBack && (
                    <>
                        <div className="mt-4 text-lg text-green-300 font-semibold text-center">
                            {card.back}
                        </div>
                        <div className="mt-2 text-sm text-green-200 italic text-center">
                            {card.example}
                        </div>
                    </>
                )}
                {!showBack && (
                    <div className="mt-6 text-gray-400 text-sm text-center">
                        Haz click para ver la respuesta
                    </div>
                )}
            </div>
            {showBack && (
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={() => handleAnswer(true)}
                        disabled={answering}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold text-lg transition disabled:opacity-60"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Acerté
                    </button>
                    <button
                        onClick={() => handleAnswer(false)}
                        disabled={answering}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold text-lg transition disabled:opacity-60"
                    >
                        <XCircle className="w-5 h-5" />
                        Fallé
                    </button>
                </div>
            )}
        </div>
    );
};

export default StudyFlashcards;