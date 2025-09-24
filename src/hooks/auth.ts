import { authClient } from "../lib/auth-client";

export async function signUpWithEmail({
    email,
    password,
    name,
    image
}: {
    email: string;
    password: string;
    name: string;
    image?: string;
}) {
    const { data, error } = await authClient.signUp.email({
        email, 
        password, 
        name, 
        image, 
        callbackURL: "/" 
    }, {
        onRequest: (ctx) => {
            console.log(ctx);
        },
        onSuccess: (ctx) => {
            console.log(ctx.data);
        },
        onError: (ctx) => {
            alert(ctx.error.message);
        },
    });

    return { data, error };
}

export async function signInWithEmail({
    email,
    password,
    rememberMe
}: {
    email: string;
    password: string;
    rememberMe: boolean;
}) {
    const { data, error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
        rememberMe
    }, {
        //callbacks
    })

    return { data, error };
}

export function User(){
    const { 
        data, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession() 
    return { 
        data, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    }
}