// packages/api/src/router/powersync.ts
import { z } from 'zod';
import { publicProcedure } from '../trpc'; // Assuming your tRPC setup

import { generatePowerSyncToken } from '../services/powersync';
import { TRPCError } from '@trpc/server';

export const powersyncRouter = {
    getCredentials: publicProcedure // You might want to make this protected and get userId from session
        .input(z.object({ userId: z.string().optional() })) // Accept userId as input or get from session
        .mutation(async ({ input }) => {
            // **IMPORTANT**: In a real app, you would get the `userId` from your
            // authentication system (e.g., NextAuth.js session: `ctx.session.user.id`).
            // For this example, we'll use a placeholder or the input.
            const userId = input.userId || 'anonymous-user'; // Replace with actual authenticated user ID

            if (!userId) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required to generate PowerSync credentials.',
                });
            }

            const token = generatePowerSyncToken(userId);
            console.log(`Generated PowerSync token for user: ${userId}`);

            return {
                endpoint: `https://api.powersync.com/v1/${process.env.POWERSYNC_PROJECT_ID}`,
                token: token,
            };
        }),
};