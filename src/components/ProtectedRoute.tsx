import { Outlet } from "react-router-dom";
import Header from "./layouts/Header";
import { Toaster } from "react-hot-toast";

export function ProtectedLayout() {
    return (
        <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white min-h-screen">
            <Toaster position="top-right" />
            <Header />
            <div className="container mx-auto px-4 py-8">
                <Outlet />
            </div>
        </div>
    );
}
