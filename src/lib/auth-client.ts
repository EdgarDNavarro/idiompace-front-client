import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL,
    plugins: [
        adminClient(),
        stripeClient({
            subscription: true //if you want to enable subscription management
        })
    ]
})