import React, { useEffect, useState } from "react";
import { getFlashcards, deleteFlashcard, deleteDeck } from "../../services/flashcards";
import { Flashcard } from "../../schemas";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Pencil, Trash2, Plus, GraduationCap, ArrowLeft, FileUp, Sparkles } from "lucide-react";
import CreateFlashcardModal from "./CreateFlashcard";
import EditFlashcardModal from "./EditFlashcard";
import UploadCsvModal from "./UploadCsvModal";
import UploadAiModal from "./UploadAiModal";

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
};

const FlashcardsDeck: React.FC = () => {
    const { deckId } = useParams();
    const navigate = useNavigate()
    
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [showExample, setShowExample] = useState<{ [id: number]: boolean }>({});
    const [showBack, setShowBack] = useState<{ [id: number]: boolean }>({});
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [uploadCsvModalOpen, setUploadCsvModalOpen] = useState(false);
    const [uploadAiModalOpen, setUploadAiModalOpen] = useState(false);

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
                const data = await getFlashcards(deckId as string);
                setFlashcards(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        if(deckId) {
            fetchFlashcards();
        }
        
    }, [deckId]);

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

    const handleCsvUploaded = async () => {
        // Recargar las flashcards después de subir el CSV
        setLoading(true);
        try {
            const data = await getFlashcards(deckId as string);
            setFlashcards(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDeck = async () => {
        if (!deckId) return;
        if (!window.confirm("¿Seguro que deseas eliminar este deck y todas sus flashcards? No se puede revertir")) return;
        await deleteDeck(deckId);
        navigate("/flashcards")
    }

    return (
        <div >
            {/* Header con CTA Principal */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/flashcards")}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 text-gray-300 hover:text-white hover:border-neutral-600 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold text-white">Your Flashcards</h2>
                    </div>
                </div>

                {/* CTA Principal - Estudiar/Intentar */}
                <Link
                    to={`/flashcards/try/${deckId}`}
                    className="flex items-center justify-center gap-3 bg-green-500/10 backdrop-blur-xl border-2 border-green-500/30 hover:border-green-500/50 text-white px-8 py-5 rounded-2xl font-semibold text-lg transition-all duration-200 hover:bg-green-500/20 active:scale-[0.98] mb-6"
                >
                    <GraduationCap className="w-6 h-6" />
                    <span>Start Study Session</span>
                </Link>

                {/* Barra de Acciones Secundarias */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/50 text-white hover:bg-green-600/30 hover:border-green-500/70 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" /> Create Card
                        </button>

                        <button
                            onClick={() => setUploadCsvModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/50 text-white hover:bg-blue-600/30 hover:border-blue-500/70 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-medium"
                        >
                            <FileUp className="w-4 h-4" /> Import CSV
                        </button>

                        <button
                            onClick={() => setUploadAiModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/50 text-white hover:bg-purple-600/30 hover:border-purple-500/70 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-medium"
                        >
                            <Sparkles className="w-4 h-4" /> AI Import
                        </button>
                    </div>

                    <button
                        className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500/70 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-medium"
                        onClick={() => handleDeleteDeck()}
                    >
                        <Trash2 className="w-4 h-4" /> Delete Deck
                    </button>
                </div>
            </div>
            
            {deckId && (
                <>
                    <CreateFlashcardModal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        onCreated={handleCreated}
                        deckId={Number(deckId)}
                    />
                    <UploadCsvModal
                        open={uploadCsvModalOpen}
                        onClose={() => setUploadCsvModalOpen(false)}
                        deckId={Number(deckId)}
                        onUploaded={handleCsvUploaded}
                    />
                    <UploadAiModal
                        open={uploadAiModalOpen}
                        onClose={() => setUploadAiModalOpen(false)}
                        deckId={Number(deckId)}
                        onUploaded={handleCsvUploaded}
                    />
                </>
            )}

            <EditFlashcardModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                flashcard={selectedFlashcard}
                onUpdated={handleUpdated}
            />

            {loading ? (
                <div className="text-center text-gray-300 py-12">Loading...</div>
            ) : flashcards.length === 0 ? (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-800/50 mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-lg mb-2">No flashcards yet</p>
                    <p className="text-gray-500 text-sm">Create your first card to start learning!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {flashcards.map((f) => (
                        <div
                            key={f.id}
                            className="group relative"
                        >
                            {/* Glow effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            
                            <div className="relative bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/50 rounded-xl shadow-lg p-4 flex flex-col justify-between min-h-[200px] transition-all duration-200 group-hover:border-green-500/30">
                                <div className="flex-1">
                                    {/* Front */}
                                    <div className="text-base font-semibold text-white mb-3 line-clamp-2">{f.front}</div>
                                    
                                    {/* Fechas */}
                                    <div className="space-y-1 mb-3">
                                        <div className="text-xs text-gray-400">
                                            Last: <span className="text-gray-300">{formatDate(f.lastReviewedAt)}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Next: <span className="text-gray-400">{formatDate(f.nextReviewAt)}</span>
                                        </div>
                                    </div>

                                    {/* Toggle Example */}
                                    <button
                                        className="flex items-center gap-1.5 text-green-400 hover:text-green-300 text-xs mb-2 transition-colors"
                                        onClick={() => handleToggleExample(f.id!)}
                                    >
                                        {showExample[f.id!] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {showExample[f.id!] ? "Hide example" : "Show example"}
                                    </button>
                                    {showExample[f.id!] && (
                                        <div className="bg-neutral-800/50 rounded-lg p-2.5 text-gray-300 text-xs mb-2 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                                            {f.example}
                                        </div>
                                    )}

                                    {/* Toggle Back */}
                                    <button
                                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs mb-2 transition-colors"
                                        onClick={() => handleToggleBack(f.id!)}
                                    >
                                        {showBack[f.id!] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {showBack[f.id!] ? "Hide back" : "Show back"}
                                    </button>
                                    {showBack[f.id!] && (
                                        <div className="bg-neutral-800/50 rounded-lg p-2.5 text-gray-300 text-xs mb-2 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                                            {f.back}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-700/30">
                                    <button
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/50 px-3 py-2 rounded-lg transition-all text-xs font-medium hover:scale-105 active:scale-95"
                                        onClick={() => handleEdit(f)}
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 hover:border-red-500/50 px-3 py-2 rounded-lg transition-all text-xs font-medium hover:scale-105 active:scale-95"
                                        onClick={() => handleDelete(f.id!)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlashcardsDeck;