
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Book, AlertCircle, ExternalLink, Volume2 } from "lucide-react";
import { getEnglishWordDefinition } from "../../services/dictionaries";
import { EnglishEntry } from "../../schemas";

const English = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [wordData, setWordData] = useState<EnglishEntry[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const location = useLocation();

    // Obtener palabra de la URL query
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const queryWord = urlParams.get('word');
        if (queryWord) {
            setSearchTerm(queryWord);
            handleSearch(queryWord);
        }
    }, [location.search]);

    const handleSearch = async (word: string = searchTerm) => {
        if (!word.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const definition = await getEnglishWordDefinition(word.toLowerCase());
            setWordData(definition);
            
            // Actualizar URL sin recargar la página
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('word', word.toLowerCase());
            window.history.pushState({}, '', newUrl.toString());
        } catch (error) {
            console.error(error);
            setError(`Could not find definition for "${word}"`);
            setWordData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleWordClick = (word: string) => {
        setSearchTerm(word);
        handleSearch(word);
    };

    const openAudioSource = (sourceUrl: string) => {
        window.open(sourceUrl, '_blank');
    };

    return (
        <div>
            {/* Header y búsqueda */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-500 p-2 rounded-xl">
                        <Book className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-blue-400">English Dictionary</h1>
                        <p className="text-gray-400">Look up English word definitions and pronunciation</p>
                    </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search English word..."
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <button
                        onClick={() => handleSearch()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition-colors"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-400">Searching for definition...</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-300">{error}</span>
                    </div>
                </div>
            )}

            {/* Resultados */}
            {wordData && !loading && (
                <div className="space-y-6">
                    {wordData.map((entry, entryIndex) => (
                        <div key={entryIndex} className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                            {/* Palabra principal */}
                            <div className="mb-6">
                                <div className="flex items-center gap-4 mb-3">
                                    <h2 className="text-3xl font-bold text-blue-400 capitalize">{entry.word}</h2>
                                    {entry.phonetic && (
                                        <span className="bg-neutral-700 text-gray-300 px-3 py-1 rounded-lg text-lg font-mono">
                                            {entry.phonetic}
                                        </span>
                                    )}
                                </div>

                                {/* Fonética y audio */}
                                {entry.phonetics.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Pronunciation:</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {entry.phonetics.map((phonetic, phoneticIndex) => (
                                                <div key={phoneticIndex} className="flex items-center gap-2 bg-neutral-700 rounded-lg px-3 py-2">
                                                    {phonetic.text && (
                                                        <span className="font-mono text-gray-300">{phonetic.text}</span>
                                                    )}
                                                    {phonetic.sourceUrl && (
                                                        <button
                                                            onClick={() => openAudioSource(phonetic.sourceUrl!)}
                                                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                                            title="Open audio source"
                                                        >
                                                            <Volume2 className="w-4 h-4" />
                                                            <ExternalLink className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Significados por parte del discurso */}
                            <div className="space-y-6">
                                {entry.meanings.map((meaning, meaningIndex) => (
                                    <div key={meaningIndex}>
                                        {/* Parte del discurso */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-medium">
                                                {meaning.partOfSpeech}
                                            </span>
                                        </div>

                                        {/* Definiciones */}
                                        <div className="space-y-4">
                                            {meaning.definitions.map((definition, defIndex) => (
                                                <div key={defIndex} className="border-l-2 border-blue-500 pl-4">
                                                    <div className="flex items-start gap-3">
                                                        <span className="bg-neutral-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                                                            {defIndex + 1}
                                                        </span>
                                                        <div className="flex-1">
                                                            <p className="text-gray-200 leading-relaxed mb-2">
                                                                {definition.definition}
                                                            </p>
                                                            
                                                            {/* Ejemplo */}
                                                            {definition.example && (
                                                                <p className="text-gray-400 italic text-sm mb-3">
                                                                    <span className="text-blue-400 font-medium">Example:</span> "{definition.example}"
                                                                </p>
                                                            )}

                                                            {/* Sinónimos y Antónimos de la definición */}
                                                            {(definition.synonyms.length > 0 || definition.antonyms.length > 0) && (
                                                                <div className="space-y-2">
                                                                    {definition.synonyms.length > 0 && (
                                                                        <div>
                                                                            <span className="text-green-400 font-medium text-sm">Synonyms:</span>
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                {definition.synonyms.map((synonym, idx) => (
                                                                                    <button
                                                                                        key={idx}
                                                                                        onClick={() => handleWordClick(synonym)}
                                                                                        className="text-blue-300 hover:text-blue-200 hover:underline text-sm transition-colors"
                                                                                    >
                                                                                        {synonym}{idx < definition.synonyms.length - 1 ? ',' : ''}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {definition.antonyms.length > 0 && (
                                                                        <div>
                                                                            <span className="text-red-400 font-medium text-sm">Antonyms:</span>
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                {definition.antonyms.map((antonym, idx) => (
                                                                                    <button
                                                                                        key={idx}
                                                                                        onClick={() => handleWordClick(antonym)}
                                                                                        className="text-blue-300 hover:text-blue-200 hover:underline text-sm transition-colors"
                                                                                    >
                                                                                        {antonym}{idx < definition.antonyms.length - 1 ? ',' : ''}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Sinónimos y Antónimos generales del significado */}
                                        {(meaning.synonyms.length > 0 || meaning.antonyms.length > 0) && (
                                            <div className="mt-4 pt-4 border-t border-neutral-700">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {meaning.synonyms.length > 0 && (
                                                        <div>
                                                            <span className="text-green-400 font-medium text-sm">General Synonyms:</span>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {meaning.synonyms.map((synonym, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => handleWordClick(synonym)}
                                                                        className="text-blue-300 hover:text-blue-200 hover:underline text-sm transition-colors"
                                                                    >
                                                                        {synonym}{idx < meaning.synonyms.length - 1 ? ',' : ''}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {meaning.antonyms.length > 0 && (
                                                        <div>
                                                            <span className="text-red-400 font-medium text-sm">General Antonyms:</span>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {meaning.antonyms.map((antonym, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => handleWordClick(antonym)}
                                                                        className="text-blue-300 hover:text-blue-200 hover:underline text-sm transition-colors"
                                                                    >
                                                                        {antonym}{idx < meaning.antonyms.length - 1 ? ',' : ''}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Fuentes */}
                            {entry.sourceUrls.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-neutral-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-400">Sources:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {entry.sourceUrls.map((url, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => window.open(url, '_blank')}
                                                className="text-blue-400 hover:text-blue-300 text-sm hover:underline transition-colors"
                                            >
                                                Source {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Licencia */}
                            {entry.license && (
                                <div className="mt-4 text-xs text-gray-500">
                                    <span>License: </span>
                                    <button
                                        onClick={() => window.open(entry.license!.url, '_blank')}
                                        className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                    >
                                        {entry.license.name}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
 
export default English;