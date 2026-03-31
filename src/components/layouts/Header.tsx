import { BookOpen, CreditCard, NotebookPen, PhoneCall, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function Header() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
            <div className="flex items-center gap-3">
                <div onClick={() => navigate('/')} className="bg-green-500 p-1 rounded-xl cursor-pointer hover:bg-green-600 transition-colors">
                    <BookOpen className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-green-600">Idiom pace</h1>
                    <p className="text-gray-300">Learn English through interactive stories</p>
                </div>
            </div>

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full flex items-center justify-center focus:outline-none"
                    aria-label="Navigation menu"
                >
                    {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
                {open && (
                    <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg z-50 py-4 px-4">
                        <Link to={"/flashcards"} onClick={() => setOpen(false)} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-neutral-800 text-gray-200">
                            <CreditCard className="w-4 h-4" /> Flashcards
                        </Link>
                        <Link to={"/generate-story"} onClick={() => setOpen(false)} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-neutral-800 text-gray-200">
                            <NotebookPen className="w-4 h-4" /> Generate Story
                        </Link>
                        <Link to={"/speech-with-ia"} onClick={() => setOpen(false)} className="w-full flex items-center gap-2 text-left px-3 py-2 rounded hover:bg-neutral-800 text-gray-200">
                            <PhoneCall className="w-4 h-4" /> Speech With IA
                        </Link>
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
