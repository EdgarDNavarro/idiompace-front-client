import React, { useEffect, useState } from "react";
import { createFlashcard, getDecks } from "../../services/flashcards";
import { Deck, Flashcard } from "../../schemas";
import { X, ArrowUpDown } from "lucide-react";

type CreateFlashcardModalProps = {
    open: boolean;
    deckId?: number;
    onClose: () => void;
    onCreated?: (flashcard: Flashcard) => void;
    flashcard?: Pick<Flashcard, "front" | "back" | "example">;
};

const CreateFlashcardModal: React.FC<CreateFlashcardModalProps> = ({
    open,
    deckId,
    onClose,
    onCreated,
    flashcard
}) => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [form, setForm] = useState({
        front: "",
        back: "",
        example: "",
        deckId: deckId || 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDecks = async () => {
            try {
                const data = await getDecks();
                setDecks(data);
            } catch (error) {
                console.log(error);
            } 
        };
        fetchDecks();
    }, []);

    useEffect(() => {
        if (flashcard) {
            setForm({
                front: flashcard.front,
                back: flashcard.back,
                example: flashcard.example,
                deckId: deckId || 0,
            });
        }
    }, [flashcard]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSwap = () => {
        setForm((prev) => ({
            ...prev,
            front: prev.back,
            back: prev.front,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if(form.deckId === 0) {
            setError("Deck ID is required.");
            return;
        }

        setLoading(true);
        setError(null);

        
        try {
            const flashcard = await createFlashcard(form);
            if (onCreated) onCreated(flashcard);
            setForm({ front: "", back: "", example: "", deckId: deckId || 0 });
            onClose();
        } catch {
            setError("No se pudo crear la flashcard.");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-8 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-400"
                >
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-green-400 mb-6 text-center">
                    Crear Flashcard
                </h2>

                {error && <div className="text-red-400 mb-2 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1">Frente</label>
                        <input
                            type="text"
                            name="front"
                            value={form.front}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleSwap}
                            className="text-sm text-gray-300 hover:text-green-400 transition"
                        >
                            <ArrowUpDown className="w-6 h-6" />
                        </button>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Reverso</label>
                        <input
                            type="text"
                            name="back"
                            value={form.back}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none"
                        />
                    </div>

                    {deckId === undefined && (
                        <div>
                            <label className="block text-gray-300 mb-1">Mazo</label>
                            <select
                                name="deckId"
                                value={form.deckId}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none"
                            >
                                <option value={0} disabled>Selecciona un mazo</option>

                                {decks.map(deck => (
                                    <option key={deck.id} value={deck.id}>{deck.name} ({deck.flashcardCount})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-300 mb-1">Ejemplo</label>
                        <textarea
                            name="example"
                            value={form.example}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
                    >
                        {loading ? "Creando..." : "Crear"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateFlashcardModal;
