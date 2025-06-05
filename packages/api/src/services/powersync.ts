// packages/api/src/services/powersync.ts
import * as jwt from 'jsonwebtoken'; // pnpm install jsonwebtoken

// Ensure these are correctly loaded from your environment variables
const POWERSYNC_PROJECT_ID = process.env.POWERSYNC_PROJECT_ID || '';
const POWERSYNC_PRIVATE_KEY = process.env.POWERSYNC_PRIVATE_KEY || ''; // THIS IS CRUCIAL: From PowerSync Dashboard -> Authentication -> Custom Auth

if (!POWERSYNC_PROJECT_ID || !POWERSYNC_PRIVATE_KEY) {
    console.error('Missing PowerSync environment variables (POWERSYNC_PROJECT_ID, POWERSYNC_PRIVATE_KEY)!');
    // In a production app, you'd want to throw an error or handle this more robustly
}

/**
 * Generates a signed JWT for PowerSync authentication.
 * @param userId The ID of the authenticated user.
 * @param customClaims Optional custom claims to include in the JWT (e.g., user roles).
 * @returns A signed JWT string.
 */
export function generatePowerSyncToken(userId: string, customClaims?: Record<string, any>): string {
    if (!POWERSYNC_PROJECT_ID || !POWERSYNC_PRIVATE_KEY) {
        throw new Error('PowerSync: POWERSYNC_PROJECT_ID or POWERSYNC_PRIVATE_KEY is not configured.');
    }

    const payload = {
        user_id: userId, // PowerSync uses this for `request.user_id()` in sync rules
        ...customClaims,
    };

    const options: jwt.SignOptions = {
        algorithm: 'RS256', // PowerSync requires RS256 for private key signing
        issuer: 'powersync-sdk', // A common issuer identifier
        audience: POWERSYNC_PROJECT_ID,
        expiresIn: '1h', // Token valid for 1 hour, client will refresh
    };

    try {
        // The private key must be in PEM format. Replace '\n' if stored as a single string.
        const privateKeyPem = POWERSYNC_PRIVATE_KEY.replace(/\\n/g, '\n');
        return jwt.sign(payload, privateKeyPem, options);
    } catch (error) {
        console.error('Error signing PowerSync JWT:', error);
        throw new Error('Failed to generate PowerSync authentication token.');
    }
}