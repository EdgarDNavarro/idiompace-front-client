import React, { useEffect, useState } from "react";
import { createFlashcard } from "../../services/flashcards";
import { Flashcard } from "../../schemas";
import { X } from "lucide-react";

type CreateFlashcardModalProps = {
    open: boolean;
    onClose: () => void;
    onCreated?: (flashcard: Flashcard) => void;
    flashcard?: Pick<Flashcard, "front" | "back" | "example" >;
};

const CreateFlashcardModal: React.FC<CreateFlashcardModalProps> = ({
    open,
    onClose,
    onCreated,
    flashcard
}) => {
    const [form, setForm] = useState({
        front: "",
        back: "",
        example: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (flashcard) {
            setForm({
                front: flashcard.front,
                back: flashcard.back,
                example: flashcard.example,
            });
        }
    }, [flashcard]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const flashcard = await createFlashcard(form);
            if (onCreated) onCreated(flashcard);
            setForm({ front: "", back: "", example: "" });
            onClose();
        } catch (err: any) {
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
                <h2 className="text-xl font-bold text-green-400 mb-6 text-center">Crear Flashcard</h2>
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