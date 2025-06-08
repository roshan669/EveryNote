import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getSession } from '@acme/auth';
import { env } from 'process'; // Import env from process

export async function POST(request: NextRequest) {
    // Get the user session (adapt to your auth system)
    const session = await getSession();
    if (!session?.user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Generate a PowerSync JWT for this user
    // You must have POWERSYNC_PRIVATE_KEY in your env
    const privateKey = env.POWERSYNC_PRIVATE_KEY;
    if (!privateKey) {
        return new Response('PowerSync private key not configured', { status: 500 });
    }

    // The subject should be the user id
    const token = jwt.sign(
        {
            sub: session.user.id,
            // Add any other claims required by PowerSync
        },
        privateKey,
        {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'your-issuer', // Optional: set to your project or org
            audience: env.POWERSYNC_PROJECT_ID, // Optional: set to your PowerSync project id
        }
    );

    return Response.json({ token });
}
