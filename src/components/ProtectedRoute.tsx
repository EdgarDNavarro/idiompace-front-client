import { Outlet, Navigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import Header from "./layouts/Header";
import { Spinner } from "./loaders/Spinner";

export function ProtectedLayout() {
    const { data, isPending } = authClient.useSession();

    if (isPending) return (
        <div className="bg-neutral-950 text-white min-h-screen">
            <Spinner/>
        </div>
    );
    
    if (!data) return <Navigate to="/login" replace />;

    return (
        <div className="bg-neutral-950 text-white min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-8">
                
                <Outlet />
            </div>
        </div>
    );
}
