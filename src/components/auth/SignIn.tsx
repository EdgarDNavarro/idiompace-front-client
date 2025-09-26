import React, { useEffect, useState } from "react";
import { signInWithEmail } from "../../hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

const SignIn = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()

    const {data, isPending} = authClient.useSession() 

    useEffect(() => {
        if(!isPending && data?.user){
            navigate("/")
        }

    }, [data, isPending])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(undefined);
        try {
            const { data, error } = await signInWithEmail(form);
            console.log(error);
            
            if (error) {
                setError(error.message);
            }
            console.log(data);
            
        } catch (err: any) {
            setError("Ocurrió un error inesperado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950">
            <form
                onSubmit={handleSubmit}
                className="bg-neutral-900 p-8 rounded-xl shadow-md w-full max-w-md border border-neutral-800 space-y-6"
            >
                <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">Iniciar sesión</h2>
                {error && <div className="text-red-400 text-center">{error}</div>}
                <div>
                    <label className="block text-gray-300 mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 mb-1">Contraseña</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-400"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="rememberMe"
                        checked={form.rememberMe}
                        onChange={handleChange}
                        id="rememberMe"
                        className="accent-green-500"
                    />
                    <label htmlFor="rememberMe" className="text-gray-300 text-sm">
                        Recordarme
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
                >
                    {loading ? "Ingresando..." : "Iniciar sesión"}
                </button>
            </form>

            <Link to="/register" className="absolute bottom-4 right-4 text-green-400 hover:underline">
                ¿No tienes una cuenta? Regístrate
            </Link>
        </div>
    );
};

export default SignIn;