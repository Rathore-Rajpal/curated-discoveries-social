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
  cover_url: string | null;
  bio: string | null;
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
    console.log('AuthProvider: Initializing auth state...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider: Initial session check:', { session, error });
      if (error) {
        console.error('AuthProvider: Error getting session:', error);
        setError(error.message);
        setLoading(false);
        return;
      }
      
      console.log('AuthProvider: Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state changed:', { event, session });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('AuthProvider: Fetching user profile for:', userId);
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthProvider: Error fetching user profile:', error);
        setError(error.message);
        return;
      }

      console.log('AuthProvider: Fetched user profile:', data);
      if (data) {
        setUserProfile(data as unknown as UserProfile);
      }
    } catch (error: any) {
      console.error('AuthProvider: Error fetching profile:', error);
      setError(error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Starting sign in process...');
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthProvider: Sign in error:', error);
        throw error;
      }

      console.log('AuthProvider: Sign in successful');
      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('AuthProvider: Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, username: string) => {
    try {
      // Debug logging for raw inputs
      console.log('Raw inputs:', {
        email: typeof email,
        password: typeof password,
        name: typeof name,
        username: typeof username
      });

      setLoading(true);
      
      // Convert inputs to strings and trim them
      const trimmedEmail = email ? String(email).trim() : '';
      const trimmedPassword = password ? String(password).trim() : '';
      const trimmedName = name ? String(name).trim() : '';
      const trimmedUsername = username ? String(username).trim() : '';

      // Debug logging for trimmed values
      console.log('Trimmed values:', {
        email: trimmedEmail,
        password: trimmedPassword,
        name: trimmedName,
        username: trimmedUsername
      });

      // Validate input
      const validationErrors = [];
      if (!trimmedEmail) validationErrors.push('Email is required');
      if (!trimmedPassword) validationErrors.push('Password is required');
      if (!trimmedName) validationErrors.push('Name is required');
      if (!trimmedUsername) validationErrors.push('Username is required');

      if (validationErrors.length > 0) {
        console.log('Validation errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }

      if (trimmedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (trimmedPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // First, check if username is available
      console.log('Checking username availability...');
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', trimmedUsername)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking username:', checkError);
        throw new Error('Error checking username availability');
      }

      if (existingUser) {
        console.log('Username already taken');
        throw new Error('Username is already taken');
      }

      // Create the auth user with email confirmation
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          data: {
            name: trimmedName,
            username: trimmedUsername,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        console.error('No user data returned from signup');
        throw new Error('No user data returned from signup');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Create the profile
      console.log('Creating user profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: trimmedUsername,
          full_name: trimmedName,
          avatar_url: null,
          cover_url: null,
          bio: null,
          email_verified: false
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error('Failed to create profile. Please try again.');
      }

      console.log('Profile created successfully');
      
      // Show success message with email verification instructions
      toast.success(
        <div className="flex flex-col gap-2">
          <p>Account created successfully!</p>
          <p>Please check your email to verify your account.</p>
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or click the button below to resend.
          </p>
          <button
            onClick={async () => {
              try {
                const { error } = await supabase.auth.resend({
                  type: 'signup',
                  email: trimmedEmail,
                });
                if (error) throw error;
                toast.success('Verification email resent!');
              } catch (error: any) {
                toast.error(error.message || 'Failed to resend verification email');
              }
            }}
            className="text-sm text-brand-purple hover:underline"
          >
            Resend verification email
          </button>
        </div>,
        {
          duration: 10000,
        }
      );

      // Navigate to a page that explains the verification process
      navigate('/verify-email');
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
      console.log('AuthProvider: Starting sign out process...');
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthProvider: Sign out error:', error);
        throw error;
      }
      
      // Clear all state
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setError(null);
      
      // Navigate to home page
      navigate('/');
      console.log('AuthProvider: Sign out successful');
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('AuthProvider: Sign out error:', error);
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
