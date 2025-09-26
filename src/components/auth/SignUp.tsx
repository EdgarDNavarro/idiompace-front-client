import React, { useEffect, useState } from "react";
import { signUpWithEmail } from "../../hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
    const navigate = useNavigate();

    const {data, isPending} = authClient.useSession() 

    useEffect(() => {
        if(!isPending && data?.user){
            navigate("/")
        }

    }, [data, isPending])
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        image: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | undefined>(undefined);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(undefined);
        setSuccess(null);
        try {
            const { error } = await signUpWithEmail(form);
            navigate("/login");
            
            if (error) {
                console.log(error);
                
                setError(error.message);
            } else {
                setSuccess("¡Registro exitoso! Revisa tu correo para verificar tu cuenta.");
            }
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
                <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">Crear cuenta</h2>
                {success && <div className="text-green-400 text-center">{success}</div>}
                {error && <div className="text-red-400 text-center">{error}</div>}
                <div>
                    <label className="block text-gray-300 mb-1">Nombre</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none"
                    />
                </div>
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded transition"
                >
                    {loading ? "Registrando..." : "Registrarse"}
                </button>
            </form>

            <Link to="/login" className="absolute bottom-4 right-4 text-green-400 hover:underline">
                ¿Ya tienes una cuenta? Inicia sesión
            </Link>
        </div>
    );
};

export default SignUp;