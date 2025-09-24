import React, { useState, useEffect } from "react";
import { updateFlashcard } from "../../services/flashcards";
import { Flashcard } from "../../schemas";
import { X } from "lucide-react";

type EditFlashcardModalProps = {
    open: boolean;
    onClose: () => void;
    flashcard: Flashcard | null;
    onUpdated?: (flashcard: Flashcard) => void;
};

const EditFlashcardModal: React.FC<EditFlashcardModalProps> = ({
    open,
    onClose,
    flashcard,
    onUpdated,
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
        if (!flashcard) return;
        setLoading(true);
        setError(null);
        try {
            const updated = await updateFlashcard(flashcard.id!, form);
            if (onUpdated) onUpdated(updated);
            onClose();
        } catch (err: any) {
            setError("No se pudo actualizar la flashcard.");
        } finally {
            setLoading(false);
        }
    };

    if (!open || !flashcard) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-8 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-400"
                >
                    <X className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-green-400 mb-6 text-center">Editar Flashcard</h2>
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
                        {loading ? "Guardando..." : "Guardar cambios"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditFlashcardModal;