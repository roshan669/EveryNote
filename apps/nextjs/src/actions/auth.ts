// app/actions/auth.ts
"use server"; // This line is crucial for the entire file

import { auth } from "@acme/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Define the signIn action as a separate, named server action function
export async function handleSignIn() {
    // This function automatically inherits the "use server" context from the file
    try {
        const res = await auth.api.signInSocial({
            body: {
                provider: "google",
                callbackURL: "/", // Ensure this matches your configured callback URL
            },
        });

        if (res.url) {
            redirect(res.url); // `redirect` must be thrown in server actions
        } else {
            console.error("Sign-in URL not received from auth.api.signInSocial");
            // Consider a fallback redirect to an error page or a message for the user
            // redirect("/auth/error?message=signin_failed");
        }
    } catch (error) {
        console.error("Error during social sign-in:", error);
        // Handle specific errors as needed, e.g., show a generic error page
        // redirect("/auth/error?message=network_error");
    }
}

// Define the signOut action as a separate, named server action function
export async function handleSignOut() {
    // This function automatically inherits the "use server" context from the file
    await auth.api.signOut({
        headers: headers(),
    });
    redirect("/"); // Redirect after successful sign-out
}