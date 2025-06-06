// auth.config.ts
import { db } from "@acme/db/client";
import { oAuthProxy } from "better-auth/plugins"
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../env";
import { expo } from "@better-auth/expo";

export const config = {
    database: drizzleAdapter(db, {
        provider: "pg"
    }),
    secret: env.AUTH_SECRET,
    plugins: [oAuthProxy(), expo()],
    socialProviders: {
        discord: {
            clientId: env.AUTH_DISCORD_ID,
            clientSecret: env.AUTH_DISCORD_SECRET,
            redirectURI: "http://192.168.244.132:3000/api/auth/callback/discord",
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // CHANGE THIS LINE:
            redirectURI: "http://192.168.244.132:3000/api/auth/callback/google",
        },
    },
    trustedOrigins: ["exp+every-note://", "exp+every-note://expo-development-client/--/?url=http%3A%2F%2F192.168.244.132%3A8081"] // Good to include both for development client
} satisfies BetterAuthOptions

export const auth = betterAuth(config);
export type Session = typeof auth.$Infer.Session