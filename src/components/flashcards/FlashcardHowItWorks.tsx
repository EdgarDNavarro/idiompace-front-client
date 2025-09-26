import React, { useState } from "react";
import {
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRightLeft,
    Sparkles,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const FlashcardHowItWorks = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg mt-10 mx-auto">
            <button
                className="w-full flex items-center justify-between p-6 focus:outline-none"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <span className="flex items-center gap-2 text-2xl font-bold text-green-400">
                    <Sparkles className="w-6 h-6 text-green-400" />
                    ¿Cómo funcionan las flashcards?
                </span>
                {open ? (
                    <ChevronUp className="w-6 h-6 text-green-400" />
                ) : (
                    <ChevronDown className="w-6 h-6 text-green-400" />
                )}
            </button>
            {open && (
                <div className="px-8 pb-8">
                    <p className="text-gray-300 mb-6">
                        Nuestro sistema utiliza{" "}
                        <span className="font-semibold text-green-300">
                            Spaced Repetition
                        </span>{" "}
                        (Repetición Espaciada) para que aprendas de forma eficiente y
                        memorable.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Si respondes bien */}
                        <div className="bg-neutral-800 rounded-xl p-5 flex flex-col gap-3 border border-green-700/30">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                                <span className="font-semibold text-green-300">
                                    Si respondes bien
                                </span>
                            </div>
                            <ul className="text-gray-200 text-sm list-disc pl-5 space-y-1">
                                <li>
                                    La tarjeta se mostrará después de{" "}
                                    <span className="text-green-300 font-medium">
                                        más tiempo
                                    </span>
                                    .
                                </li>
                                <li>
                                    Ejemplo:{" "}
                                    <span className="text-green-200">
                                        1h → 2h → 10h → 1 día → 3 días...
                                    </span>
                                </li>
                                <li>
                                    Cada vez que aciertes,{" "}
                                    <span className="text-green-300 font-medium">
                                        el intervalo aumenta
                                    </span>
                                    .
                                </li>
                            </ul>
                            <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                                <Clock className="w-4 h-4" />
                                ¡Las tarjetas fáciles se repasan menos!
                            </div>
                        </div>
                        {/* Si respondes mal */}
                        <div className="bg-neutral-800 rounded-xl p-5 flex flex-col gap-3 border border-red-700/30">
                            <div className="flex items-center gap-2">
                                <XCircle className="w-6 h-6 text-red-400" />
                                <span className="font-semibold text-red-300">
                                    Si respondes mal
                                </span>
                            </div>
                            <ul className="text-gray-200 text-sm list-disc pl-5 space-y-1">
                                <li>
                                    La tarjeta volverá a aparecer{" "}
                                    <span className="text-red-300 font-medium">
                                        muy pronto
                                    </span>
                                    .
                                </li>
                                <li>
                                    Ejemplo:{" "}
                                    <span className="text-red-200">en 15 minutos</span>.
                                </li>
                                <li>
                                    El sistema{" "}
                                    <span className="text-red-300 font-medium">
                                        reduce el intervalo
                                    </span>{" "}
                                    para reforzar lo que no recuerdas.
                                </li>
                            </ul>
                            <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                                <ArrowRightLeft className="w-4 h-4" />
                                ¡Las difíciles aparecen más seguido!
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 bg-green-950/40 border border-green-800 rounded-lg p-4 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-green-400" />
                        <span className="text-green-200 text-base font-medium">
                            Así estudias de manera eficiente:{" "}
                            <span className="font-bold">
                                tu memoria a largo plazo mejora mucho más rápido
                            </span>{" "}
                            que con la simple repetición.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlashcardHowItWorks;
