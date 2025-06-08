// apps/expo/utils/powersync/system.ts
import { PowerSyncDatabase } from '@powersync/react-native'; // Correct import for Quick SQLite
import { AppSchema } from './AppSchema';
import { Connector } from './Connector';

/**
 * Global PowerSyncDatabase instance.
 * Configured to use @journeyapps/react-native-quick-sqlite implicitly
 * by specifying the dbFilename directly.
 */
export const powersync = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
        dbFilename: 'powersync.db' // For @journeyapps/react-native-quick-sqlite
    }
});

/**
 * Sets up and connects the PowerSync database.
 * This function should be called early in your app's lifecycle,
 * typically after authentication.
 */
export const setupPowerSync = () => {
    const connector = new Connector();
    void powersync.connect(connector);
    console.log('PowerSync database connected with connector.');
};

/**
 * NOTE: The Connector is configured for development tokens in local development mode.
 * For production, update the Connector to fetch JWTs from your backend.
 */