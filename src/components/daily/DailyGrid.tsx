import React, { useEffect, useState } from "react";
import { DailySchema, Daily, PaginationMeta, paginationMetaSchema } from "../../schemas";
import { Sparkles, ArrowRight } from "lucide-react";
import api from "../../conf/axios";
import { Pagination } from "../Pagination";

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
};

const DailyGrid: React.FC = () => {
    const [dailies, setDailies] = useState<Daily[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });

        const fetchDailies = async (page = 1) => {

            try {
                const response = await api.get("/daily", {
                    params: { page, limit: meta.limit },
                });
                const parsed = DailySchema.array().safeParse(response.data.data);
                const parsedMeta = paginationMetaSchema.safeParse(response.data.meta);
                if (parsed.success) {
                    setDailies(parsed.data);
                }

                if (parsedMeta.success) {
                    setMeta(parsedMeta.data);
                }
            } catch (error) {
                setDailies([]);
            } 
        };

    useEffect(() => {

        fetchDailies();
    }, []);



    if (!dailies.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
                <span className="text-red-400 text-lg font-semibold">
                    No hay frases anteriores disponibles.
                </span>
            </div>
        );
    }

    return (
        <div className=" mx-auto mt-10">
            <h2 className="text-2xl font-bold text-green-400 mb-8 flex items-center gap-2">
                <Sparkles className="w-7 h-7" />
                Frases diarias anteriores
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                {dailies.map((daily) => (
                    <div
                        key={daily.id}
                        className="bg-gradient-to-br from-green-900 via-neutral-900 to-green-950 border border-green-700 rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs bg-green-800/40 text-green-200 px-3 py-1 rounded-full font-semibold">
                                {formatDate(daily.createdAt)}
                            </span>
                        </div>
                        <div className="text-xl font-bold text-white mb-2 text-center">
                            {daily.phrase}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <ArrowRight className="w-5 h-5 text-green-400" />
                            <span className="text-green-300 text-lg font-semibold">
                                {daily.phrase_translation}
                            </span>
                        </div>
                        <div className="bg-neutral-800 rounded-lg p-3 mb-2">
                            <div className="text-green-200 text-base font-semibold mb-1">
                                Ejemplo:
                            </div>
                            <div className="text-white text-base mb-1">
                                {daily.example}
                            </div>
                            {daily.example_translation && (
                                <div className="text-green-300 text-sm">
                                    <ArrowRight className="inline w-4 h-4 mr-1" />
                                    {daily.example_translation}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {meta && (
                <Pagination meta={meta} onPageChange={fetchDailies} />
            )}
        </div>
    );
};

export default DailyGrid;