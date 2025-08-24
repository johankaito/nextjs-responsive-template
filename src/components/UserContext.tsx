"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useSupabase } from '@/components/SupabaseContext';
import { useRouter } from 'next/navigation';
import { type TofilUser } from "@/types/drizzle";

export type UserContextType = {
  supabaseUser: SupabaseUser | null;
  tofilUser: TofilUser | null;
  setUser: (user: { supabaseUser: SupabaseUser | null; tofilUser: TofilUser | null }) => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  supabaseUser: null,
  tofilUser: null,
  setUser: () => {},
  isLoading: true,
  signOut: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [tofilUser, setTofilUser] = useState<TofilUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { client: supabase } = useSupabase();
  const router = useRouter();

  const setUser = ({ supabaseUser, tofilUser }: { supabaseUser: SupabaseUser | null; tofilUser: TofilUser | null }) => {
    setSupabaseUser(supabaseUser);
    setTofilUser(tofilUser);
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser({ supabaseUser: null, tofilUser: null });
    router.push('/login');
  };

  // Session and user fetching logic
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          setSupabaseUser(null);
          setTofilUser(null);
          setIsLoading(false);
          return;
        }
        setSupabaseUser(user);
        setIsLoading(false);
      } catch {
        console.error("DEBUG::error in checkSession");
        setIsLoading(false);
      }
    })();
    // Listen for session changes and refresh user context
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSupabaseUser(session.user);
      } else {
        setSupabaseUser(null);
        setTofilUser(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Fetch user profile when supabaseUser changes
  useEffect(() => {
    if (!supabaseUser) {
      setTofilUser(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("email", supabaseUser.email ?? '')
          .single();
        
        // Transform the profile to include manager_location_id
        let tofilProfile: TofilUser | null = null;
        if (profile) {
          tofilProfile = { ...profile };
          
          // If user is a manager, fetch their location
          if (profile.type === 'MANAGER') {
            const { data: managerLocation } = await supabase
              .from("manager_locations")
              .select("location_id")
              .eq("user_id", profile.id)
              .single();
            
            if (managerLocation) {
              tofilProfile.manager_location_id = managerLocation.location_id;
            }
          }
        }
        if (!cancelled) {
          setTofilUser(tofilProfile);
        }
      } catch (error: unknown) {
        const err = error as Error;
        console.error("DEBUG::error in fetchUserProfile", { error: err.message });
        if (!cancelled) {
          setTofilUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser, supabase]);

  return (
    <UserContext.Provider value={{ supabaseUser, tofilUser, setUser, isLoading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 