import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://xyjohiqaiarlbvacxkvv.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5am9oaXFhaWFybGJ2YWN4a3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MTgyOTgsImV4cCI6MjA5NzA5NDI5OH0.ENWbCl0CuQon7YRJP5xzw0AnJ3Q1OjOe6JyQ9SQWfXA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "implicit",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
