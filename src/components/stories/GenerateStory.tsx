import { Subscription } from "@better-auth/stripe";
import { authClient } from "../../lib/auth-client";
import { Spinner } from "../loaders/Spinner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { addOneUsage, generateStoryWithIA, getStoryByVoice, getUsageByUserId } from "../../services/stories";
import { Brain, Play, Globe, Users, Zap, ArrowRight, Crown, CheckCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { ExampleAudioPlayer } from "./ExampleAudioPlayer";
import { isAxiosError } from "axios";
import { CATEGORIES_ENGLISH, CATEGORIES_SPANISH, englishVoices, spanishVoices, Voice } from "../../schemas/categories";
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
                toast.error("No example story found for this voice and language. Crea una!");
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
        <div className="min-h-screen bg-neutral-950 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Brain className="w-8 h-8 text-green-400" />
                        <h1 className="text-3xl font-bold">AI Story Generator</h1>
                    </div>
                    <p className="text-gray-400 text-lg">Create personalized learning stories with AI</p>
                </div>

                {/* Usage Stats */}
                <div className="bg-neutral-800 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Monthly Usage</h3>
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-bold text-green-400">{storiesGenerated}</span>
                                <span className="text-gray-400">of</span>
                                <span className="text-2xl font-bold text-blue-400">{storiesLimit === 0 ? "0" : storiesLimit}</span>
                                <span className="text-gray-400">stories generated</span>
                            </div>
                        </div>
                        
                        {!canGenerateMore && (
                            <button
                                onClick={handleUpgrade}
                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                            >
                                <Crown className="w-5 h-5" />
                                Upgrade Plan
                            </button>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {storiesLimit > 0 && (
                        <div className="mt-4">
                            <div className="w-full bg-neutral-700 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((storiesGenerated / storiesLimit) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Limit Warning */}
                {!canGenerateMore && (
                    <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            <div>
                                <p className="text-yellow-300 font-medium">Story limit reached</p>
                                <p className="text-yellow-200 text-sm">
                                    {storiesLimit === 0 
                                        ? "Your current plan doesn't include AI story generation." 
                                        : "You've used all your monthly AI stories."
                                    } Upgrade to generate more stories.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="space-y-8">
                    {/* Language Selection */}
                    <div>
                        <label className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-400" />
                            Language
                        </label>
                        <div className="grid grid-cols-2 gap-4">
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
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                        formData.idiom === lang
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                            : 'border-neutral-700 hover:border-neutral-600'
                                    }`}
                                >
                                    <div className="text-lg font-medium">{lang}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice Selection */}
                    <div>
                        <label className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Play className="w-5 h-5 text-green-400" />
                            Voice
                        </label>

                        {selectedExampleVoice.title && (
                            
                            <ExampleAudioPlayer 
                                level={selectedExampleVoice.level}
                                title={selectedExampleVoice.title}
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentVoices.map((voice) => (
                                <button
                                    key={voice.id}
                                    type="button"
                                    onClick={() => handleVoiceSelect(voice)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                        formData.voice_id === voice.id
                                            ? 'border-green-500 bg-green-500/10'
                                            : 'border-neutral-700 hover:border-neutral-600'
                                    }`}
                                >
                                    <div className="font-medium">{voice.name}</div>
                                    <div className="text-sm text-gray-400">{voice.accent} • {voice.gender}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Level Selection */}
                    <div>
                        <label className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Difficulty Level
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {LEVELS.map((level) => (
                                <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, level: level.value as any }))}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                        formData.level === level.value
                                            ? 'border-yellow-500 bg-yellow-500/10'
                                            : 'border-neutral-700 hover:border-neutral-600'
                                    }`}
                                >
                                    <div className="font-medium">{level.label}</div>
                                    <div className="text-sm text-gray-400">{level.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-400" />
                            Categories ({formData.categories.length} selected)
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 bg-neutral-800 rounded-lg">
                            {currentCategories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => toggleCategory(category)}
                                    className={`p-3 rounded-lg border transition-all duration-200 text-sm text-left ${
                                        formData.categories.includes(category)
                                            ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                                            : 'border-neutral-600 hover:border-neutral-500 text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        {category}
                                        {formData.categories.includes(category) && (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="pt-6">
                        <button
                            type="button"
                            onClick={createStory}
                            disabled={!canGenerateMore || generating || !formData.voice_id || formData.categories.length === 0}
                            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                                !canGenerateMore
                                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                    : generating
                                        ? 'bg-green-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                            }`}
                        >
                            {generating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Generating Story...
                                </>
                            ) : !canGenerateMore ? (
                                <>
                                    <Crown className="w-5 h-5" />
                                    Upgrade to Generate Stories
                                </>
                            ) : (
                                <>
                                    <Brain className="w-5 h-5" />
                                    Generate AI Story
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                        
                        {canGenerateMore && (
                            <p className="text-center text-gray-400 text-sm mt-3">
                                Story generation takes approximately 3 minutes. You'll be notified when ready.
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
 
export default GenerateStory;