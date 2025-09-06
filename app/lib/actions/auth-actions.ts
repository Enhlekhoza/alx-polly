'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';

/**
 * Logs in a user with their email and password.
 *
 * This function signs in a user by making a request to the Supabase authentication service.
 * It returns an object indicating success or failure.
 *
 * @param data - An object containing the user's email and password.
 * @returns An object with an error message if login fails, otherwise { error: null }.
 */
export async function login(data: LoginFormData) {
  const supabase = await createClient();

  // Attempt to sign in the user with the provided credentials.
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    // If the authentication service returns an error, pass it back to the caller.
    return { error: error.message };
  }

  // On successful login, return null for the error.
  return { error: null };
}

/**
 * Registers a new user with their name, email, and password.
 *
 * This function creates a new user account in the Supabase authentication system.
 * It includes the user's name in the user_metadata.
 *
 * @param data - An object containing the user's name, email, and password.
 * @returns An object with an error message if registration fails, otherwise { error: null }.
 */
export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  // Attempt to sign up a new user.
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        // Add the user's name to their profile data.
        name: data.name,
      },
    },
  });

  if (error) {
    // If registration fails, return the error message.
    return { error: error.message };
  }

  // On successful registration, return null for the error.
  return { error: null };
}

/**
 * Logs out the currently authenticated user.
 *
 * This function signs the user out of their current session by calling the Supabase signOut method.
 *
 * @returns An object with an error message if logout fails, otherwise { error: null }.
 */
export async function logout() {
  const supabase = await createClient();

  // Sign out the current user.
  const { error } = await supabase.auth.signOut();
  if (error) {
    // If signOut fails, return the error.
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Retrieves the currently authenticated user's data.
 *
 * This function fetches the user object from the current session.
 * It is useful for server-side checks to determine if a user is logged in.
 *
 * @returns The user object if a user is authenticated, otherwise null.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  // Return the user object from the session data.
  return data.user;
}

/**
 * Retrieves the current authentication session.
 *
 * This function fetches the session object, which includes the access token and user data.
 * It can be used to verify a user's session on the server.
 *
 * @returns The session object if it exists, otherwise null.
 */
export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  // Return the current session data.
  return data.session;
}