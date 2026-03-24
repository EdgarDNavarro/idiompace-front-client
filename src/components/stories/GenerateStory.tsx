import { Subscription } from "@better-auth/stripe";
import { authClient } from "../../lib/auth-client";
import { Spinner } from "../loaders/Spinner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { addOneUsage, generateStoryWithIA, getStoryByVoice, getUsageByUserId } from "../../services/stories";
import { Brain, Play, Globe, Users, Zap, ArrowRight, Crown, CheckCircle, AlertTriangle, Info } from "lucide-react";
import toast from "react-hot-toast";
import { ExampleAudioPlayer } from "./ExampleAudioPlayer";
import { isAxiosError } from "axios";
import { CATEGORIES_ENGLISH, CATEGORIES_SPANISH, englishVoices, spanishVoices, Voice } from "../../schemas/categories";
import { Orb } from "../elevelabs/Orb";
interface FormData {
    idiom: "English" | "Spanish";
    voice_id: string;
    voice_name: string;
    categories: string[];
    level: "low" | "middle" | "high";
}

interface ExampleVoice {
    title: string;
    level: string;
}

interface CachedExampleVoice {
    voice: string;
    idiom: "English" | "Spanish";
    title: string;
    level: string;
}

const LEVELS = [
    { value: "low", label: "Beginner", description: "Simple vocabulary and basic grammar" },
    { value: "middle", label: "Intermediate", description: "Moderate vocabulary with common expressions" },
    { value: "high", label: "Advanced", description: "Complex vocabulary and advanced structures" }
];

const GenerateStory = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [usageId, setUsageId] = useState<number | null>(null);
    const [selectedExampleVoice, setSelectedExampleVoice] = useState<ExampleVoice>({
        title: "",
        level: ""
    });
    const [cachedExampleVoice, setCachedExampleVoice] = useState<CachedExampleVoice[]>([])
    const [generating, setGenerating] = useState(false);
    const [subscriptions, setSubscriptions] = useState<Subscription | undefined>(undefined);
    const [storiesGenerated, setStoriesGenerated] = useState(0);
    const { data, isPending } = authClient.useSession();

    const [formData, setFormData] = useState<FormData>({
        idiom: "English",
        voice_id: "",
        voice_name: "",
        categories: [],
        level: "middle"
    });

    const getVoiceExample = async (voice: string) => {
        const cached = cachedExampleVoice.find(item => item.voice === voice && item.idiom === formData.idiom);
        if(cached) {
            setSelectedExampleVoice({
                title: cached.title,
                level: cached.level
            });
            console.log("cached");
            
            return;
        }
        try {
            const example = await getStoryByVoice(voice, formData.idiom);
            if(example.data) {
                setSelectedExampleVoice({
                    title: example.data.title,
                    level: example.data.level
                });
                setCachedExampleVoice(prev => ([...prev, {
                    voice,
                    idiom: formData.idiom,
                    title: example.data.title,
                    level: example.data.level
                }]));
                console.log("fechted");
                
            } else {
                setSelectedExampleVoice({
                    title: "",
                    level: ""
                });
            }
            console.log("Voice Example:", example);
        } catch (error) {
            if(isAxiosError(error) && error.response && error.response.status === 404) {
                toast.custom(
                    (t) => (
                        <div 
                            className={`bg-neutral-900 rounded-lg p-4 text-white flex items-center gap-3 border border-blue-500 shadow-lg shadow-blue-500/20 transition-all duration-300 ${
                                t.visible ? "animate-custom-enter" : "animate-custom-leave"
                            }`}
                        >
                            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <span className="text-sm">No example story found for this voice and language.</span>
                        </div>
                    ), 
                    { duration: 1000 }
                );
            }
            setSelectedExampleVoice({
                title: "",
                level: ""
            });
        }
    }

    // Get stories counter from localStorage
    const getStoriesCount = async () => {

        try {
            const usage = await getUsageByUserId(data?.user.id || "");
            if(usage.data) {
                setStoriesGenerated(usage.data.storiesUsed || 0);
                setUsageId(usage.data.id);
            }
            
            
        } catch (error) {
            console.log("Error getting stories count:", error);
        }
    };

    useEffect(() => {
        const listSubscriptions = async () => {
            setLoading(true);
            try {
                const subscriptionData = await authClient.subscription.list({
                    query: {
                        referenceId: data?.user.id || "",
                    }
                });
    
                if(!subscriptionData.error && subscriptionData.data && subscriptionData.data.length > 0) {
                    const activeSubscriptions = subscriptionData.data.find(sub => sub.status === "active");
                    if(!activeSubscriptions) {
                        navigate("/plans");
                        return;
                    }
                    setSubscriptions(activeSubscriptions);
                } else {
                    navigate("/plans");
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        
        if(data) {
            listSubscriptions();
            getStoriesCount()
        } else {
            setLoading(false);
        }
    }, [data, navigate]);

    if (isPending || loading) return (
        <div className="bg-neutral-950 text-white min-h-screen flex items-center justify-center">
            <Spinner/>
        </div>
    );

    const storiesLimit = (subscriptions as any)?.limits?.stories || 0;
    const canGenerateMore = storiesLimit === 0 ? false : storiesGenerated < storiesLimit;
    const currentVoices = formData.idiom === "English" ? englishVoices : spanishVoices;
    const currentCategories = formData.idiom === "English" ? CATEGORIES_ENGLISH : CATEGORIES_SPANISH;

    const handleVoiceSelect = (voice: Voice) => {
        getVoiceExample(voice.name);
        setFormData(prev => ({
            ...prev,
            voice_id: voice.id,
            voice_name: voice.name
        }));
    };

    const toggleCategory = (category: string) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    };

    const createStory = async () => {
        if (!canGenerateMore) {
            toast.error("You've reached your monthly story limit. Upgrade your plan to generate more stories!");
            return;
        }

        if (!formData.voice_id || formData.categories.length === 0) {
            toast.error("Please select a voice and at least one category.");
            return;
        }

        setGenerating(true);
        try {
            const result = await generateStoryWithIA({
                idiom: formData.idiom,
                voice_id: formData.voice_id,
                voice_name: formData.voice_name,
                categories: formData.categories,
                level: formData.level,
            });

            if (result && usageId) {
                
                toast.success("Story generation started! You'll be notified when it's ready (~3 minutes)");
                await addOneUsage(usageId)
                setStoriesGenerated(prev => prev + 1);
                // Optionally redirect or reset form
                setFormData(prev => ({
                    ...prev,
                    categories: [],
                    voice_id: "",
                    voice_name: ""
                }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate story. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleUpgrade = () => {
        navigate("/plans");
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header - Compacto */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center gap-2.5 mb-3 px-5 py-2.5 rounded-xl bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/20 backdrop-blur-sm">
                        <Brain className="w-6 h-6 text-green-400" />
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            AI Story Generator
                        </h1>
                    </div>
                    <p className="text-gray-400 text-sm md:text-base">Create personalized learning stories powered by AI</p>
                </div>

                {/* Usage Stats - Compacto */}
                <div className="relative group mb-6">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-neutral-900/90 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-neutral-700/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-xs font-medium text-gray-400 mb-2">Monthly Usage</h3>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-green-400 to-green-600 bg-clip-text text-transparent">
                                        {storiesGenerated}
                                    </span>
                                    <span className="text-xl text-gray-500">/</span>
                                    <span className="text-2xl md:text-3xl font-semibold text-blue-400">
                                        {storiesLimit === 0 ? "0" : storiesLimit}
                                    </span>
                                    <span className="text-gray-500 text-sm ml-1">stories</span>
                                </div>
                                
                                {/* Progress Bar - Enhanced */}
                                {storiesLimit > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="relative w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                            <div 
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 via-green-400 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-lg shadow-green-500/50"
                                                style={{ width: `${Math.min((storiesGenerated / storiesLimit) * 100, 100)}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{Math.round((storiesGenerated / storiesLimit) * 100)}% used</span>
                                            <span>{storiesLimit - storiesGenerated} remaining</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {!canGenerateMore && (
                                <button
                                    onClick={handleUpgrade}
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 whitespace-nowrap"
                                >
                                    <Crown className="w-4 h-4" />
                                    Upgrade Plan
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Limit Warning - Enhanced */}
                {!canGenerateMore && (
                    <div className="relative mb-6 overflow-hidden rounded-xl border border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 via-orange-900/10 to-yellow-900/20 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5"></div>
                        <div className="relative flex items-start gap-3 p-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-yellow-300 font-semibold text-sm mb-0.5">Story limit reached</p>
                                <p className="text-yellow-200/80 text-sm leading-relaxed">
                                    {storiesLimit === 0 
                                        ? "Your current plan doesn't include AI story generation." 
                                        : "You've used all your monthly AI stories."
                                    } Upgrade to continue creating amazing content.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="space-y-5">
                    {/* Language + Level Grid en Desktop */}
                    <div className="grid lg:grid-cols-2 gap-5">
                        {/* Language Selection - Compacto */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-xl p-4 md:p-5 border border-neutral-700/50 h-full flex flex-col justify-between">
                                <label className="text-base font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span>Language</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(["English", "Spanish"] as const).map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ 
                                                ...prev, 
                                                idiom: lang,
                                                voice_id: "",
                                                voice_name: "",
                                                categories: []
                                            }))}
                                            className={`relative p-3 md:p-4 rounded-lg border-2 transition-all duration-200 group/lang overflow-hidden ${
                                            formData.idiom === lang
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/20'
                                                : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50'
                                        }`}
                                    >
                                            {formData.idiom === lang && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
                                            )}
                                            <div className="relative text-sm md:text-base font-semibold">{lang}</div>
                                            {formData.idiom === lang && (
                                                <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-blue-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Level Selection - Compacto (ahora al lado de Language en desktop) */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-xl p-4 md:p-5 border border-neutral-700/50">
                                <label className="text-base font-semibold mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                    </div>
                                    <span>Difficulty</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {LEVELS.map((level) => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, level: level.value as any }))}
                                            className={`relative p-3 md:p-4 rounded-lg border-2 transition-all duration-200 text-left overflow-hidden group/level ${
                                                formData.level === level.value
                                                    ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20'
                                                    : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50'
                                            }`}
                                        >
                                            {formData.level === level.value && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent"></div>
                                            )}
                                            <div className="relative">
                                                <div className="font-semibold text-white text-sm mb-0.5">{level.label}</div>
                                                <div className="text-xs text-gray-400 leading-snug hidden md:block">{level.description}</div>
                                            </div>
                                            {formData.level === level.value && (
                                                <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-yellow-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voice Selection - Compacto (mantiene el Orb) */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-xl p-4 md:p-5 border border-neutral-700/50">
                            <label className="text-base font-semibold mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-green-400" />
                                </div>
                                <span>Voice</span>
                            </label>

                            {selectedExampleVoice.title && (
                                <div className="mb-4">
                                    <ExampleAudioPlayer 
                                        level={selectedExampleVoice.level}
                                        title={selectedExampleVoice.title}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {currentVoices.map((voice) => (
                                    <button
                                        key={voice.id}
                                        type="button"
                                        onClick={() => handleVoiceSelect(voice)}
                                        className={`relative flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left overflow-hidden group/voice ${
                                            formData.voice_id === voice.id
                                                ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20'
                                                : 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50'
                                        }`}
                                    >
                                        {formData.voice_id === voice.id && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"></div>
                                        )}
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            <Orb className="w-full h-full" seed={`${voice.name} ${voice.accent} ${voice.gender}`.length} />
                                        </div>

                                        <div className="relative flex-1 min-w-0">
                                            <div className="font-semibold text-white text-sm truncate">{voice.name}</div>
                                            <div className="text-xs text-gray-400 truncate">{voice.accent} • {voice.gender}</div>
                                        </div>

                                        {formData.voice_id === voice.id && (
                                            <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-green-400 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Categories - Compacto */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-xl p-4 md:p-5 border border-neutral-700/50">
                            <label className="text-base font-semibold mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-purple-400" />
                                </div>
                                <span>Categories</span>
                                <span className="ml-auto text-xs font-normal px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    {formData.categories.length}
                                </span>
                            </label>
                            <div className="max-h-64 lg:max-h-80 overflow-y-auto p-1 custom-scrollbar">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                                    {currentCategories.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => toggleCategory(category)}
                                            className={`relative p-2 md:p-2.5 rounded-lg border-2 transition-all duration-200 text-xs font-medium text-left overflow-hidden group/cat ${
                                                formData.categories.includes(category)
                                                    ? 'border-purple-500 bg-purple-500/10 text-purple-300 shadow-md shadow-purple-500/20'
                                                    : 'border-neutral-600 hover:border-neutral-500 text-gray-300 hover:bg-neutral-800/50'
                                            }`}
                                        >
                                            {formData.categories.includes(category) && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
                                            )}
                                            <div className="relative flex items-center justify-between gap-1.5">
                                                <span className="truncate">{category}</span>
                                                {formData.categories.includes(category) && (
                                                    <CheckCircle className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={createStory}
                            disabled={!canGenerateMore || generating || !formData.voice_id || formData.categories.length === 0}
                            className={`relative w-full py-4 md:py-5 px-6 md:px-8 rounded-xl font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group ${
                                !canGenerateMore
                                    ? 'bg-neutral-800 cursor-not-allowed text-gray-500 border-2 border-neutral-700'
                                    : generating
                                        ? 'bg-gradient-to-r from-green-600 to-blue-600 cursor-wait shadow-lg shadow-green-500/50'
                                        : 'bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-500 hover:via-blue-500 hover:to-purple-500 text-white shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                        >
                            {/* Animated background gradient */}
                            {!generating && canGenerateMore && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            )}
                            
                            <div className="relative flex items-center justify-center gap-2.5">
                                {generating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent"></div>
                                        <span>Generating Story...</span>
                                    </>
                                ) : !canGenerateMore ? (
                                    <>
                                        <Crown className="w-5 h-5" />
                                        <span>Upgrade to Generate Stories</span>
                                    </>
                                ) : (
                                    <>
                                        <Brain className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                        <span>Generate AI Story</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                                    </>
                                )}
                            </div>
                        </button>
                        
                        {canGenerateMore && (
                            <div className="mt-4 text-center">
                                <p className="text-gray-400 text-sm leading-relaxed flex items-center justify-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    Story generation takes approximately 3 minutes. You'll be notified when ready.
                                </p>
                            </div>
                        )}
                    </div>
                </form>

                {/* Custom scrollbar styles */}
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(23, 23, 23, 0.5);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(139, 92, 246, 0.3);
                        border-radius: 4px;
                        transition: background 0.2s;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(139, 92, 246, 0.5);
                    }
                `}</style>
            </div>
        </div>
    );
}
 
export default GenerateStory;