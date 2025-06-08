// apps/nextjs/src/app/api/powersync/webhook/route.ts
import type { NextRequest } from 'next/server';
import * as crypto from 'crypto';
import { db } from '@acme/db/client'; // Your Drizzle DB instance
import { eq } from 'drizzle-orm'; // Import eq for WHERE clauses
import { Todo } from '@acme/db/schema'; // Assuming you have this schema
import { env } from '~/env';

// Ensure this environment variable is set
const POWERSYNC_WEBHOOK_SECRET = env.POWERSYNC_WEBHOOK_SECRET ?? ''; // From PowerSync Dashboard -> Webhooks

if (!POWERSYNC_WEBHOOK_SECRET) {
    console.error('Missing PowerSync environment variable (POWERSYNC_WEBHOOK_SECRET)!');
}

/**
 * Verifies the signature of the incoming webhook request.
 * @param rawBody The raw request body string.
 * @param signature The 'x-powersync-signature' header value.
 * @param secret The webhook secret from PowerSync Dashboard.
 * @returns True if the signature is valid, false otherwise.
 */
async function verifyWebhookSignature(rawBody: string, signature: string, secret: string): Promise<boolean> {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const digest = hmac.digest('hex');
    return digest === signature;
}

/**
 * Applies PowerSync mutations to your PostgreSQL database.
 * This is a simplified example. Production-ready code needs more robust error handling,
 * transaction management, and potentially detailed logging.
 * @param mutations An array of mutation objects from the webhook payload.
 */
async function applyPowerSyncMutations(mutations: unknown[]) {
    for (const mutation of mutations) {
        const { op, table, data, id, client_id: _client_id, user_id: _user_id } = mutation as {
            op: string;
            table: string;
            data: Partial<typeof Todo.$inferInsert>;
            id: string;
            client_id?: string;
            user_id?: string;
        }; // PowerSync mutation fields
        // `id` is the primary key for the row in your database.
        // `user_id` is the `user_id` from the JWT that initiated the mutation.
        // `client_id` is the unique ID of the client that originated the mutation.

        // Map table name to your Drizzle schema table.
        // IMPORTANT: Implement robust mapping for all your tables.
        let targetTable: typeof Todo | undefined; // Adjust type based on your Drizzle schema
        switch (table) {
            case 'todos':
                targetTable = Todo; // Assuming your Todo is imported
                break;
            // Add other tables as needed (e.g., 'lists': listsTable)
            default:
                console.warn(`Webhook received mutation for unknown table: ${table}`);
                continue;
        }

        if (!targetTable) {
            console.error(`Drizzle table mapping missing for PowerSync table: ${table}`);
            continue;
        }

        try {
            if (op === 'PUT' || op === 'PATCH') {
                // Ensure all required fields are present
                if (data.title && data.content && data.owner) {
                    await db.insert(targetTable).values(data as typeof Todo.$inferInsert).onConflictDoUpdate({
                        target: targetTable.id,
                        set: data as typeof Todo.$inferInsert,
                    });
                    console.log(`Applied ${op} mutation for table ${table}, id ${id}`);
                } else {
                    console.warn(`Skipping mutation for table ${table}, id ${id}: missing required fields`, data);
                }
            } else if (op === 'DELETE') {
                // DELETE: Delete the row.
                // IMPORTANT: Implement row-level security here if not fully handled by sync rules.
                await db.delete(targetTable).where(eq(targetTable.id, id));
                console.log(`Applied DELETE mutation for table ${table}, id ${id}`);
            }
        } catch (error) {
            console.error(`Error applying webhook mutation for table ${table}, id ${id}, op ${op}:`, error);
            // In production: Log to a dedicated error tracking system, consider a dead-letter queue.
            // You might throw an error here to tell PowerSync to retry the webhook.
        }
    }
}

export async function POST(request: NextRequest) {
    // Read the raw request body. Next.js does not parse JSON for raw body by default.
    const rawBody = await request.text();
    const signature = request.headers.get('x-powersync-signature');

    if (!signature) {
        return new Response('Unauthorized: Missing signature', { status: 401 });
    }

    // Verify the webhook signature
    const isSignatureValid = await verifyWebhookSignature(rawBody, signature, POWERSYNC_WEBHOOK_SECRET);

    if (!isSignatureValid) {
        console.warn('Webhook signature verification failed.');
        return new Response('Unauthorized: Invalid signature', { status: 401 });
    }

    try {
        const payload = JSON.parse(rawBody) as { mutations: unknown[] };
        const mutations = payload.mutations;

        if (!Array.isArray(mutations)) {
            console.error('Webhook payload "mutations" is not an array:', payload);
            return new Response('Bad Request: Invalid mutations payload', { status: 400 });
        }

        // Apply the mutations to your PostgreSQL database
        await applyPowerSyncMutations(mutations);

        return new Response('Webhook processed successfully', { status: 200 });
    } catch (error) {
        console.error('Error processing PowerSync webhook:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}