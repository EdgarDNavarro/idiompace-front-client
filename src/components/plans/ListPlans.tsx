import { useEffect, useState } from "react";
import { Check, Star, Zap, Brain, Sparkles, Crown, ChevronRight, X } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { Spinner } from "../loaders/Spinner";
import { Subscription } from "@better-auth/stripe";
import { useNavigate } from "react-router-dom";

interface Plan {
    name: string;
    priceId: string;
    price: number;
    currency: string;
    limits: {
        stories: number;
    };
    features: string[];
    popular?: boolean;
    recommended?: boolean;
}

const plans: Plan[] = [
    {
        name: "basic",
        priceId: "price_1SM8kyFfj1stO4RvhBtXVcPf",
        price: 5,
        currency: "EUR",
        limits: {
            stories: 0,
        },
        features: [
            "Access to all stories library",
            "Vocabulary and exercises",
            "Audio pronunciation",
            "Flashcard decks creation and management",
            "Personalized flashcards",
        ]
    },
    {
        name: "pro",
        priceId: "price_1SM8mfFfj1stO4Rv3sGST7Wm",
        price: 9.99,
        currency: "EUR",
        limits: {
            stories: 10,
        },
        features: [
            "Everything in Basic",
            "Generate 10 AI stories per month",
            "Pre-made flashcard decks",
            "Priority support"
        ],
        popular: true
    },
    {
        name: "advanced",
        priceId: "price_1SMtmhFfj1stO4RvqXimr7Aj",
        price: 15,
        currency: "EUR",
        limits: {
            stories: 30,
        },
        features: [
            "Everything in Pro",
            "Generate 30 AI stories per month",
            "Import/Export flashcards (CSV)",
            "Anki compatibility",
            "White-label options (coming soon)"
        ],
        recommended: true
    }
];

const ListPlans = () => {
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState<Subscription | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
    const { data, isPending } = authClient.useSession();

    useEffect(() => {
        const listSubscriptions = async () => {
            try {
                const subscriptionData = await authClient.subscription.list({
                    query: {
                        referenceId: data?.user.id || "",
                    }
                });
    
                if(!subscriptionData.error && subscriptionData.data && subscriptionData.data.length > 0) {
                    const activeSubscriptions = subscriptionData.data.find(sub => sub.status === "active");
                    if(!activeSubscriptions) return
                    setSubscriptions(activeSubscriptions);
                } 
            } catch (error) {
                console.log(error);
                
            } finally {
                setLoading(false);
            }
            
        }
        if(data) {
            listSubscriptions()
        }
        console.log(data)
    }, [data])

    if (isPending) return (
        <div className="bg-neutral-950 text-white min-h-screen flex items-center justify-center">
            <Spinner />
        </div>
    );

    const handleUpgrade = async (planName: string) => {
        
        
        if (!data) {
            navigate("/login");
            return;
        }

        setUpgradingPlan(planName);
        setLoading(true);

        try {
            const baseUrl = window.location.origin;

            const upgradeData: {
                plan: string;
                successUrl: string;
                cancelUrl: string;
                subscriptionId: string | undefined;
            } = {
                plan: planName,
                successUrl: `${baseUrl}`,
                cancelUrl: `${baseUrl}/plans`,
                subscriptionId: undefined
            }

            if(subscriptions) {
                upgradeData.subscriptionId = subscriptions.stripeSubscriptionId;
            }

            await authClient.subscription.upgrade(upgradeData);
        } catch (error) {
            console.error("Error upgrading plan:", error);
            // Handle error (show toast, etc.)
        } finally {
            setLoading(false);
            setUpgradingPlan(null);
        }
    };

    const getPlanIcon = (planName: string) => {
        switch (planName) {
            case "basic":
                return <Star className="w-6 h-6" />;
            case "pro":
                return <Zap className="w-6 h-6" />;
            case "advanced":
                return <Crown className="w-6 h-6" />;
            default:
                return <Star className="w-6 h-6" />;
        }
    };

    const getPlanColor = (planName: string) => {
        switch (planName) {
            case "basic":
                return "blue";
            case "pro":
                return "green";
            case "advanced":
                return "purple";
            default:
                return "blue";
        }
    };

    const renderFeature = (feature: string, planName: string) => {
        const isComingSoon = feature.includes("coming soon");
        return (
            <li key={feature} className="flex items-start gap-3">
                <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    isComingSoon 
                        ? 'text-gray-500' 
                        : planName === 'basic' 
                            ? 'text-blue-400' 
                            : planName === 'pro' 
                                ? 'text-green-400' 
                                : 'text-purple-400'
                }`} />
                <span className={`${isComingSoon ? 'text-gray-500' : 'text-gray-300'}`}>
                    {feature}
                </span>
            </li>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="w-8 h-8 text-green-400" />
                        <h1 className="text-4xl font-bold text-white">Choose Your Plan</h1>
                    </div>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Unlock the full potential of language learning with AI-powered stories and advanced features
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {plans.map((plan) => {
                        const color = getPlanColor(plan.name);
                        const isUpgrading = upgradingPlan === plan.name;
                        
                        return (
                            <div
                                key={plan.name}
                                className={`relative bg-neutral-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                                    plan.popular 
                                        ? 'border-green-500 shadow-lg shadow-green-500/20' 
                                        : plan.recommended
                                            ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                                            : 'border-neutral-700 hover:border-blue-500'
                                }`}
                            >
                                {/* Popular/Recommended Badge */}
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                
                                {plan.recommended && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                            <Crown className="w-4 h-4" />
                                            Recommended
                                        </div>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="text-center mb-8">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                        color === 'blue' 
                                            ? 'bg-blue-500/20 text-blue-400' 
                                            : color === 'green' 
                                                ? 'bg-green-500/20 text-green-400' 
                                                : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                        {getPlanIcon(plan.name)}
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold text-white capitalize mb-2">
                                        {plan.name}
                                    </h3>
                                    
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-white">
                                            €{plan.price}
                                        </span>
                                        <span className="text-gray-400">/month</span>
                                    </div>

                                    {/* AI Stories Limit */}
                                    {plan.limits.stories > 0 ? (
                                        <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full ${
                                            color === 'green' 
                                                ? 'bg-green-500/20 text-green-400' 
                                                : 'bg-purple-500/20 text-purple-400'
                                        }`}>
                                            <Brain className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {plan.limits.stories} AI Stories/month
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-neutral-700 text-gray-400">
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                No AI Story Generation
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Features List */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature) => renderFeature(feature, plan.name))}
                                </ul>

                                {/* CTA Button */}
                                <button
                                    onClick={() => handleUpgrade(plan.name)}
                                    disabled={loading || (subscriptions && subscriptions.plan === plan.name)}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 ${
                                        plan.popular
                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                            : plan.recommended
                                                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    } ${
                                        loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                    }`}
                                >
                                    {isUpgrading && (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Upgrading...
                                        </>
                                    )}

                                    {!isUpgrading && (subscriptions && subscriptions.plan === plan.name ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Current Plan
                                        </>
                                    ) : (
                                        <>
                                            Upgrade Now
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    ))}

                                    
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ or Additional Info */}
                <div className="text-center bg-neutral-800/50 rounded-2xl p-8">
                    <h3 className="text-xl font-semibold text-white mb-4">
                        Need help choosing the right plan?
                    </h3>
                    <p className="text-gray-400 mb-6">
                        All plans include access to our extensive story library and core learning features. 
                        Upgrade anytime to unlock AI story generation and advanced tools.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            30-day money-back guarantee
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            Cancel anytime
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-400" />
                            Secure payment
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListPlans;
