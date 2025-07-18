import { supabase } from '../config.js';
import { Notify } from 'quasar';

const allowedRoles = import.meta.env.VITE_ALLOWED_ROLES?.split(',').map(r => r.trim().toLowerCase()) || [];

export const useAuth = () => {
  const loginUser = async (email, password) => {
  try {
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      return { user: null, loginError };
    }

    const userId = session?.user?.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('position')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.position) {
      await supabase.auth.signOut();
      Notify.create({ type: 'negative', message: 'Unable to verify your user role.' });
      return { user: null, loginError: new Error('No position found in profile') };
    }

    const position = profile.position.trim().toLowerCase();

    if (!allowedRoles.includes(position)) {
      await supabase.auth.signOut();
      Notify.create({ type: 'negative', message: 'You are not allowed to access this system.' });
      return { user: null, loginError: new Error('Unauthorized domain access') };
    }

    return { user: session.user, loginError: null };
  } catch (error) {
    console.error("Error logging in", error);
    return { user: null, loginError: error };
  }
}; 

  const logoutUser = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        localStorage.clear();
        sessionStorage.clear();
        Notify.create({ type: 'info', message: 'Logged out successfully.' });
      }
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return { loginUser, logoutUser };
};
