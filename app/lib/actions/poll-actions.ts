"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new poll in the database.
 *
 * This server action takes form data, validates it, and inserts a new poll
 * into the 'polls' table. It ensures the user is authenticated before
 * allowing poll creation.
 *
 * @param formData - The form data from the poll creation form.
 *                   Expected to contain 'question' and 'options'.
 * @returns An object with either an 'error' message or 'error: null' on success.
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Basic validation for question and options.
  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get the current authenticated user.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  // Insert the new poll into the database.
  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  // Revalidate the '/polls' path to show the new poll in the list.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Fetches all polls created by the currently authenticated user.
 *
 * @returns An object containing the user's polls or an error message.
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

/**
 * Fetches a single poll by its ID.
 *
 * @param id - The UUID of the poll to retrieve.
 * @returns An object containing the poll data or an error message.
 */
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

/**
 * Submits a vote for a specific poll option.
 *
 * This action records a vote in the 'votes' table. It can be configured
 * to allow anonymous voting or require user authentication.
 *
 * @param pollId - The ID of the poll being voted on.
 * @param optionIndex - The index of the selected option.
 * @returns An object with an error message on failure, or null on success.
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The user ID is optional, allowing for anonymous votes.
  // If user is null, user_id in the database will be null.
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Deletes a poll from the database.
 *
 * @param id - The ID of the poll to delete.
 * @returns An object with an error message on failure, or null on success.
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) return { error: error.message };

  // Revalidate the path to update the UI after deletion.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates an existing poll with new data.
 *
 * This action requires the user to be authenticated and to be the owner
 * of the poll they are trying to update.
 *
 * @param pollId - The ID of the poll to update.
 * @param formData - The new data for the poll.
 * @returns An object with an error message on failure, or null on success.
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // The .eq('user_id', user.id) ensures that users can only update their own polls.
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}