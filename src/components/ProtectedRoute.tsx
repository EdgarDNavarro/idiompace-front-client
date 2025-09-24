import { Outlet } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import Header from "./layouts/Header";

export function ProtectedLayout() {
    const { data, isPending } = authClient.useSession();
console.log(data, isPending);
    if (isPending) return <p>Cargando...</p>;
    console.log(data);
    
    if (!data) return <></>

    return (
        <div className="bg-neutral-950 text-white min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-8">
                
                <Outlet />
            </div>
        </div>
    );
}
