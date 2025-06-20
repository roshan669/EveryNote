import { authRouter } from "./router/auth";
import { todoRouter } from "./router/todo";
import { powersyncRouter } from "./router/powersync";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  todo: todoRouter,
  powersync: powersyncRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
