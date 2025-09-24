import React, { useEffect, useState } from "react";
import { getFlashcards, deleteFlashcard } from "../../services/flashcards";
import { Flashcard } from "../../schemas";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Pencil, Trash2, Plus, GraduationCap } from "lucide-react";
import CreateFlashcardModal from "./CreateFlashcard";
import EditFlashcardModal from "./EditFlashcard";

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const ManageFlashcards: React.FC = () => {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [showExample, setShowExample] = useState<{ [id: number]: boolean }>({});
    const [showBack, setShowBack] = useState<{ [id: number]: boolean }>({});
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);

    const handleEdit = (flashcard: Flashcard) => {
        setSelectedFlashcard(flashcard);
        setEditModalOpen(true);
    };

    const handleUpdated = (updated: Flashcard) => {
        setFlashcards(prev =>
            prev.map(f => (f.id === updated.id ? updated : f))
        );
    };

    useEffect(() => {
        const fetchFlashcards = async () => {
            setLoading(true);
            try {
                const data = await getFlashcards();
                setFlashcards(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchFlashcards();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta flashcard?")) return;
        await deleteFlashcard(id);
        setFlashcards(flashcards.filter(f => f.id !== id));
    };

    const handleToggleExample = (id: number) => {
        setShowExample(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleToggleBack = (id: number) => {
        setShowBack(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleCreated = async (flashcard: Flashcard) => {
        
        setFlashcards(prev => [flashcard, ...prev]);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">Tus Flashcards</h2>
            <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 mb-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition mr-4"
            >
                <Plus className="w-5 h-5" /> Crear Nueva Flashcard
            </button>

            <Link
                to="/flashcards/try"
                className="inline-flex items-center gap-2 mb-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
            >
                <GraduationCap className="w-5 h-5 " />
                Intentar
            </Link>

            <CreateFlashcardModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={handleCreated}
            />

            <EditFlashcardModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                flashcard={selectedFlashcard}
                onUpdated={handleUpdated}
            />

            {loading ? (
                <div className="text-center text-gray-300">Cargando...</div>
            ) : flashcards.length === 0 ? (
                <div className="text-center text-gray-400">No tienes flashcards aún.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {flashcards.map((f) => (
                        <div
                            key={f.id}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl shadow p-5 flex flex-col justify-between min-h-[170px] relative"
                        >
                            <div>
                                <div className="text-lg font-semibold text-white mb-2 truncate">{f.front}</div>
                                <div className="text-xs text-gray-400 mb-1">
                                    Creada: {formatDate(f.createdAt)}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    Actualizada: {formatDate(f.updatedAt)}
                                </div>
                                <button
                                    className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs mb-2"
                                    onClick={() => handleToggleExample(f.id!)}
                                >
                                    {showExample[f.id!] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {showExample[f.id!] ? "Ocultar ejemplo" : "Ver ejemplo"}
                                </button>
                                {showExample[f.id!] && (
                                    <div className="bg-neutral-800 rounded p-2 text-green-200 text-sm mb-2">
                                        {f.example}
                                    </div>
                                )}

                                <button
                                    className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs mb-2"
                                    onClick={() => handleToggleBack(f.id!)}
                                >
                                    {showBack[f.id!] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {showBack[f.id!] ? "Ocultar reverso" : "Ver reverso"}
                                </button>
                                {showBack[f.id!] && (
                                    <div className="bg-neutral-800 rounded p-2 text-green-200 text-sm mb-2">
                                        {f.back}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button
                                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition text-xs"
                                    onClick={() => handleEdit(f)}
                                >
                                    <Pencil className="w-4 h-4" /> Editar
                                </button>
                                <button
                                    className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition text-xs"
                                    onClick={() => handleDelete(f.id!)}
                                >
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageFlashcards;