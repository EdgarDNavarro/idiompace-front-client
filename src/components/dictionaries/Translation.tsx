import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Search, Languages, AlertCircle, Volume2, ArrowRightLeft, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";
import { getTranslation } from "../../services/dictionaries";
import { TranslationAPI } from "../../schemas";

const languages = {
    en: "English",
    es: "Spanish",
}
type LanguageCode = keyof typeof languages;

const parseLanguageCode = (code: string): LanguageCode => {
    if (code in languages) {
        return code as LanguageCode;
    }
    return "en"; 
}

const Translation = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [translationData, setTranslationData] = useState<TranslationAPI | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>("en");
    const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("es");
    const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
        translations: true,
        definitions: true,
        allTranslations: false
    });

    // Audio states
    const [isPlaying, setIsPlaying] = useState<{[key: string]: boolean}>({});
    const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});
    
    const location = useLocation();

    // Obtener traducción de la URL query
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const queryText = urlParams.get('text');
        const queryFrom = urlParams.get('from');
        const queryTo = urlParams.get('to');
        
        if (queryText) {
            setSearchTerm(queryText);

            if (queryFrom) setSourceLanguage(parseLanguageCode(queryFrom));
            if (queryTo) setTargetLanguage(parseLanguageCode(queryTo));

            let from = queryFrom ? parseLanguageCode(queryFrom) : sourceLanguage;
            let to = queryTo ? parseLanguageCode(queryTo) : targetLanguage;

            if(from === to) {
                to = 'es'
                from = 'en'
                setTargetLanguage(to);
                setSourceLanguage(from);
            }

            handleTranslate(queryText, from, to);
        }
    }, [location.search]);

    const handleTranslate = async (text: string = searchTerm, from: LanguageCode = sourceLanguage, to: LanguageCode = targetLanguage) => {
        if (!text.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const translation = await getTranslation(text.trim(), from, to);
            setTranslationData(translation);
            
        } catch (error) {
            console.error(error);
            setError(`Could not translate "${text}"`);
            setTranslationData(null);
        } finally {
            setLoading(false);
        }
    };

    const swapLanguages = () => {
        const newSource = targetLanguage;
        const newTarget = sourceLanguage;
        setSourceLanguage(newSource);
        setTargetLanguage(newTarget);
        
        if (translationData) {
            setSearchTerm(translationData["destination-text"]);
            handleTranslate(translationData["destination-text"], newSource, newTarget);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const playAudio = async (audioUrl: string, audioId: string) => {
        try {
            // Pausar otros audios
            Object.keys(audioRefs.current).forEach(key => {
                if (key !== audioId && audioRefs.current[key]) {
                    audioRefs.current[key].pause();
                    setIsPlaying(prev => ({ ...prev, [key]: false }));
                }
            });

            if (!audioRefs.current[audioId]) {
                audioRefs.current[audioId] = new Audio(audioUrl);
                
                audioRefs.current[audioId].onended = () => {
                    setIsPlaying(prev => ({ ...prev, [audioId]: false }));
                };
                
                audioRefs.current[audioId].onerror = () => {
                    setIsPlaying(prev => ({ ...prev, [audioId]: false }));
                    console.error('Error loading audio');
                };
            }

            if (isPlaying[audioId]) {
                audioRefs.current[audioId].pause();
                setIsPlaying(prev => ({ ...prev, [audioId]: false }));
            } else {
                await audioRefs.current[audioId].play();
                setIsPlaying(prev => ({ ...prev, [audioId]: true }));
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsPlaying(prev => ({ ...prev, [audioId]: false }));
        }
    };

    const handleWordClick = (word: string, from?: LanguageCode, to?: LanguageCode) => {
        setSearchTerm(word);
        handleTranslate(word, from, to);

        if (from) setSourceLanguage(from);
        if (to) setTargetLanguage(to);
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-purple-500 p-2 rounded-xl">
                        <Languages className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-purple-400">Translator & Dictionary</h1>
                        <p className="text-gray-400">Translate text with definitions, synonyms, and pronunciation</p>
                    </div>
                </div>

                {/* Selector de idiomas */}
                <div className="flex items-center gap-4 mb-4">
                    <div
                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                        {languages[sourceLanguage]}
                    </div>

                    <button
                        onClick={swapLanguages}
                        className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                        title="Swap languages"
                    >
                        <ArrowRightLeft className="w-5 h-5" />
                    </button>

                    <div
                        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                        {languages[targetLanguage]}
                    </div>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTranslate()}
                        placeholder="Enter text to translate..."
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <button
                        onClick={() => handleTranslate()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-md transition-colors"
                    >
                        Translate
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    <span className="ml-3 text-gray-400">Translating...</span>
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
            {translationData && !loading && (
                <div className="space-y-6">
                    {/* Traducción principal */}
                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Texto original */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm text-gray-400 uppercase tracking-wide">
                                        {languages[parseLanguageCode(translationData["source-language"])] || translationData["source-language"]}
                                    </span>
                                    {translationData.pronunciation["source-text-audio"] && (
                                        <button
                                            onClick={() => playAudio(translationData.pronunciation["source-text-audio"]!, 'source-audio')}
                                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            {isPlaying['source-audio'] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xl text-gray-200 mb-2">{translationData["source-text"]}</p>
                                {translationData.pronunciation["source-text-phonetic"] && (
                                    <p className="text-gray-400 font-mono text-sm">
                                        /{translationData.pronunciation["source-text-phonetic"]}/
                                    </p>
                                )}
                            </div>

                            {/* Traducción */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-sm text-gray-400 uppercase tracking-wide">
                                        {languages[parseLanguageCode(translationData["destination-language"])] || translationData["destination-language"]}
                                    </span>
                                    {translationData.pronunciation["destination-text-audio"] && (
                                        <button
                                            onClick={() => playAudio(translationData.pronunciation["destination-text-audio"]!, 'dest-audio')}
                                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                            {isPlaying['dest-audio'] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xl text-purple-300 font-medium">{translationData["destination-text"]}</p>
                            </div>
                        </div>
                    </div>

                    {/* Traducciones posibles */}
                    {translationData.translations["possible-translations"] && translationData.translations["possible-translations"].length > 0 && (
                        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                            <button
                                onClick={() => toggleSection('translations')}
                                className="flex items-center justify-between w-full text-left text-purple-400 font-semibold hover:text-purple-300 transition-colors mb-4"
                            >
                                <span>Alternative Translations</span>
                                {expandedSections.translations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            
                            {expandedSections.translations && (
                                <div className="flex flex-wrap gap-2">
                                    {translationData.translations["possible-translations"].map((translation, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleWordClick(translation, targetLanguage, sourceLanguage)}
                                            className="bg-neutral-700 hover:bg-neutral-600 text-gray-300 px-3 py-1 rounded-lg text-sm transition-colors"
                                        >
                                            {translation}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Definiciones */}
                    {(translationData.definitions && translationData.definitions.length > 0) && (
                        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                            <button
                                onClick={() => toggleSection('definitions')}
                                className="flex items-center justify-between w-full text-left text-purple-400 font-semibold hover:text-purple-300 transition-colors mb-4"
                            >
                                <span>Definitions</span>
                                {expandedSections.definitions ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            
                            {expandedSections.definitions && (
                                <div className="space-y-4">
                                    {translationData.definitions.map((definition, idx) => (
                                        <div key={idx} className="border-l-2 border-purple-500 pl-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm font-medium">
                                                    {definition["part-of-speech"]}
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-200 mb-2">{definition.definition}</p>
                                            
                                            {definition.example && (
                                                <p className="text-gray-400 italic text-sm mb-2">
                                                    <span className="text-purple-400 font-medium">Example:</span> "{definition.example}"
                                                </p>
                                            )}

                                            {definition["other-examples"] && definition["other-examples"].length > 0 && (
                                                <div className="mb-3">
                                                    <span className="text-purple-400 font-medium text-sm">More examples:</span>
                                                    <ul className="list-disc list-inside ml-4 mt-1">
                                                        {definition["other-examples"].map((example, exIdx) => (
                                                            <li key={exIdx} className="text-gray-400 text-sm">"{example}"</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {definition.synonyms && (
                                                <div>
                                                    <span className="text-green-400 font-medium text-sm">Synonyms:</span>
                                                    <div className="mt-1">
                                                        {Object.entries(definition.synonyms).map(([category, syns]) => (
                                                            <div key={category} className="mb-2">
                                                                {category && (
                                                                    <span className="text-gray-500 text-xs">
                                                                        ({category}):
                                                                    </span>
                                                                )}
                                                                <div className="flex flex-wrap gap-1 ml-2">
                                                                    {syns.map((synonym, synIdx) => (
                                                                        <button
                                                                            key={synIdx}
                                                                            onClick={() => handleWordClick(synonym)}
                                                                            className="text-blue-300 hover:text-blue-200 hover:underline text-sm transition-colors"
                                                                        >
                                                                            {synonym}{synIdx < syns.length - 1 ? ',' : ''}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Todas las traducciones */}
                    {translationData.translations["all-translations"].length > 0 && (
                        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                            <button
                                onClick={() => toggleSection('allTranslations')}
                                className="flex items-center justify-between w-full text-left text-purple-400 font-semibold hover:text-purple-300 transition-colors mb-4"
                            >
                                <span>All Translation Options</span>
                                {expandedSections.allTranslations ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            
                            {expandedSections.allTranslations && (
                                <div className="space-y-3">
                                    {translationData.translations["all-translations"].map(([word, meanings], idx) => (
                                        <div key={idx} className="border-l-2 border-purple-500 pl-4">
                                            <button
                                                onClick={() => handleWordClick(word, targetLanguage, sourceLanguage)}
                                                className="text-purple-300 font-medium hover:underline mb-1"
                                            >
                                                {word}
                                            </button>
                                            <div className="flex flex-wrap gap-1">
                                                {meanings.map((meaning, meaningIdx) => (
                                                    <button
                                                        key={meaningIdx}
                                                        onClick={() => handleWordClick(meaning)}
                                                        className="text-gray-400 hover:text-gray-300 text-sm hover:underline transition-colors"
                                                    >
                                                        {meaning}{meaningIdx < meanings.length - 1 ? ',' : ''}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ver también */}
                    {translationData["see-also"] && translationData["see-also"].length > 0 && (
                        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
                            <h4 className="text-purple-400 font-semibold mb-3">See Also:</h4>
                            <div className="flex flex-wrap gap-2">
                                {translationData["see-also"].map((word, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleWordClick(word[0])}
                                        className="bg-neutral-700 hover:bg-neutral-600 text-gray-300 px-3 py-1 rounded-lg text-sm transition-colors"
                                    >
                                        {word}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posibles errores */}
                    {translationData.translations["possible-mistakes"] && translationData.translations["possible-mistakes"].length > 0 && (
                        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                            <h4 className="text-yellow-400 font-semibold mb-2">Did you mean?</h4>
                            <div className="flex flex-wrap gap-2">
                                {translationData.translations["possible-mistakes"].map((mistake, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleWordClick(mistake)}
                                        className="text-yellow-300 hover:text-yellow-200 hover:underline text-sm transition-colors"
                                    >
                                        {mistake}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
 
export default Translation;