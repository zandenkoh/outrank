'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/utils';

interface HeaderProps {
  user: any;
  date?: Date;
  isScrolled?: boolean;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({ user, date = new Date(), isScrolled = false, activeTab = 'overall' }) => (
  <motion.div
    className={`sticky top-0 bg-slate-900/95 backdrop-blur-xl z-50 px-5 transition-all duration-300 ease-out border-b border-slate-800 ${
      isScrolled ? 'py-3' : 'pt-6 pb-4'
    }`}
    initial={false}
    animate={{ opacity: isScrolled ? 0.98 : 1 }}
  >
    <AnimatePresence mode="wait">
      {!isScrolled && (
        <motion.p
          className="text-gray-400 text-sm uppercase tracking-wide mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {formatDate(date)}
        </motion.p>
      )}
    </AnimatePresence>
    <div className="flex justify-between items-center">
      <motion.h1
        className="font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent"
        animate={{ fontSize: isScrolled ? '20px' : '32px' }}
        transition={{ duration: 0.3 }}
      >
        Rankings
      </motion.h1>
      <motion.div
        className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-lg"
        animate={{ scale: isScrolled ? 0.85 : 1 }}
        transition={{ duration: 0.3 }}
        whileTap={{ scale: 0.9 }}
      >
        {user?.nickname?.[0]?.toUpperCase() || 'U'}
      </motion.div>
    </div>
    {/* Tab Indicators */}
    <div className="flex justify-center mt-3 space-x-1">
      {['overall', 'subjects'].map((tab) => (
        <motion.div
          key={tab}
          className={`h-1 rounded-full transition-all duration-300 ${
            activeTab === tab ? 'w-6 bg-lime-400' : 'w-3 bg-slate-700'
          }`}
          initial={false}
          animate={{ width: activeTab === tab ? 24 : 12 }}
        />
      ))}
    </div>
  </motion.div>
);