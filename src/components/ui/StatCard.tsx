'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  progress?: number;
  onTap: () => void;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, progress, onTap, color = '#84CC16' }) => (
  <motion.div
    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 relative overflow-hidden shadow-lg cursor-pointer"
    onClick={onTap}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    whileHover={{ scale: 1.02, borderColor: 'rgba(132, 204, 22, 0.3)' }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: color, opacity: 0.5 }} />
    <div className="flex justify-between items-start mb-3">
      <h4 className="text-gray-400 text-xs uppercase tracking-wide font-medium flex items-center">
        {title}
        <ChevronRight size={12} className="ml-1 opacity-50" />
      </h4>
      {icon && <div className="flex-shrink-0" style={{ color }}>{icon}</div>}
    </div>
    <p className="text-xs text-gray-500 mb-1">Performance</p>
    <motion.p
      className="text-2xl font-bold text-white mb-2"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      {value}
    </motion.p>
    {subtitle && <p className="text-xs text-gray-400 mb-3">{subtitle}</p>}
    {progress !== undefined && (
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ backgroundColor: color }}
        />
      </div>
    )}
  </motion.div>
);