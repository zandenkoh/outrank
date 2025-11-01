// hooks/useAuthGuard.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useAuthGuard = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has completed onboarding (localStorage check)
        const localUserStr = localStorage.getItem('outrankUser');
        
        if (!localUserStr) {
          // No local data, redirect to onboarding
          router.replace('/onboarding');
          return;
        }

        // Check if user has valid session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No session, redirect to onboarding
          router.replace('/onboarding');
          return;
        }

        // User is authenticated
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/onboarding');
      }
    };

    checkAuth();
  }, [router]);

  return { isChecking };
};