import { supabase } from '../config.js';

export const useAuth = () => {
  const loginUser = async (email, password) => {
    try {
      const { data: user, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { user, loginError };
    } catch (error) {
      console.error("Error logging in", error);
      return { user: null, loginError: error };
    }
  };

  const logoutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return { loginUser, logoutUser };
};
