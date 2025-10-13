import React, { useState } from "react";
import { Exercise } from "../../schemas";
import { BookOpen, CheckCircle2, XCircle } from "lucide-react";

type TryExercisesProps = {
    exercises: Exercise[];
};

const optionLabels = ["A", "B", "C", "D"];

const getOptionText = (exercise: Exercise, idx: number) => {
    switch (idx) {
        case 0: return exercise.optionA;
        case 1: return exercise.optionB;
        case 2: return exercise.optionC;
        case 3: return exercise.optionD;
        default: return "";
    }
};

const TryExercises: React.FC<TryExercisesProps> = ({ exercises }) => {
    const [currentExercise, setCurrentExercise] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [completedExercises, setCompletedExercises] = useState(0);

    const handleAnswerSelect = (index: number) => {
        if (showResult) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;
        setShowResult(true);
        if (optionLabels[selectedAnswer] === exercises[currentExercise].correctOption) {
            setScore(score + 1);
        }
        setCompletedExercises(completedExercises + 1);
    };

    const handleNext = () => {
        if (currentExercise < exercises.length - 1) {
            setCurrentExercise(currentExercise + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const handleReset = () => {
        setCurrentExercise(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setCompletedExercises(0);
    };

    const isCorrect =
        selectedAnswer !== null &&
        optionLabels[selectedAnswer] === exercises[currentExercise].correctOption;

    const progress = (completedExercises / exercises.length) * 100;

    if (!exercises.length) {
        return (
            <div className="text-center text-gray-400 py-10">
                No hay ejercicios disponibles para esta historia.
            </div>
        );
    }

    return (
        <div className="w-full mx-auto py-8 mt-6">
            <div className="flex items-center justify-center gap-3 mb-8">
                <BookOpen className="w-8 h-8 text-green-400" />
                <h2 className="text-3xl font-bold text-green-300">Ejercicios de Práctica</h2>
            </div>

            <div className="bg-neutral-900 border border-green-700 rounded-2xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-base text-green-200">
                        Pregunta {currentExercise + 1} de {exercises.length}
                    </span>
                    <span className="bg-green-800/40 text-green-200 px-4 py-1 rounded-full font-semibold text-base">
                        Puntuación: {score}/{completedExercises}
                    </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-800 rounded-full h-2 mb-6">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="text-xl font-semibold mb-6 text-white">
                    {exercises[currentExercise].question}
                </div>

                <div className="grid grid-cols-1 gap-3 mb-6">
                    {[0, 1, 2, 3].map((idx) => {

                        const isSelected = selectedAnswer === idx;
                        const isCorrectOption =
                            optionLabels[idx] === exercises[currentExercise].correctOption;

                        let buttonClass = "w-full py-3 px-4 rounded-lg text-lg font-medium transition-all border border-neutral-700 text-white flex items-center gap-3";
                        if (showResult) {
                            if (isCorrectOption) {
                                buttonClass += " bg-green-600 border-green-600 text-white";
                            } else if (isSelected && !isCorrectOption) {
                                buttonClass += " bg-red-600 border-red-600 text-white";
                            }
                        } else if (isSelected) {
                            buttonClass += " bg-green-700 border-green-700";
                        } else {
                            buttonClass += " hover:border-green-500 ";
                        }

                        return (
                            <button
                                key={idx}
                                className={buttonClass}
                                onClick={() => handleAnswerSelect(idx)}
                                disabled={showResult}
                                type="button"
                            >
                                <span className="font-bold text-green-300">{optionLabels[idx]}.</span>
                                <span className="flex-1 text-left">{getOptionText(exercises[currentExercise], idx)}</span>
                                {showResult && isCorrectOption && <CheckCircle2 className="w-5 h-5" />}
                                {showResult && isSelected && !isCorrectOption && <XCircle className="w-5 h-5" />}
                            </button>
                        );
                    })}
                </div>

                {showResult && (
                    <div
                        className={`p-6 rounded-lg mb-6 ${
                            isCorrect
                                ? "bg-green-50 border-2 border-green-200"
                                : "bg-red-50 border-2 border-red-200"
                        }`}
                    >
                        <div className="flex items-start gap-3 mb-3">
                            {isCorrect ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            )}
                            <div>
                                <p
                                    className={`font-bold text-lg mb-2 ${
                                        isCorrect ? "text-green-800" : "text-red-800"
                                    }`}
                                >
                                    {isCorrect ? "¡Correcto! 🎉" : "Incorrecto"}
                                </p>
                                <p className="text-gray-800 leading-relaxed">
                                    {exercises[currentExercise].explanation}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    {!showResult ? (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedAnswer === null}
                            className="flex-1 h-12 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                        >
                            Verificar Respuesta
                        </button>
                    ) : currentExercise < exercises.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="flex-1 h-12 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                        >
                            Siguiente Pregunta →
                        </button>
                    ) : (
                        <div className="flex-1 space-y-4">
                            <div className="bg-green-600 text-white p-6 rounded-lg text-center">
                                <p className="text-2xl font-bold mb-2">¡Ejercicios Completados! 🎊</p>
                                <p className="text-lg">
                                    Puntuación final: {score} de {exercises.length}
                                </p>
                                <p className="text-sm mt-2 opacity-90">
                                    {score === exercises.length
                                        ? "¡Perfecto! Excelente trabajo."
                                        : score >= exercises.length * 0.7
                                        ? "¡Muy bien! Sigue practicando."
                                        : "¡Buen intento! La práctica hace al maestro."}
                                </p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="w-full h-12 text-lg bg-neutral-800 hover:bg-neutral-700 text-green-300 rounded-lg font-bold transition"
                            >
                                Reiniciar Ejercicios
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TryExercises;