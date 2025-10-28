import { BookOpen, User2, LogOut, CreditCard, NotebookPen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import { useEffect, useRef, useState } from "react";

function Header() {
    const { data } = authClient.useSession();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const signOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate("/login");
                },
            },
        });
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3 ">
            <div onClick={() => navigate('/')} className="bg-green-500 p-1 rounded-xl cursor-pointer hover:bg-green-600 transition-colors ">


                <BookOpen className="w-8 h-8" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-green-600">
                    Idiom pace
                </h1>
                <p className="text-gray-300">
                    Learn English through interactive stories
                </p>
            </div>
        </div>

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full flex items-center justify-center focus:outline-none"
                    aria-label="User menu"
                >
                    <User2 className="w-7 h-7" />
                </button>
                {open && (
                    <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg z-50 py-4 px-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div>
                                <div className="font-semibold text-gray-100">{data?.user?.name || "Usuario"}</div>
                                <div className="text-gray-400 text-sm">{data?.user?.email}</div>
                            </div>
                        </div>
                        <hr className="border-neutral-800 mb-4" />

                        <Link to={"/flashcards"} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-neutral-800 text-gray-200"> <CreditCard className="w-4 h-4"/> Flashcards</Link>
                        <Link to={"/generate-story"} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-neutral-800 text-gray-200"> <NotebookPen className="w-4 h-4"/> Generate Story</Link>

                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded hover:bg-neutral-800 text-red-400 font-medium transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                        {/* Puedes agregar más opciones aquí fácilmente */}
                        {/* <button className="w-full text-left px-3 py-2 rounded hover:bg-neutral-800 text-gray-200">Otra opción</button> */}
                    </div>
                )}
            </div>
        </div>
    );
}


    //     <div className="flex items-center gap-3 ">
    //         <div onClick={() => navigate('/')} className="bg-gray-200 p-1 rounded-xl cursor-pointer hover:bg-gray-300 transition-colors border-2 border-green-600">


    //             <img src="/ChatGPTaguacate-removebg-preview.png" className="w-14 h-14" />
    //         </div>
    //         <div>
    //             <h1 className="text-3xl font-bold text-green-600">
    //                 Echo Hass
    //             </h1>
    //             <p className="text-gray-300">
    //                 Learn English through interactive stories
    //             </p>
    //         </div>
    //     </div>

export default Header;
