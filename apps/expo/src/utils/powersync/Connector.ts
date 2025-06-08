// apps/expo/utils/powersync/Connector.ts
import type { PowerSyncBackendConnector, AbstractPowerSyncDatabase } from "@powersync/react-native";
import { UpdateType } from "@powersync/react-native";
// import { env } from "~/env";

/**
 * The PowerSyncBackendConnector provides the connection between your application backend
 * and the PowerSync client-side managed SQLite database.
 */
export class Connector implements PowerSyncBackendConnector {
    fetchCredentials() {
        return Promise.resolve({
            endpoint: "https://6841a88643ddacf4d37c19be.powersync.journeyapps.com", // Replace with your actual project endpoint if needed
            developmentToken: true

        }) as any;
    }

    /**
     * Implement uploadData to send local changes to your backend service.
     * This method will be called by PowerSync when there are local changes
     * that need to be pushed to your backend.
     *
     * IMPORTANT: You MUST implement your backend API calls here.
     * PowerSync only manages the client-side data; it does not push to your custom backend.
     */
    async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
        const transaction = await database.getNextCrudTransaction();
        if (!transaction) {
            return;
        }

        console.log(`Uploading PowerSync transaction: ${transaction.crud.length} operations`);

        for (const op of transaction.crud) {
            const record = { ...op.opData, id: op.id };
            switch (op.op) {
                case UpdateType.PUT: // INSERT or initial CREATE
                    console.log(`PowerSync PUT operation (create/insert) for todo ${record.id}:`, record);
                    // TODO: Replace with your actual tRPC mutation call:
                    // await api.todo.create.mutate(record);
                    break;
                case UpdateType.PATCH: // UPDATE
                    console.log(`PowerSync PATCH operation (update) for todo ${record.id}:`, record);
                    // TODO: Replace with your actual tRPC mutation call:
                    // await api.todo.update.mutate({ id: record.id, ...record });
                    break;
                case UpdateType.DELETE: // DELETE
                    console.log(`PowerSync DELETE operation for todo ${record.id}`);
                    // TODO: Replace with your actual tRPC mutation call:
                    // await api.todo.delete.mutate({ id: record.id });
                    break;
            }
        }
        await transaction.complete();
        console.log('PowerSync transaction completed.');
    }
}