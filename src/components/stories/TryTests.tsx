import React, { useState } from "react";
import { Test } from "../../schemas";
import { createFlashcard } from "../../services/flashcards";

type TryTestsProps = {
    tests: Test[];
};

function normalize(str: string) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .toLowerCase()
        .trim();
}

const TryTests: React.FC<TryTestsProps> = ({ tests }) => {
    const [inputs, setInputs] = useState<string[]>(
        Array(tests.length).fill("")
    );
    const [checked, setChecked] = useState<boolean[]>(
        Array(tests.length).fill(false)
    );
    const [correct, setCorrect] = useState<boolean[]>(
        Array(tests.length).fill(false)
    );
    const [created, setCreated] = useState<boolean[]>(
        Array(tests.length).fill(false)
    );

    const handleInputChange = (idx: number, value: string) => {
        const newInputs = [...inputs];
        newInputs[idx] = value;
        setInputs(newInputs);
    };

    const handleCheck = (idx: number) => {
        const userAnswer = normalize(inputs[idx]);
        const realAnswer = normalize(tests[idx].answer);
        const isCorrect = userAnswer === realAnswer;
        const newChecked = [...checked];
        const newCorrect = [...correct];
        newChecked[idx] = true;
        newCorrect[idx] = isCorrect;
        setChecked(newChecked);
        setCorrect(newCorrect);
    };

    const saveToFlashcards = async (test: Test, idx: number) => {
        try {
            const flashcardData = {
                front: test.ask,
                back: test.answer,
                example: test.phrase,
            };
            const response = await createFlashcard(flashcardData);
            console.log("Flashcard created:", response);
            const newCreated = [...created];
            newCreated[idx] = true;
            setCreated(newCreated);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-10 space-y-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">
                Pon a prueba tu vocabulario - Test your vocabulary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tests.map((test, idx) => (
                    <div
                        key={test.id ?? idx}
                        className="bg-neutral-900 rounded-lg p-5 flex flex-col items-center gap-4 shadow border border-neutral-800"
                    >
                        <div className="flex-1 text-lg font-medium text-green-300 text-center md:text-left">
                            {test.ask}
                        </div>
                        <div className="flex-1 flex flex-col items-center md:items-start gap-2 w-full">
                            <input
                                type="text"
                                className={`px-3 py-2 rounded border outline-none w-full bg-neutral-800 text-white ${
                                    checked[idx]
                                        ? correct[idx]
                                            ? "border-green-500"
                                            : "border-red-500"
                                        : "border-neutral-700"
                                }`}
                                value={inputs[idx]}
                                onChange={(e) =>
                                    handleInputChange(idx, e.target.value)
                                }
                                placeholder="Escribe la traducción"
                            />

                            {!correct[idx] && (
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition w-full"
                                    onClick={() => handleCheck(idx)}
                                >
                                    Comprobar
                                </button>
                            )}

                            {checked[idx] &&
                                (correct[idx] ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400 font-semibold">
                                            ¡Correcto!
                                        </span>

                                        {created[idx] ? (
                                            <span className="text-blue-400 font-semibold">
                                                Guardado en flashcards
                                            </span>
                                        ) : (
                                            <button
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition text-xs"
                                                onClick={() =>
                                                    saveToFlashcards(test, idx)
                                                } // funcionalidad futura
                                            >
                                                Guardar en flashcards
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-red-400 font-semibold">
                                        Incorrecto. Try again.
                                    </span>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TryTests;
