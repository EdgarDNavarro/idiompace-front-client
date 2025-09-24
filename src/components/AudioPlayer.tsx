import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useAudio } from "../hooks/useAudio";
import { Story } from "../schemas";
import { useState } from "react";

interface AudioPlayerProps {
    story: Story;
    currentPhraseIndex: number;
    setCurrentPhraseIndex: (index: number) => void;
    setCurrentTime: (time: number) => void;
}

export const AudioPlayer = ({
    story,
    currentPhraseIndex,
    setCurrentPhraseIndex,
    setCurrentTime,
}: AudioPlayerProps) => {
    const { audioRef, isPlaying, currentTime, duration, play, pause, seek } =
        useAudio(
            `http://192.168.1.10:9010/idiompace/${
                story.level
            }/${encodeURIComponent(story.title)}.mp3`
        );
    const [speed, setSpeed] = useState(1);

    const handleSpeedChange = (rate: number) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
            setSpeed(rate);
        }
    };

    const getCurrentPhraseIndex = (time: number): number => {
        for (let i = story.phrases.length - 1; i >= 0; i--) {
            if (time >= story.phrases[i].startTime) {
                return i;
            }
        }
        return 0;
    };

    setCurrentPhraseIndex(getCurrentPhraseIndex(currentTime));

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handlePrevious = () => {
        const newIndex = Math.max(0, currentPhraseIndex - 1);
        setCurrentPhraseIndex(newIndex);
        seek(story.phrases[newIndex].startTime);
    };

    const handleNext = () => {
        const newIndex = Math.min(
            story.phrases.length - 1,
            currentPhraseIndex + 1
        );
        setCurrentPhraseIndex(newIndex);
        seek(story.phrases[newIndex].startTime);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        seek(newTime);
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;
    setCurrentTime(currentTime);

    return (
        <div className="bg-neutral-900 rounded-xl shadow-md border border-neutral-800 p-6 w-full max-w-4xl">
            <audio ref={audioRef} />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-white">{story.title}</h3>
                    <p className="text-sm text-gray-400">
                        Phrase {currentPhraseIndex + 1} of{" "}
                        {story.phrases.length}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                    {[0.5, 0.75, 1, 1.5, 2].map((rate) => (
                        <button
                            key={rate}
                            onClick={() => handleSpeedChange(rate)}
                            className={`px-2 py-1 rounded-md text-sm transition-colors
                              ${
                                  speed === rate
                                      ? "bg-green-600 text-white font-bold"
                                      : "bg-neutral-800 hover:bg-neutral-700 text-gray-300"
                              }
                              min-w-[48px] text-center
                            `}
                        >
                            {rate}x
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevious}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-gray-300 disabled:opacity-40"
                        disabled={currentPhraseIndex === 0}
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                        onClick={isPlaying ? pause : play}
                        className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-black transition-colors"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                    </button>

                    <button
                        onClick={handleNext}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-gray-300 disabled:opacity-40"
                        disabled={
                            currentPhraseIndex === story.phrases.length - 1
                        }
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #22c55e ${progress}%, #262626 ${progress}%)`,
                        }}
                    />
                </div>

                <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};
