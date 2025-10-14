import { Flame } from "lucide-react";

interface StreakCounterProps {
    currentStreak: number;
    longestStreak?: number;
}

export function StreakCounter({
    currentStreak,
    longestStreak,
}: StreakCounterProps) {
    // Colores para la racha
    const accentColor =
        currentStreak >= 30
            ? "bg-yellow-500 text-yellow-900"
            : currentStreak >= 14
            ? "bg-orange-500 text-orange-900"
            : currentStreak >= 7
            ? "bg-green-500 text-green-900"
            : "bg-green-400 text-green-900";

    const textColor =
        currentStreak >= 30
            ? "text-yellow-500"
            : currentStreak >= 14
            ? "text-orange-500"
            : currentStreak >= 7
            ? "text-green-500"
            : "text-green-500";

    const bagedColor =
        currentStreak >= 30
            ? "border border-yellow-400 text-yellow-400"
            : currentStreak >= 14
            ? "border border-orange-400 text-orange-400"
            : currentStreak >= 7
            ? "border border-green-400 text-green-400"
            : "";

    const progressColor =
        currentStreak >= 30
            ? "from-yellow-500 to-yellow-400"
            : currentStreak >= 14
            ? "from-orange-500 to-orange-400"
            : currentStreak >= 7
            ? "from-green-500 to-green-400"
            : "from-green-400 to-green-300";
            
    const milestones = [7, 14, 30, 60, 100, 200, 365];
    const nextMilestone = milestones.find(m => m > currentStreak) || null;
    const prevMilestone = milestones.filter(m => m <= currentStreak).slice(-1)[0] || 0;
    const progressToNext = nextMilestone
        ? ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
        : 100;
    const getMotivation = (streak: number) => {
        if (streak >= 100) return "¡Racha legendaria!";
        if (streak >= 30) return "¡Imparable!";
        if (streak >= 14) return "¡Increíble!";
        if (streak >= 7) return "¡Genial!";
        return "¡Sigue así!";
    };
    return (
        <div
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-green-400/10 via-green-400/5 to-transparent p-6 shadow-sm ring-1 ring-green-400/20 transition-all hover:shadow-md hover:ring-green-400/30`}
        >
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-green-400/5 blur-2xl" />

            <div className="relative flex items-center gap-6">
                {/* Flame icon with glow effect */}
                <div className="relative">
                    <div
                        className={`absolute inset-0 animate-pulse rounded-full ${accentColor}/20 blur-xl`}
                    />
                    <div
                        className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${progressColor} shadow-lg`}
                    >
                        <Flame
                            className={`h-8 w-8 ${accentColor.split(" ")[1]}`}
                            fill="currentColor"
                        />
                    </div>
                </div>

                {/* Streak info */}
                <div className="flex-1">
                    <div className="mb-1 flex items-baseline gap-2">
                        <span
                            className={`text-4xl font-bold ${textColor}`}
                        >
                            {currentStreak}
                        </span>
                        <span className="text-lg font-medium text-muted-foreground">
                            {currentStreak === 1 ? "día" : "días"}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Racha actual
                    </p>

                    {longestStreak !== undefined && longestStreak > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Mejor racha:{" "}
                            <span
                                className={`font-semibold ${textColor}`}
                            >
                                {longestStreak}
                            </span>{" "}
                            {longestStreak === 1 ? "día" : "días"}
                        </p>
                    )}
                </div>

                {/* Motivational badge */}
                {currentStreak >= 7 && (
                    <div
                        className={`hidden rounded-lg ${bagedColor} px-3 py-1.5 sm:block`}
                    >
                        <p
                            className={`text-xs font-semibold `}
                        >
                            {getMotivation(currentStreak)}
                        </p>
                    </div>
                )}
            </div>

            {/* Progress indicator for next milestone */}
            {nextMilestone && (
                <div className="relative mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-green-400/10">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-500`}
                            style={{
                                width: `${progressToNext}%`,
                            }}
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                        {nextMilestone - currentStreak}{" "}
                        {nextMilestone - currentStreak === 1 ? "día" : "días"} para la próxima meta:{" "}
                        <span className="font-semibold">{nextMilestone} días</span>
                    </p>
                </div>
            )}

            <div className="flex gap-2 mt-4 w-full justify-between">
                {milestones.map(m => (
                    <div key={m} className={`flex flex-col items-center`}>

                        <div className={`h-8 w-8 rounded-full flex items-center justify-center relative
                            ${currentStreak >= m ? "bg-yellow-300 text-red-700" : "bg-neutral-800 text-gray-400"}`}
                        >
                            {currentStreak >= m ? <Flame fill="currentColor"/> : m}

                            {currentStreak >= m && (
                                <div
                                    className={`absolute inset-0 rounded-full bg-red-600 blur-xl animate-pulse`}
                                />
                            )}

                        </div>
                        <span className="text-xs mt-1">{m} días</span>
                    </div>
                ))}
            </div>
        </div>
        
    );
}
