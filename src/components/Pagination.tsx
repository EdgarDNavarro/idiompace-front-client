import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "../schemas";

type PaginationProps = {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    className?: string;
};

export const Pagination: React.FC<PaginationProps> = ({
    meta,
    onPageChange,
    className = "",
}) => {

    const getPages = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let start = Math.max(1, meta.page - 2);
        let end = Math.min(meta.totalPages, start + maxPagesToShow - 1);

        if (end - start < maxPagesToShow - 1) {
            start = Math.max(1, end - maxPagesToShow + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <nav className={`flex items-center justify-center gap-2 mt-8 ${className}`}>
            <button
                className="p-2 rounded hover:bg-neutral-800 disabled:opacity-50"
                onClick={() => onPageChange(meta.page - 1)}
                disabled={meta.page === 1}
                aria-label="Anterior"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            {getPages().map((p) => (
                <button
                    key={p}
                    className={`px-3 py-1 rounded font-medium transition-colors ${
                        p === meta.page
                            ? "bg-green-600 text-white"
                            : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
                    }`}
                    onClick={() => onPageChange(p)}
                    disabled={p === meta.page}
                >
                    {p}
                </button>
            ))}
            <button
                className="p-2 rounded hover:bg-neutral-800 disabled:opacity-50"
                onClick={() => onPageChange(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                aria-label="Siguiente"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </nav>
    );
};