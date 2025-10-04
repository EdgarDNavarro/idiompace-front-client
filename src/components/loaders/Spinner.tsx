import { BookOpen } from "lucide-react";

export function Spinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[30vh]">
            <BookOpen className="animate-spin w-10 h-10 text-green-400 mb-4" />
            <span className="text-gray-300">Cargando ...</span>
        </div>
    )
}