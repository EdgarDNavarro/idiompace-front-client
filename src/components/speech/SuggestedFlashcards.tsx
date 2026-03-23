import { useState } from "react";
import { GeneratedFlashcard } from "../../schemas/speech";
import { Check, Save, X } from "lucide-react";
import CreateFlashcardModal from "../flashcards/CreateFlashcard";

type SuggestedFlashcardsProps = {
    flashcards: GeneratedFlashcard[];
    onClose: () => void;
    onSave: () => void;
};

const SuggestedFlashcards = ({ flashcards, onClose, onSave }: SuggestedFlashcardsProps) => {
    const [editingFlashcard, setEditingFlashcard] = useState<{ index: number; data: GeneratedFlashcard } | null>(null);
    const [savedCount, setSavedCount] = useState(0);
    const [createdFlashcards, setCreatedFlashcards] = useState<Set<number>>(new Set());



    const handleEdit = (index: number, flashcard: GeneratedFlashcard) => {
        setEditingFlashcard({ index, data: flashcard });
    };

    const handleSaveEdit = () => {
        if (editingFlashcard) {
            setCreatedFlashcards(prev => new Set(prev).add(editingFlashcard.index));
            setSavedCount(prev => prev + 1);
        }
        setEditingFlashcard(null);
    };

    if (flashcards.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-8 w-full max-w-md">
                    <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center">
                        No se encontraron flashcards
                    </h2>
                    <p className="text-gray-400 text-center mb-6">
                        La conversación fue muy corta o no contenía vocabulario relevante para crear flashcards.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 rounded transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-green-400">
                            Flashcards Sugeridas ({flashcards.length})
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-red-400 transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <p className="text-gray-400 mb-6 text-sm">
                        Haz clic en guardar para crear cada flashcard. Puedes crear la misma varias veces si lo deseas.
                        {savedCount > 0 && ` (${savedCount} ${savedCount === 1 ? 'creada' : 'creadas'})`}
                    </p>

                    <div className="space-y-4 mb-6">
                        {flashcards.map((flashcard, index) => (
                            <div
                                key={index}
                                className={`border rounded-lg p-4 transition ${
                                    createdFlashcards.has(index)
                                        ? "border-green-500 bg-green-900/10"
                                        : "border-neutral-700 bg-neutral-800/50"
                                }`}
                            >
                                <div className="flex items-start gap-3">

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-white font-semibold">
                                                        {flashcard.front}
                                                    </p>

                                                </div>
                                                <p className="text-gray-400 text-sm mb-2">
                                                    {flashcard.back}
                                                </p>
                                                <p className="text-gray-500 text-sm italic">
                                                    "{flashcard.example}"
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleEdit(index, flashcard)}
                                                className="text-blue-400 hover:text-blue-300 transition ml-2"
                                                title={createdFlashcards.has(index) ? "Crear otra vez" : "Guardar flashcard"}
                                            >
                                                <Save className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">

                        <button
                            onClick={onSave}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded transition flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de edición */}
            {editingFlashcard && (
                <CreateFlashcardModal
                    open={!!editingFlashcard}
                    onClose={() => setEditingFlashcard(null)}
                    onCreated={handleSaveEdit}
                    flashcard={editingFlashcard.data}
                />
            )}
        </>
    );
};

export default SuggestedFlashcards;
