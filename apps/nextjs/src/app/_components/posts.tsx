"use client";

// No 'useSession' from 'next-auth/react' as confirmed you're using better-auth
// import { useSession } from "next-auth/react";

import type { RouterOutputs } from "@acme/api"; // Correct import for RouterOutputs type
import { CreateTodoSchema } from "@acme/db/schema"; // Schema for your todo creation form
import { cn } from "@acme/ui"; // Utility for conditional class names
import { Button } from "@acme/ui/button"; // Button component
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useForm, // Form components and hook
} from "@acme/ui/form";
import { Input } from "@acme/ui/input"; // Input component
import { toast } from "@acme/ui/toast"; // Toast notification component
import { useState } from "react";

import { api } from "~/trpc/react"; // Your tRPC client setup for React components

/**
 * Renders a form for creating new todo/post items.
 * This component uses a tRPC mutation to send data to the server.
 */
export function CreatePostForm() {
  // Initialize form with Zod schema for validation
  const form = useForm({
    schema: CreateTodoSchema,
    defaultValues: {
      content: "",
      title: "",
    },
  });

  // Access tRPC utilities for invalidating queries after a mutation
  const utils = api.useUtils();

  // Define the tRPC mutation for creating a todo/post
  const createPost = api.todo.create.useMutation({
    // On successful creation: reset the form and invalidate the 'todo.all' query
    // to refetch the updated list of posts.
    onSuccess: async () => {
      form.reset(); // Clear form fields

      await utils.todo.invalidate(); // Trigger a refetch of all todos
      toast.success("Todo created successfully");
    },
    // On error: display a toast message, distinguishing between UNAUTHORIZED and other errors.
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to create a post"
          : "Failed to create post",
      );
    },
  });

  // Render the form
  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-2xl flex-col gap-4"
        onSubmit={form.handleSubmit((data) => {
          createPost.mutate(data);
        })}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Content" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}

/**
 * Renders a list of posts, conditionally fetching them based on user authentication status.
 * Handles loading, unauthenticated, error, and empty states.
 */
export function PostList() {
  const { data: sessionData, isLoading: isSessionLoading } =
    api.auth.getSession.useQuery();

  const isAuthenticated = !!sessionData?.user;

  // 3. Fetch the list of all todos/posts using tRPC's todo.all query.
  //    This query is 'enabled' only if the session data has finished loading and the user is authenticated.
  const {
    data: posts,
    isLoading: isLoadingPosts,
    error: postsError,
  } = api.todo.all.useQuery(
    undefined, // No input needed for todo.all
    {
      // Only enable the todo query if the session has finished loading AND the user is authenticated
      enabled: !isSessionLoading && isAuthenticated,
      // --- FIX IS HERE: 'onError' is a top-level option for the query config ---
      onError: (err) => {
        // This onError is for the 'posts' query
        console.error("Error fetching todos:", err);
        toast.error(
          err.data?.code === "UNAUTHORIZED"
            ? "Your session expired. Please log in again."
            : "Failed to fetch posts",
        );
      },
      // refetchOnWindowFocus: false,
    },
  );

  // --- Conditional Rendering Logic ---

  // Display a loading indicator while the authentication session is being determined.
  if (isSessionLoading) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Display a message prompting the user to log in if they are not authenticated
  // after the session has finished loading.
  if (!isAuthenticated) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">
            Please log in to view posts.
          </p>
        </div>
      </div>
    );
  }

  // Display a loading indicator while the posts are being fetched (only runs if authenticated).
  if (isLoadingPosts) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">Loading your posts...</p>
        </div>
      </div>
    );
  }

  // Display an error message if there was a problem fetching the posts.
  if (postsError) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">
            Error loading posts: {postsError.message}
          </p>
        </div>
      </div>
    );
  }

  // Display a message if no posts are found after successfully loading (and being authenticated).
  if (!posts || posts.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">No posts yet</p>
        </div>
      </div>
    );
  }

  // If all checks pass, display the list of posts.
  return (
    <div className="flex w-full flex-col gap-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}

/**
 * Renders a single post card with title, content, and a delete button.
 * Uses a tRPC mutation for deleting a post.
 */
export function PostCard(props: {
  post: RouterOutputs["todo"]["all"][number]; // Type for a single post from the 'todo.all' output
}) {
  const utils = api.useUtils(); // Access tRPC utilities for invalidation
  // Define the tRPC mutation for deleting a todo/post
  const deletePost = api.todo.delete.useMutation({
    // On successful deletion: invalidate the 'todo.all' query to refetch the updated list.
    onSuccess: async () => {
      await utils.todo.invalidate(); // Trigger a refetch of all todos
    },
    // On error: display a toast message, distinguishing between UNAUTHORIZED and other errors.
    onError: (err) => {
      toast.error(
        err.data?.code === "UNAUTHORIZED"
          ? "You must be logged in to delete a post"
          : "Failed to delete post",
      );
    },
  });

  return (
    <div className="flex flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <h2 className="text-2xl font-bold text-primary">{props.post.title}</h2>
        <p className="mt-2 text-sm">{props.post.content}</p>
      </div>
      <div>
        <Button
          variant="ghost"
          className="cursor-pointer text-sm font-bold uppercase text-primary hover:bg-transparent hover:text-white"
          onClick={() => deletePost.mutate(props.post.id)} // Call delete mutation on click
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

/**
 * Renders a skeleton loading card for posts.
 */
export function PostCardSkeleton(props: { pulse?: boolean }) {
  const { pulse = true } = props; // Prop to control pulse animation
  return (
    <div className="flex flex-row rounded-lg bg-muted p-4">
      <div className="flex-grow">
        <h2
          className={cn(
            "w-1/4 rounded bg-primary text-2xl font-bold",
            pulse && "animate-pulse", // Apply pulse animation if 'pulse' is true
          )}
        >
          &nbsp; {/* Non-breaking space to ensure element has height */}
        </h2>
        <p
          className={cn(
            "mt-2 w-1/3 rounded bg-current text-sm",
            pulse && "animate-pulse", // Apply pulse animation if 'pulse' is true
          )}
        >
          &nbsp; {/* Non-breaking space to ensure element has height */}
        </p>
      </div>
    </div>
  );
}
