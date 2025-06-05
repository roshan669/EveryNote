// schemas/relations.ts (or add to your existing schema files)
import { relations } from 'drizzle-orm';
import { user } from './auth-schema'; // Your user schema
import { Todo } from './schema';       // Your Todo schema

export const userRelations = relations(user, ({ many }) => ({
    // A user can have many todos
    todos: many(Todo),
}));

export const todoRelations = relations(Todo, ({ one }) => ({
    // A todo belongs to one owner (user)
    owner: one(user, {
        fields: [Todo.owner], // This is the foreign key field in the Todo table
        references: [user.id], // This is the primary key field in the user table
    }),
}));