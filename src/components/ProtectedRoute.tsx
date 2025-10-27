import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import Header from "./layouts/Header";
import { Spinner } from "./loaders/Spinner";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { Subscription } from "@better-auth/stripe";

export function ProtectedLayout() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState<Subscription | undefined>(undefined);
    const { data, isPending } = authClient.useSession();


    useEffect(() => {
        const listSubscriptions = async () => {
            try {
                const subscriptionData = await authClient.subscription.list({
                    query: {
                        referenceId: data?.user.id || "",
                    }
                });
    
                if(!subscriptionData.error && subscriptionData.data && subscriptionData.data.length > 0) {
                    const activeSubscriptions = subscriptionData.data.find(sub => sub.status === "active");
                    if(!activeSubscriptions) {
                        navigate("/plans");
                        return;
                    }
                    console.log(activeSubscriptions);
                    setSubscriptions(activeSubscriptions);
                } else {
                    navigate("/plans");
                }
            } catch (error) {
                console.log(error);
                
            } finally {
                setLoading(false);
            }
            
        }
        if(data) {
            listSubscriptions()
        }
    }, [data])

    if (isPending || loading) return (
        <div className="bg-neutral-950 text-white min-h-screen">
            <Spinner/>
        </div>
    );
    
    if (!data) return <Navigate to="/login" replace />;

    return (
        <div className="bg-neutral-950 text-white min-h-screen">
            <Toaster 
                position="top-right"
            />
            <Header />
            <div className="container mx-auto px-4 py-8">
                
                <Outlet />
            </div>
        </div>
    );
}
