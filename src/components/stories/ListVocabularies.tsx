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
        <div className="w-full max-w-7xl mx-auto mt-8 mb-8">
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

            {/* Header Compacto */}
            <div className="flex items-center justify-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Story Vocabulary</h2>
            </div>

            {/* Grid Compacto: 1 col mobile, 2 tablet, 3 desktop, 4 XL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {vocabularies.map((vocab, idx) => (
                    <div
                        key={vocab.id ?? idx}
                        className="group relative overflow-hidden"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                        
                        <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-xl p-4 border border-neutral-700/50 flex flex-col gap-3 transition-all duration-200 group-hover:border-green-500/30 h-full">
                            {/* Palabra principal */}
                            <div className="text-base md:text-lg font-bold text-white truncate" title={vocab.vocabulary}>
                                {vocab.vocabulary}
                            </div>
                            
                            {/* Traducción */}
                            <div className="text-sm text-gray-400">
                                <span className="text-green-400 font-medium">{vocab.translation}</span>
                            </div>
                            
                            {/* Ejemplo - Compacto */}
                            <div className="bg-neutral-800/50 rounded-lg p-2.5 text-xs text-gray-300 leading-relaxed line-clamp-2" title={vocab.example}>
                                {vocab.example}
                            </div>
                            
                            {/* Botón Compacto */}
                            <button
                                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg  font-semibold transition-all duration-200 mt-auto
                                    ${added[idx]
                                        ? "bg-green-500/20 text-green-400 cursor-not-allowed border border-green-500/30"
                                        : "bg-green-600 hover:bg-green-500 text-white shadow-md hover:shadow-lg hover:shadow-green-500/20 hover:scale-105 active:scale-95"
                                    }`}
                                onClick={() => saveToFlashcards(vocab, idx)}
                                disabled={added[idx]}
                            >
                                <PlusCircle className="w-3.5 h-3.5" />
                                {added[idx] ? "Added" : "Add to Deck"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListVocabularies;