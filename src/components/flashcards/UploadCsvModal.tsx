import React, { useState, useRef } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { uploadFlashcardsCsv } from "../../services/flashcards";

interface UploadCsvModalProps {
    open: boolean;
    onClose: () => void;
    deckId: number;
    onUploaded: () => void;
}

const UploadCsvModal: React.FC<UploadCsvModalProps> = ({ open, onClose, deckId, onUploaded }) => {
    const [file, setFile] = useState<File | null>(null);
    const [delimiter, setDelimiter] = useState(",");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setError(null);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        // Validar que sea un archivo CSV
        if (!selectedFile.name.endsWith(".csv")) {
            setError("El archivo debe ser un CSV (.csv)");
            setFile(null);
            return;
        }

        // Validar el tamaño del archivo (máximo 5 MB)
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("El archivo no debe superar los 5 MB");
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!file) {
            setError("Debes seleccionar un archivo CSV");
            return;
        }

        setLoading(true);

        try {
            await uploadFlashcardsCsv(file, deckId, delimiter);
            onUploaded();
            handleClose();
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error al subir el archivo";
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setDelimiter(",");
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 rounded-xl shadow-lg w-full max-w-lg border border-neutral-800">
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                    <h3 className="text-xl font-semibold text-green-400">Subir Flashcards desde CSV</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Información del formato */}
                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 text-sm text-gray-300">
                        <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Formato del CSV
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>El archivo debe tener exactamente <strong>3 columnas</strong></li>
                            <li>Columna 1: <strong>Front</strong> (pregunta/término)</li>
                            <li>Columna 2: <strong>Back</strong> (respuesta/definición)</li>
                            <li>Columna 3: <strong>Example</strong> (ejemplo de uso)</li>
                            <li>No incluir encabezados, solo datos</li>
                            <li>Si el contenido tiene comas, usa <strong>comillas dobles</strong></li>
                            <li>Tamaño máximo: <strong>5 MB</strong></li>
                        </ul>
                        <div className="mt-3 bg-neutral-900 rounded p-2 font-mono text-xs space-y-1">
                            <div className="text-gray-400">Ejemplos:</div>
                            <div>Hello,Hola,Hello world!</div>
                            <div>"Hello, hi","Hola, buenos días","Hello, how are you?"</div>
                            <div>Apple,Manzana,"An apple a day, keeps the doctor away"</div>
                        </div>
                    </div>

                    {/* Selector de delimitador */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Delimitador
                        </label>
                        <select
                            value={delimiter}
                            onChange={(e) => setDelimiter(e.target.value)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            disabled={loading}
                        >
                            <option value=",">Coma (,)</option>
                            <option value=";">Punto y coma (;)</option>
                            <option value="\t">Tabulador</option>
                            <option value="|">Barra vertical (|)</option>
                        </select>
                    </div>

                    {/* Selector de archivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Archivo CSV
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-file-input"
                            disabled={loading}
                        />
                        <label
                            htmlFor="csv-file-input"
                            className="flex items-center justify-center gap-2 w-full bg-neutral-800 border-2 border-dashed border-neutral-700 hover:border-green-500 rounded-lg px-4 py-8 cursor-pointer transition text-gray-400 hover:text-green-400"
                        >
                            <Upload className="w-6 h-6" />
                            <span>
                                {file ? file.name : "Haz clic para seleccionar un archivo"}
                            </span>
                        </label>
                        {file && (
                            <div className="mt-2 text-sm text-gray-400">
                                Tamaño: {(file.size / 1024).toFixed(2)} KB
                            </div>
                        )}
                    </div>

                    {/* Mensaje de error */}
                    {error && (
                        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-300">{error}</span>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={loading || !file}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span>Subiendo...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span>Subir CSV</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadCsvModal;
