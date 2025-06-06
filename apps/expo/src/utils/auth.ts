import { createAuthClient } from 'better-auth/react'
import { expoClient } from '@better-auth/expo/client'
import * as SecureStore from "expo-secure-store"


export const authClient = createAuthClient({
    plugins: [expoClient({

        scheme: "everynote",
        storage: SecureStore
    })],
    baseURL: "http://192.168.244.132:3000",
})

export const { signIn, signOut, useSession } = authClient;

