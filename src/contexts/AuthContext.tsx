
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  signUp: (email: string, password: string, userData: { full_name: string, username: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully');
          // Don't navigate here as fetchUserProfile will handle it
          if (session?.user) {
            // Use setTimeout to avoid Supabase auth deadlock
            setTimeout(() => {
              fetchUserProfile(session.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out');
          setUserProfile(null);
          navigate('/login');
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string, userData: { full_name: string, username: string }) => {
    try {
      setLoading(true);
      
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', userData.username.toLowerCase())
        .single();
      
      if (existingUser) {
        toast.error('Username already taken, please try another one');
        return;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username.toLowerCase(),
          },
        },
      });

      if (error) throw error;
      
      toast.success('Check your email for the confirmation link');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserProfile(null);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    userProfile,
    signUp,
    signIn,
    signOut,
    loading,
    profileLoading,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
