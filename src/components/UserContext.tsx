"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useSupabase } from '@/components/SupabaseContext';
import { useRouter } from 'next/navigation';
import { type Profile } from "@/types/drizzle";

export type UserContextType = {
  supabaseUser: SupabaseUser | null;
  profile: Profile | null;
  setUser: (user: { supabaseUser: SupabaseUser | null; profile: Profile | null }) => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  supabaseUser: null,
  profile: null,
  setUser: () => {},
  isLoading: true,
  signOut: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { client: supabase } = useSupabase();
  const router = useRouter();

  const setUser = ({ supabaseUser, profile }: { supabaseUser: SupabaseUser | null; profile: Profile | null }) => {
    setSupabaseUser(supabaseUser);
    setProfile(profile);
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setSupabaseUser(null);
      setProfile(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile when supabase user changes
  useEffect(() => {
    const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", supabaseUser.id)
          .single();

        setProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setProfile(null);
      }
    };

    if (supabaseUser) {
      fetchUserProfile(supabaseUser);
    } else {
      setProfile(null);
    }
  }, [supabaseUser, supabase]);

  // Listen to auth state changes
  useEffect(() => {
    setIsLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
      } else {
        setSupabaseUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{
      supabaseUser,
      profile,
      setUser,
      isLoading,
      signOut,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};