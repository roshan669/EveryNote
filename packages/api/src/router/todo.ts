import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { and, desc, eq } from "@acme/db";
import { CreateTodoSchema, Todo } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const todoRouter = {
  all: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id; // Get the user ID from the protected context

    return ctx.db.query.Todo.findMany({
      where: eq(Todo.owner, userId), // Filter by the owner's ID
      orderBy: desc(Todo.created_at), // It's often better to order by creation date
      limit: 10, // You might want to make this configurable with input
    });
  }),

  byId: protectedProcedure // Change to protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // Assuming Todo.id is a UUID, enforce it with .uuid()
    .query(({ ctx, input }) => {
      const userId = ctx.session.user.id; // Get the user ID from the protected context

      return ctx.db.query.Todo.findFirst({
        // where: eq(Todo.id, input.id),
        // Add an additional condition to ensure the todo belongs to the current user
        // This prevents users from fetching other users' todos by guessing IDs.
        // Drizzle allows combining conditions with AND implicitly in `where`
        where: and(eq(Todo.id, input.id), eq(Todo.owner, userId)),
      });
    }),

  create: protectedProcedure
    .input(CreateTodoSchema) // CreateTodoSchema should NOT contain 'owner'
    .mutation(async ({ ctx, input }) => { // Make async since Drizzle operations are async
      const userId = ctx.session.user.id; // Get the user ID from the protected context

      // Insert the todo, adding the owner ID from the session
      const [newTodo] = await ctx.db.insert(Todo).values({
        ...input, // title, content etc. from client
        owner: userId, // Set the owner from the authenticated user's ID
      }).returning(); // Use .returning() to get the inserted object back

      return newTodo; // Return the created todo object
    }),

  delete: protectedProcedure
    .input(z.string().uuid()) // Ensure input is a valid UUID
    .mutation(async ({ ctx, input }) => { // Make async
      const userId = ctx.session.user.id; // Get the user ID from the protected context

      // Delete the todo, but only if its ID matches AND its owner matches the current user.
      const result = await ctx.db.delete(Todo)
        .where(and(eq(Todo.id, input), eq(Todo.owner, userId)))
        .returning({ id: Todo.id }); // Optionally return the ID of the deleted todo

      // You might want to check if a todo was actually deleted
      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND", // Or FORBIDDEN if the user tried to delete someone else's todo
          message: "Todo not found or you don't have permission to delete it.",
        });
      }

      return { id: input }; // Indicate successful deletion of the given ID
    }),
} satisfies TRPCRouterRecord;
