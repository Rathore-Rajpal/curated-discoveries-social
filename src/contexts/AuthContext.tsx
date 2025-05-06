import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      try {
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Get profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!mounted) return;
          
          if (error) {
            console.error('Profile error:', error);
            setError(error.message);
          } else if (profile) {
            setUserProfile(profile as UserProfile);
          }
        }
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (!mounted) return;
        
        if (error) {
          console.error('Profile error:', error);
          setError(error.message);
        } else if (profile) {
          setUserProfile(profile as UserProfile);
        }
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('AuthProvider: Starting profile fetch for user:', userId);
      setProfileLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthProvider: Error fetching user profile:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log('AuthProvider: Profile fetch successful:', { 
        userId: data?.id,
        username: data?.username 
      });
      
      if (data) {
        setUserProfile(data as UserProfile);
      }
    } catch (error: any) {
      console.error('AuthProvider: Error fetching profile:', error);
      setError(error.message);
    } finally {
      console.log('AuthProvider: Profile fetch complete');
      setProfileLoading(false);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Trim email
      const trimmedEmail = email.trim().toLowerCase();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error(error.message || 'Failed to sign in');
      }

      if (!data.user) {
        throw new Error('No user found');
      }

      // Fetch user profile
      await fetchUserProfile(data.user.id);

      toast.success('Signed in successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    username: string
  ) => {
    try {
      setLoading(true);

      // Validate inputs
      if (!email || !password || !name || !username) {
        throw new Error('All fields are required');
      }

      // Trim all inputs
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      const trimmedUsername = username.toLowerCase().trim();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Check username length and format
      if (trimmedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }
      if (trimmedUsername.length > 30) {
        throw new Error('Username must be less than 30 characters');
      }
      const usernameRegex = /^[a-z0-9_]+$/;
      if (!usernameRegex.test(trimmedUsername)) {
        throw new Error('Username can only contain lowercase letters, numbers, and underscores');
      }

      // Check password length and complexity
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      if (password.length > 72) {
        throw new Error('Password must be less than 72 characters');
      }

      // Check if username exists
      const { data: existingUsers, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', trimmedUsername);

      if (usernameCheckError) {
        console.error('Username check error:', usernameCheckError);
        throw new Error('Failed to check username availability');
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Username is already taken');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            username: trimmedUsername,
          },
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(authError.message || 'Failed to create account');
      }

      if (!authData.user) {
        throw new Error('Failed to create account');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: trimmedUsername,
          full_name: trimmedName,
          email: trimmedEmail,
          avatar_url: null,
          cover_url: null,
          bio: null,
          email_verified: true,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Cleanup if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error('Failed to create user profile');
      }

      // Show success message
      toast.success('Account created successfully! You can now log in.');
      navigate('/login');

    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear all state
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setError(null);
      
      // Navigate to home page
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  if (loading) {
    console.log('AuthProvider: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-brand-purple-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log('AuthProvider: Rendering with state:', { user, session, loading });
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
