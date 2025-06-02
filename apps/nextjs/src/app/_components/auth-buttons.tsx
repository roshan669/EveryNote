// app/components/auth-buttons.tsx
"use client"; // This directive is CRUCIAL for this file

import { handleSignIn, handleSignOut } from "@/app/components/actions/auth"; // Import your server actions
import { Button } from "@acme/ui/button"; // Assuming your Button component is working

interface AuthButtonsProps {
  userName?: string; // Optional: user's name if logged in
}

/**
 * AuthButtons Client Component
 *
 * This component displays sign-in or sign-out buttons based on authentication status.
 * It uses server actions to handle the actual authentication logic.
 */
export function AuthButtons({ userName }: AuthButtonsProps) {
  if (!userName) {
    return (
      <form>
        <Button
          size="lg"
          formAction={handleSignIn} // Pass the server action to formAction
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign in with Discord
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        <span>Logged in as **{userName}**</span>
      </p>

      <form>
        <Button
          size="lg"
          formAction={handleSignOut} // Pass the server action to formAction
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign out
        </Button>
      </form>
    </div>
  );
}
