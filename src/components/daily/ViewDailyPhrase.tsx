import React, { useEffect, useState } from "react";
import { DailySchema, Daily } from "../../schemas";
import { Sparkles, ArrowRight, PlusCircle } from "lucide-react";
import api from "../../conf/axios";
import CreateFlashcardModal from "../flashcards/CreateFlashcard";

const ViewDailyPhrase: React.FC = () => {
    const [daily, setDaily] = useState<Daily | null>(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchDaily = async () => {
            setLoading(true);
            try {
                const response = await api.get("/daily/today");
                const parsed = DailySchema.safeParse(response.data.data);
                if (parsed.success) {
                    setDaily(parsed.data);
                }
            } catch (error) {
                setDaily(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDaily();
    }, []);

    const handleAddFlashcard = async () => {
        if (!daily) return;
        try {
            setModalOpen(true)
        } catch (error) {
            // Opcional: mostrar error
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <Sparkles className="animate-spin w-10 h-10 text-green-400 mb-4" />
                <span className="text-gray-300">Cargando frase diaria...</span>
            </div>
        );
    }

    if (!daily) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <span className="text-red-400 text-lg font-semibold">
                    No hay frase diaria disponible.
                </span>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto mt-10 bg-gradient-to-br from-green-900 via-neutral-900 to-green-950 border border-green-700 rounded-2xl shadow-2xl p-8">

            <CreateFlashcardModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                flashcard={daily ? {
                        front: daily.phrase,
                        back: daily.phrase_translation,
                        example: `${daily.example} - ${daily.example_translation} `
                    } : undefined
                }
                onCreated={() => setAdded(true)}
            />

            <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-green-400" />
                <h2 className="text-2xl font-bold text-green-300">
                    Frase diaria
                </h2>
            </div>
            <div className="mb-6">
                <div className="text-2xl font-bold text-white mb-2 text-center">
                    {daily.phrase}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowRight className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 text-xl font-semibold">
                        {daily.phrase_translation}
                    </span>
                </div>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4 mb-4">
                <div className="text-green-200 text-base font-semibold mb-1">
                    Ejemplo:
                </div>
                <div className="text-white text-lg mb-2">
                    {daily.example}
                </div>
                {daily.example_translation && (
                    <div className="text-green-300 text-base">
                        <ArrowRight className="inline w-4 h-4 mr-1" />
                        {daily.example_translation}
                    </div>
                )}
            </div>
            <button
                onClick={handleAddFlashcard}
                disabled={added}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition
                    ${added
                        ? "bg-green-800 text-green-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
            >
                <PlusCircle className="w-5 h-5" />
                {added ? "Agregada a Flashcards" : "Agregar a Flashcards"}
            </button>
        </div>
    );
};

export default ViewDailyPhrase;