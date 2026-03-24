import toast from "react-hot-toast";

export const useCustomToast = () => {
    const showStreakToast = () => {
        toast.custom((t) => (
            <div
                className={`${
                    t.visible ? "animate-custom-enter" : "animate-custom-leave"
                } max-w-md w-full bg-neutral-900 border border-neutral-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        {/* Ícono animado */}
                        <div className="relative flex-shrink-0 pt-0.5">
                            <div className="absolute inset-0 bg-orange-600 animate-pulse rounded-full blur-xl" />
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-full  shadow-lg">
                                <img
                                    src="/assets/Fuego.png"
                                    alt="Flame"
                                    className={`h-8 w-8 animate-pulse`}
                                />
                            </div>
                        </div>

                        {/* Texto */}
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-100">
                                ¡Has aumentado tu racha!
                            </p>
                            <p className="mt-1 text-sm text-gray-200">
                                🔥 ¡Sigue así!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botón cerrar */}
                <div className="flex">
                    <button
                        onClick={() => toast.remove(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-green-600 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        ));
    };

    return { showStreakToast };
};
