import React, { useState } from "react";
import { Vocabulary } from "../../schemas";
import CreateFlashcardModal from "../flashcards/CreateFlashcard";
import { BookOpen, PlusCircle } from "lucide-react";

type ListVocabulariesProps = {
    vocabularies: Vocabulary[];
};

const ListVocabularies: React.FC<ListVocabulariesProps> = ({ vocabularies }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVocab, setSelectedVocab] = useState<{ vocab: Vocabulary | undefined; idx: number }>({ vocab: undefined, idx: -1 });
    const [added, setAdded] = useState<boolean[]>(Array(vocabularies.length).fill(false));

    const saveToFlashcards = (vocab: Vocabulary, idx: number) => {
        if (added[idx]) return;
        setSelectedVocab({ vocab, idx });
        setModalOpen(true);
    };

    const onCreatedFlashcard = () => {
        if (selectedVocab.idx === -1) return;
        const newAdded = [...added];
        newAdded[selectedVocab.idx] = true;
        setAdded(newAdded);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-10 space-y-6 mb-6">
            <CreateFlashcardModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                flashcard={
                    selectedVocab.vocab
                        ? {
                              front: selectedVocab.vocab.vocabulary,
                              back: selectedVocab.vocab.translation,
                              example: selectedVocab.vocab.example,
                          }
                        : undefined
                }
                onCreated={onCreatedFlashcard}
            />

            <div className="flex items-center justify-center gap-3 mb-8">
                <BookOpen className="w-8 h-8 text-green-400" />
                <h2 className="text-3xl font-bold text-green-300">Vocabulario de la historia</h2>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vocabularies.map((vocab, idx) => (
                    <div
                        key={vocab.id ?? idx}
                        className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-green-950 rounded-2xl p-6 flex flex-col gap-4 shadow-lg border border-green-700 transition-all hover:shadow-2xl"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="text-xl font-bold text-green-300">{vocab.vocabulary}</div>
                            <div className="text-green-400 text-base font-semibold">
                                Traducción: <span className="text-white">{vocab.translation}</span>
                            </div>
                            <div className="bg-neutral-800 rounded-lg p-3 text-green-200 text-sm">
                                Ejemplo: <span className="text-white">{vocab.example}</span>
                            </div>
                        </div>
                        <button
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition
                                ${added[idx]
                                    ? "bg-green-800 text-green-300 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                            onClick={() => saveToFlashcards(vocab, idx)}
                            disabled={added[idx]}
                        >
                            <PlusCircle className="w-5 h-5" />
                            {added[idx] ? "Agregada a Flashcards" : "Agregar a Flashcards"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListVocabularies;