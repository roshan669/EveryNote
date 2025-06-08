// apps/expo/utils/powersync/AppSchema.ts
import { Schema, Table, Column, ColumnType } from '@powersync/react-native';

/**
 * Define your PowerSync database schema here.
 * This should mirror your backend PostgreSQL schema as closely as possible.
 */
export const AppSchema = new Schema([
    new Table({
        name: 'todo',
        columns: [
            new Column({ name: 'description', type: ColumnType.TEXT }),
            new Column({ name: 'completed', type: ColumnType.TEXT }), // Boolean stored as BLOB (0 or 1)
            new Column({ name: 'created_at', type: ColumnType.TEXT }), // ISO string
            new Column({ name: 'completed_at', type: ColumnType.TEXT }), // ISO string, nullable
            new Column({ name: 'created_by', type: ColumnType.TEXT }),
            new Column({ name: 'completed_by', type: ColumnType.TEXT }), // Nullable
            new Column({ name: 'list_id', type: ColumnType.TEXT }) // For future list management
        ]
    })
]);

// TypeScript interface for your todo records, for type safety
export interface TodoRecord {
    id: string;
    description: string;
    completed: number | boolean; // Store as 0/1 in SQLite, but can be boolean in app
    created_at: Date | string; // Store as ISO string in SQLite, but can be Date object in app
    completed_at: Date | string | null;
    created_by: string;
    completed_by: string | null;
    list_id: string;
}