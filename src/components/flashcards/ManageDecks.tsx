import React, { useEffect, useState } from "react";
import { getDecks, createDeck } from "../../services/flashcards";
import { Deck } from "../../schemas";
import FlashcardHowItWorks from "./FlashcardHowItWorks";
import { PlusCircle, Layers, ArrowRight, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const colorClasses = [
    "bg-gradient-to-br from-green-900 via-neutral-900 to-green-950 border-green-700",
    "bg-gradient-to-br from-blue-900 via-neutral-900 to-blue-950 border-blue-700",
    "bg-gradient-to-br from-purple-900 via-neutral-900 to-purple-950 border-purple-700",
    "bg-gradient-to-br from-yellow-900 via-neutral-900 to-yellow-950 border-yellow-700",
    "bg-gradient-to-br from-pink-900 via-neutral-900 to-pink-950 border-pink-700",
    "bg-gradient-to-br from-teal-900 via-neutral-900 to-teal-950 border-teal-700",
];

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
            <h2 className="text-4xl font-bold text-green-400 mb-6 text-center flex justify-center gap-3 items-center"><Layers className="w-10 h-10"/> Tus mazos </h2>
            <div className="flex justify-center mb-6 gap-4">
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
                >
                    <PlusCircle className="w-5 h-5" />
                    Crear nuevo mazo
                </button>

                <Link
                    to={`/flashcards/try/all`}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                    <GraduationCap className="w-5 h-5 " />
                    Estudiar flashcards
                </Link>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {decks.map((deck, idx) => (
                        <Link
                            to={`/flashcards/deck/${deck.id}`}
                            key={deck.id}
                            className="group relative w-full transition-transform duration-300 hover:-translate-x-2 hover:-translate-y-2 focus:outline-none"
                        >
                            {/* Cartas apiladas en el fondo */}
                            <div className={`absolute inset-0 translate-x-2 translate-y-2 rounded-xl ${colorClasses[idx % colorClasses.length]} opacity-40 transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4 border`} />
                            <div className={`absolute inset-0 translate-x-1 translate-y-1 rounded-xl ${colorClasses[idx % colorClasses.length]} opacity-60 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2 border`} />

                            {/* Carta principal */}
                            <div
                                className={`relative flex h-48 flex-col justify-between overflow-hidden p-6 shadow-lg transition-shadow duration-300 group-hover:shadow-xl border rounded-xl ${colorClasses[idx % colorClasses.length]}`}
                            >
                                {/* Patrón decorativo de fondo */}
                                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
                                <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-6 translate-y-6 rounded-full bg-black/10" />

                                {/* Contenido */}
                                <div className="relative z-10">
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                                            <Layers className="h-5 w-5 text-green-400" />
                                        </div>
                                    </div>
                                    <h3 className="text-balance text-xl font-semibold leading-tight text-white">{deck.name}</h3>
                                </div>

                                <div className="relative z-10 flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-bold text-green-200">{deck.flashcardCount ?? 0}</span>
                                        <span className="text-sm opacity-90 text-green-200">{deck.flashcardCount === "1" ? "tarjeta" : "tarjetas"}</span>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:translate-x-1">
                                        <ArrowRight className="h-5 w-5 text-green-400" />
                                    </div>
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