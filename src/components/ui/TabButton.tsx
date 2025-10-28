'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, icon: Icon }) => (
  <motion.button
    onClick={onClick}
    className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 font-medium text-sm relative overflow-hidden group ${
      active
        ? 'bg-lime-400 text-black shadow-lg'
        : 'bg-slate-800 text-gray-400 border border-slate-700 hover:border-slate-600'
    }`}
    whileTap={{ scale: 0.98 }}
    animate={{ scale: active ? 1.02 : 1 }}
  >
    <div className="flex items-center justify-center gap-2 z-10 relative">
      <Icon size={18} />
      {children}
    </div>
    {!active && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-lime-400 to-emerald-400 opacity-0 group-hover:opacity-10"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.1 }}
      />
    )}
  </motion.button>
);