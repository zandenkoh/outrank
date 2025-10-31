"use client"

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Mail, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const VerifyEmail: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const verifyEmail = async (): Promise<void> => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!tokenHash || type !== 'recovery') {
        setStatus('error');
        setError('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          type: 'signup',
          token_hash: tokenHash,
        });

        if (verifyError) {
          throw verifyError;
        }

        if (data.user && data.user.email_confirmed_at) {
          setStatus('success');
          // Auto-redirect after 3 seconds
          setTimeout(() => {
            setRedirecting(true);
            router.push('/dashboard');
          }, 3000);
        } else {
          throw new Error('Verification failed. Please try again.');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setStatus('error');
        setError(err.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleManualRedirect = (): void => {
    setRedirecting(true);
    router.push('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-lime-400/20 border-t-lime-400 rounded-full mx-auto animate-spin"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="space-y-2">
            <p className="text-white text-lg font-medium">Verifying your email...</p>
            <p className="text-gray-400 text-sm">Please wait while we confirm your account.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border border-red-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/30">
            <Mail className="text-red-400 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <motion.button
            onClick={() => router.push('/profile')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl py-3 px-6 transition-colors flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            <ArrowRight size={18} />
            Back to Profile
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-lime-400/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {status === 'success' && (
          <motion.div
            className="text-center space-y-8 relative z-10 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Success Icon with bounce */}
            <motion.div
              className="w-32 h-32 bg-gradient-to-r from-lime-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white/20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: [0, 1.2, 1],
                rotate: [ -180, 0 ],
              }}
              transition={{ duration: 0.8, ease: 'backOut' }}
            >
              <CheckCircle className="text-white w-20 h-20" />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-lime-400 via-emerald-400 to-lime-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Email Verified!
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl text-white font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Welcome to Outrank
            </motion.p>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <p className="text-gray-300 text-lg leading-relaxed">
                Your account is now fully activated. Your grades will sync across devices, and you&apos;ll be able to contribute to school and national rankings.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <motion.button
                  onClick={handleManualRedirect}
                  disabled={redirecting}
                  className="flex-1 bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-lime-600 hover:to-emerald-700 text-white font-bold rounded-xl py-4 px-6 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Sparkles size={20} />
                  {redirecting ? 'Redirecting...' : 'Go to Dashboard'}
                  {redirecting && <ArrowRight size={18} className="animate-pulse ml-1" />}
                </motion.button>
                {redirecting && (
                  <motion.p
                    className="text-gray-400 text-sm self-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                  >
                    Redirecting in 3 seconds...
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-10 -right-10 opacity-20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <GraduationCap className="w-32 h-32 text-lime-400" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        * { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        body, html {
          background-color: #0F172A;
          color: #F9FAFB;
          overscroll-behavior: none;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;