import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, Book, AlertCircle } from "lucide-react";
import { getSpanishWordDefinition } from "../../services/dictionaries";
import { RaeSchema } from "../../schemas";
import { z } from "zod";

type RaeData = z.infer<typeof RaeSchema>;

const Spanish = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [wordData, setWordData] = useState<RaeData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedConjugations, setExpandedConjugations] = useState<{[key: number]: boolean}>({});
    
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
            const definition = await getSpanishWordDefinition(word.toLowerCase());
            setWordData(definition);
            
            // Actualizar URL sin recargar la página
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('word', word.toLowerCase());
            window.history.pushState({}, '', newUrl.toString());
        } catch (error) {
            console.error(error);
            setError(`No se pudo encontrar la definición de "${word}"`);
            setWordData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleWordClick = (word: string) => {
        setSearchTerm(word);
        handleSearch(word);
    };

    const toggleConjugations = (meaningIndex: number) => {
        setExpandedConjugations(prev => ({
            ...prev,
            [meaningIndex]: !prev[meaningIndex]
        }));
    };

    const renderConjugationTable = (conjugations: any, title: string) => {
        if (!conjugations) return null;
        
        return (
            <div className="mb-4">
                <h6 className="font-semibold text-green-400 mb-2">{title}</h6>
                <div className="grid grid-cols-2 gap-2 ">
                    {Object.entries(conjugations).map(([person, form]) => (
                        <div key={person} className="flex justify-between border-b border-neutral-700 pb-1">
                            <span className="text-gray-400 capitalize text-sm ">{person.replace(/_/g, ' ')}:</span>
                            <span className="text-gray-200">{form as string}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div >
            {/* Header y búsqueda */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-500 p-2 rounded-xl">
                        <Book className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-green-400">Diccionario Español</h1>
                        <p className="text-gray-400">Consulta definiciones de la Real Academia Española</p>
                    </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Buscar palabra en español..."
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <button
                        onClick={() => handleSearch()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md transition-colors"
                    >
                        Buscar
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    <span className="ml-3 text-gray-400">Buscando definición...</span>
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
                <div >

                    {/* Significados */}
                    {wordData.meanings.map((meaning, meaningIndex) => (
                        <div key={meaningIndex} className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                            {/* Origen */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <h2 className="text-3xl font-bold text-green-400 mb-2 capitalize">{wordData.word}</h2>
                                    {meaning.origin?.type && (
                                        <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-medium">
                                            {meaning.origin?.type || ""}
                                        </span>
                                    )}

                                    {meaning.origin?.voice && (
                                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                                            {meaning.origin.voice}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-300">{meaning.origin?.text}</p>
                            </div>

                            {/* Acepciones */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold text-green-400">Acepciones:</h4>
                                {meaning.senses.map((sense, senseIndex) => (
                                    <div key={senseIndex} className="border-l-2 border-green-500 pl-4 ">
                                        <div className="flex items-start gap-3 mb-2">
                                            <span className="bg-neutral-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                                                {sense.meaning_number}
                                            </span>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    <span className="bg-neutral-700 text-gray-300 px-2 py-1 rounded text-xs">
                                                        {sense.category}
                                                    </span>
                                                    {sense.usage && (
                                                        <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
                                                            {sense.usage}
                                                        </span>
                                                    )}
                                                    {sense.verb_category && (
                                                        <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                                                            {sense.verb_category}
                                                        </span>
                                                    )}
                                                    <p className="text-gray-200 leading-relaxed">{sense.description}</p>
                                                </div>
                                                
                                            </div>
                                        </div>

                                        {/* Sinónimos y Antónimos */}
                                        {(sense.synonyms || sense.antonyms) && (
                                            <div className="mt-3 ">
                                                {sense.synonyms && sense.synonyms.length > 0 && (
                                                    <div>
                                                        <span className="text-green-400 font-medium ">Sinónimos:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {sense.synonyms.map((synonym, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleWordClick(synonym)}
                                                                    className="text-blue-300 hover:text-blue-200 hover:underline  transition-colors"
                                                                >
                                                                    {synonym}{idx < sense.synonyms!.length - 1 ? ',' : ''}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {sense.antonyms && sense.antonyms.length > 0 && (
                                                    <div>
                                                        <span className="text-red-400 font-medium ">Antónimos:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {sense.antonyms.map((antonym, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handleWordClick(antonym)}
                                                                    className="text-blue-300 hover:text-blue-200 hover:underline  transition-colors"
                                                                >
                                                                    {antonym}{idx < sense.antonyms!.length - 1 ? ',' : ''}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Conjugaciones (acordeón) */}
                            {meaning.conjugations && (
                                <div className="mt-6 border-t border-neutral-700 pt-4">
                                    <button
                                        onClick={() => toggleConjugations(meaningIndex)}
                                        className="flex items-center justify-between w-full text-left text-2xl text-green-400 font-semibold hover:text-green-300 transition-colors"
                                    >
                                        <span>Conjugaciones del verbo</span>
                                        {expandedConjugations[meaningIndex] ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </button>
                                    
                                    {expandedConjugations[meaningIndex] && (
                                        <div className="mt-4 space-y-6">
                                            {/* Formas no personales */}
                                            {meaning.conjugations.non_personal && (
                                                <div>
                                                    <h5 className="font-semibold text-green-400 mb-3 text-2xl">Formas no personales</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <div>
                                                            <span className="text-gray-400 text-sm">Infinitivo:</span>
                                                            <span className="text-gray-200 ml-2">{meaning.conjugations.non_personal.infinitive}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 text-sm">Participio:</span>
                                                            <span className="text-gray-200 ml-2">{meaning.conjugations.non_personal.participle}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400 text-sm">Gerundio:</span>
                                                            <span className="text-gray-200 ml-2">{meaning.conjugations.non_personal.gerund}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Modo Indicativo */}
                                            {meaning.conjugations.indicative && (
                                                <div>
                                                    <h5 className="font-semibold text-green-400 mb-3 text-2xl">Modo Indicativo</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                                                        {renderConjugationTable(meaning.conjugations.indicative.present, "Presente")}
                                                        {renderConjugationTable(meaning.conjugations.indicative.imperfect, "Pretérito imperfecto")}
                                                        {renderConjugationTable(meaning.conjugations.indicative.preterite, "Pretérito perfecto simple")}
                                                        {renderConjugationTable(meaning.conjugations.indicative.future, "Futuro")}
                                                        {renderConjugationTable(meaning.conjugations.indicative.conditional, "Condicional")}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Modo Subjuntivo */}
                                            {meaning.conjugations.subjunctive && (
                                                <div>
                                                    <h5 className="font-semibold text-green-400 mb-3 text-2xl">Modo Subjuntivo</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                                                        {renderConjugationTable(meaning.conjugations.subjunctive.present, "Presente")}
                                                        {renderConjugationTable(meaning.conjugations.subjunctive.imperfect, "Pretérito imperfecto")}
                                                        {renderConjugationTable(meaning.conjugations.subjunctive.future, "Futuro")}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Modo Imperativo */}
                                            {meaning.conjugations.imperative && (
                                                <div>
                                                    <h5 className="font-semibold text-green-400 mb-3 text-2xl">Modo Imperativo</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="flex gap-2 items-center border-r pr-4 border-neutral-700">
                                                            <span className="text-gray-400 text-sm">Tú:</span>
                                                            <span className="text-gray-200">{meaning.conjugations.imperative.singular_second_person}</span>
                                                        </div>
                                                        <div className="flex gap-2 items-center border-r pr-4 border-neutral-700">
                                                            <span className="text-gray-400 text-sm">Usted:</span>
                                                            <span className="text-gray-200">{meaning.conjugations.imperative.singular_formal_second_person}</span>
                                                        </div>
                                                        <div className="flex gap-2 items-center border-r pr-4 border-neutral-700">
                                                            <span className="text-gray-400 text-sm">Vosotros:</span>
                                                            <span className="text-gray-200">{meaning.conjugations.imperative.plural_second_person}</span>
                                                        </div>
                                                        <div className="flex gap-2 items-center border-r pr-4 border-neutral-700">
                                                            <span className="text-gray-400 text-sm">Ustedes:</span>
                                                            <span className="text-gray-200">{meaning.conjugations.imperative.plural_formal_second_person}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
 
export default Spanish;