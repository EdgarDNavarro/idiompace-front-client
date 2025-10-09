import React, { useEffect, useState } from "react";
import { getDecks, createDeck } from "../../services/flashcards";
import { Deck } from "../../schemas";
import FlashcardHowItWorks from "./FlashcardHowItWorks";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ManageDecks: React.FC = () => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [deckName, setDeckName] = useState("");
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDecks = async () => {
            setLoading(true);
            try {
                const data = await getDecks();
                setDecks(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDecks();
    }, []);

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deckName.trim()) return;
        setCreating(true);
        setError(null);
        try {
            const newDeck = await createDeck(deckName.trim());
            setDecks(prev => [newDeck, ...prev]);
            setDeckName("");
            setModalOpen(false);
        } catch (err: any) {
            setError("No se pudo crear el mazo.");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">Tus mazos</h2>
            <div className="flex justify-center mb-6">
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                >
                    <PlusCircle className="w-5 h-5" />
                    Crear nuevo mazo
                </button>
            </div>

            {/* Modal para crear mazo */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-8 w-full max-w-md relative">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-400"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold text-green-400 mb-6 text-center">Crear Mazo</h2>
                        {error && <div className="text-red-400 mb-2 text-center">{error}</div>}
                        <form onSubmit={handleCreateDeck} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 mb-1">Nombre del mazo</label>
                                <input
                                    type="text"
                                    value={deckName}
                                    onChange={e => setDeckName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none"
                                    placeholder="Ejemplo: Verbos Irregulares"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
                            >
                                {creating ? "Creando..." : "Crear"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center text-gray-300">Cargando...</div>
            ) : decks.length === 0 ? (
                <div className="text-center text-gray-400">No tienes mazos aún.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {decks.map((deck) => (
                        <Link to={`/flashcards/deck/${deck.id}`}
                            key={deck.id}
                            className="bg-gradient-to-br from-green-900 via-neutral-900 to-green-950 border border-green-700 rounded-xl shadow p-5 flex flex-col justify-between min-h-[170px] relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="text-lg font-bold text-green-300 mb-2 text-center truncate">
                                    {deck.name}
                                </div>
                                <div className="text-xs bg-green-800/40 text-green-200 px-3 py-1 rounded-full font-semibold mb-2">
                                    {deck.flashcardCount ?? 0} tarjetas
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <FlashcardHowItWorks />
        </div>
    );
};

export default ManageDecks;