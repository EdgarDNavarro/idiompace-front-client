import React, { useState, useRef } from "react";
import { Upload, X, FileText, Image, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { generateFlashcardsFromPdf, generateFlashcardsFromImage, createFlashcard } from "../../services/flashcards";
import { GeneratedFlashcard } from "../../schemas/speech";

interface UploadAiModalProps {
    open: boolean;
    onClose: () => void;
    deckId: number;
    onUploaded: () => void;
}

type Tab = "pdf" | "image";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const UploadAiModal: React.FC<UploadAiModalProps> = ({ open, onClose, deckId, onUploaded }) => {
    const [tab, setTab] = useState<Tab>("pdf");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [flashcards, setFlashcards] = useState<GeneratedFlashcard[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTabChange = (newTab: Tab) => {
        setTab(newTab);
        setFile(null);
        setError(null);
        setFlashcards(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        setError(null);
        setFlashcards(null);

        if (!selected) {
            setFile(null);
            return;
        }

        if (selected.size > MAX_FILE_SIZE) {
            setError("El archivo no debe superar los 10 MB");
            setFile(null);
            return;
        }

        if (tab === "pdf" && selected.type !== "application/pdf") {
            setError("Debes seleccionar un archivo PDF");
            setFile(null);
            return;
        }

        if (tab === "image" && !ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
            setError("Formatos aceptados: JPG, PNG, WEBP, GIF");
            setFile(null);
            return;
        }

        setFile(selected);
    };

    const handleGenerate = async () => {
        if (!file) return;
        setError(null);
        setLoading(true);

        try {
            if (tab === "pdf") {
                const result = await generateFlashcardsFromPdf(file);
                setFlashcards(result.data);
            } else {
                const result = await generateFlashcardsFromImage(file);
                setFlashcards(result.data);
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || "Error al procesar el archivo";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = (index: number) => {
        setFlashcards(prev => prev!.filter((_, i) => i !== index));
    };

    const handleSaveAll = async () => {
        if (!flashcards || flashcards.length === 0) return;
        setSaving(true);

        try {
            await Promise.all(
                flashcards.map(fc => createFlashcard({ ...fc, deckId }))
            );
            onUploaded();
            handleClose();
        } catch (err: any) {
            const msg = err.response?.data?.error || "Error al guardar las flashcards";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setTab("pdf");
        setFile(null);
        setError(null);
        setFlashcards(null);
        setLoading(false);
        setSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    };

    if (!open) return null;

    const accept = tab === "pdf" ? ".pdf" : ".jpg,.jpeg,.png,.webp,.gif";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-xl shadow-lg w-full max-w-2xl border border-neutral-800 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800 flex-shrink-0">
                    <h3 className="text-xl font-semibold text-green-400">Generar Flashcards con IA</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-white transition" disabled={loading || saving}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-800 flex-shrink-0">
                    <button
                        onClick={() => handleTabChange("pdf")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
                            tab === "pdf"
                                ? "text-green-400 border-b-2 border-green-400"
                                : "text-gray-400 hover:text-gray-200"
                        }`}
                        disabled={loading || saving}
                    >
                        <FileText className="w-4 h-4" /> PDF
                    </button>
                    <button
                        onClick={() => handleTabChange("image")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
                            tab === "image"
                                ? "text-green-400 border-b-2 border-green-400"
                                : "text-gray-400 hover:text-gray-200"
                        }`}
                        disabled={loading || saving}
                    >
                        <Image className="w-4 h-4" /> Imagen
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {/* Info */}
                    {!flashcards && (
                        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 text-sm text-gray-300">
                            {tab === "pdf" ? (
                                <>
                                    <p className="text-green-400 font-semibold mb-1 flex items-center gap-2"><FileText className="w-4 h-4" /> PDF</p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                                        <li>Máximo <strong>10 páginas</strong></li>
                                        <li>Tamaño máximo: <strong>10 MB</strong></li>
                                        <li>La IA extraerá vocabulario e idioms del texto</li>
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <p className="text-green-400 font-semibold mb-1 flex items-center gap-2"><Image className="w-4 h-4" /> Imagen</p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                                        <li>Formatos: <strong>JPG, PNG, WEBP, GIF</strong></li>
                                        <li>Tamaño máximo: <strong>10 MB</strong></li>
                                        <li>La IA analizará el texto visible en la imagen</li>
                                    </ul>
                                </>
                            )}
                        </div>
                    )}

                    {/* File picker (hidden when flashcards are shown) */}
                    {!flashcards && (
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={accept}
                                onChange={handleFileChange}
                                className="hidden"
                                id="ai-file-input"
                                disabled={loading}
                            />
                            <label
                                htmlFor="ai-file-input"
                                className="flex items-center justify-center gap-2 w-full bg-neutral-800 border-2 border-dashed border-neutral-700 hover:border-green-500 rounded-lg px-4 py-8 cursor-pointer transition text-gray-400 hover:text-green-400"
                            >
                                <Upload className="w-6 h-6" />
                                <span>{file ? file.name : "Haz clic para seleccionar un archivo"}</span>
                            </label>
                            {file && (
                                <p className="mt-2 text-xs text-gray-400">
                                    Tamaño: {(file.size / 1024).toFixed(1)} KB
                                </p>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-300">{error}</span>
                        </div>
                    )}

                    {/* Flashcards preview */}
                    {flashcards && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-gray-300">
                                    <span className="text-green-400 font-semibold">{flashcards.length}</span> flashcards generadas
                                </p>
                                <button
                                    onClick={() => { setFlashcards(null); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                    className="text-xs text-gray-400 hover:text-white transition"
                                    disabled={saving}
                                >
                                    Subir otro archivo
                                </button>
                            </div>
                            {flashcards.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-4">No se generaron flashcards. Intenta con otro archivo.</p>
                            ) : (
                                <div className="space-y-3">
                                    {flashcards.map((fc, i) => (
                                        <div key={i} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 flex gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-semibold text-sm truncate">{fc.front}</p>
                                                <p className="text-gray-400 text-sm">{fc.back}</p>
                                                <p className="text-gray-500 text-xs italic mt-1">"{fc.example}"</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(i)}
                                                className="text-gray-500 hover:text-red-400 transition flex-shrink-0"
                                                disabled={saving}
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-800 flex gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition"
                        disabled={loading || saving}
                    >
                        Cancelar
                    </button>

                    {!flashcards ? (
                        <button
                            onClick={handleGenerate}
                            disabled={!file || loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span>Generar Flashcards</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleSaveAll}
                            disabled={saving || flashcards.length === 0}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <span>Guardar {flashcards.length} flashcard{flashcards.length !== 1 ? "s" : ""}</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadAiModal;
