import React, { useState } from "react";
import { Test } from "../../schemas";
import { createFlashcard } from "../../services/flashcards";
import { Eye, EyeOff, Flag } from "lucide-react";

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
    const [showExample, setShowExample] = useState<{ [id: number]: boolean }>({});

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
            await createFlashcard(flashcardData);
            const newCreated = [...created];
            newCreated[idx] = true;
            setCreated(newCreated);
        } catch (error) {
            console.log(error);
        }
    };

    const handleToggleExample = (id: number) => {
        setShowExample(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const giveUp = (idx: number) => {
        const answer = tests[idx].answer;
        const newInputs = [...inputs];
        newInputs[idx] = answer;
        setInputs(newInputs);

        const newChecked = [...checked];
        const newCorrect = [...correct];
        newChecked[idx] = true;
        newCorrect[idx] = true;
        setChecked(newChecked);
        setCorrect(newCorrect);
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-10 space-y-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4 text-center">
                Pon a prueba tu vocabulario - Test your vocabulary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tests.map((test, idx) => (
                    <div
                        key={test.id ?? idx}
                        className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-lg border border-neutral-800 transition-all hover:shadow-2xl"
                    >
                        <div className="flex-1 text-lg font-semibold text-green-300 text-center md:text-left">
                            {test.ask}
                        </div>
                        <div className="flex-1 flex flex-col items-center md:items-start gap-2 w-full">
                            <input
                                type="text"
                                className={`px-3 py-2 rounded-lg border outline-none w-full bg-neutral-800 text-white text-base shadow-sm transition ${
                                    checked[idx]
                                        ? correct[idx]
                                            ? "border-green-500 ring-2 ring-green-400"
                                            : "border-red-500 ring-2 ring-red-400"
                                        : "border-neutral-700 focus:border-green-400"
                                }`}
                                value={inputs[idx]}
                                onChange={(e) =>
                                    handleInputChange(idx, e.target.value)
                                }
                                placeholder="Escribe la traducción"
                                disabled={checked[idx] && correct[idx]}
                            />

                            <div className="flex gap-2 w-full">
                                <button
                                    className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs"
                                    onClick={() => handleToggleExample(test.id!)}
                                    type="button"
                                >
                                    {showExample[test.id!] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    {showExample[test.id!] ? "Ocultar ejemplo" : "Ver ejemplo"}
                                </button>
                                <button
                                    className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs ml-auto"
                                    onClick={() => giveUp(idx)}
                                    type="button"
                                    title="Rendirse"
                                >
                                    <Flag className="w-4 h-4" />
                                    Ver respuesta
                                </button>
                            </div>

                            {showExample[test.id!] && (
                                <div className="bg-neutral-800 rounded p-2 text-green-200 text-sm mb-2 w-full">
                                    {test.phrase}
                                </div>
                            )}

                            {!correct[idx] && (
                                <button
                                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-4 py-1.5 rounded-lg font-semibold shadow transition w-full mt-2"
                                    onClick={() => handleCheck(idx)}
                                >
                                    Comprobar
                                </button>
                            )}

                            {checked[idx] &&
                                (correct[idx] ? (
                                    <div className="flex flex-col items-center gap-2 w-full">
                                        <span className="text-green-400 font-semibold text-base">
                                            ¡Correcto!
                                        </span>

                                        {created[idx] ? (
                                            <span className="text-blue-400 font-semibold text-xs">
                                                Guardado en flashcards
                                            </span>
                                        ) : (
                                            <button
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition text-xs"
                                                onClick={() =>
                                                    saveToFlashcards(test, idx)
                                                }
                                            >
                                                Guardar en flashcards
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-red-400 font-semibold text-base">
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
