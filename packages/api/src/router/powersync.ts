// packages/api/src/router/powersync.ts
import { z } from 'zod';
import { protectedProcedure } from '../trpc'; // Assuming your tRPC setup

import { generatePowerSyncToken } from '../services/powersync';
import { TRPCError } from '@trpc/server';

export const powersyncRouter = {
    getCredentials: protectedProcedure // Change to protectedProcedure
        .input(z.object({ id: z.string().uuid() })) // Assuming Todo.id is a UUID, enforce it with .uuid()
        .query(({ ctx }) => {
            const userId = ctx.session.user.id;

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