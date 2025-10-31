"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingUp, TrendingDown, ChevronLeft, Trophy, ChevronRight, Users, BarChart3, Calendar, Sparkles, Crown, ArrowUpRight, Lock, Shield, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces
interface User {
  id: string;
  nickname?: string;
  school_code: string;
  school_name: string;
  level: string;
  opted_in_cohort: boolean;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

interface Grade {
  id?: string;
  user_id: string;
  subject: string;
  assessment_name: string;
  score: number;
  max_score: number;
  assessment_date: string;
  percentage?: number;
  created_at: string;
  updated_at: string;
}

interface SubjectData {
  subject: string;
  average: number;
  trend: number;
  percentile: number;
  grades: Grade[];
}

interface Percentile {
  school: {
    percentile: number;
    rank: number;
    total: number;
  };
  national: {
    percentile: number;
    rank: number;
    total: number;
  };
}

interface SchoolStats {
  national_rank: number;
  total_students: number;
  best_subject_average: number;
  improvement_amount: number;
}

interface TopSchool {
  school_code: string;
  school_name: string;
  average_overall: number;
  national_rank: number;
}

interface FormDataState {
  subject: string;
  assessment_name: string;
  score: string;
  max_score: string;
  term: number;
  year: number;
  useSpecificDate: boolean;
  assessment_date: string;
}

interface SubmitGrade {
  subject: string;
  assessment_name: string;
  score: number;
  max_score: number;
  assessment_date: string;
}

// Utility functions
const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const SUBJECT_EMOJIS: Record<string, string> = {
  mathematics: '📐',
  physics: '⚡',
  chemistry: '🧪',
  biology: '🧬',
  english: '📚',
  literature: '📖',
  history: '🏛️',
  geography: '🌍',
  economics: '📊',
  computing: '💻'
};

// Term end dates (approximate for Singapore schools)
const TERM_END_DATES: Record<number, string> = {
  1: '03-31', // March 31
  2: '06-30', // June 30
  3: '09-30', // September 30
  4: '12-31'  // December 31
};

// Gauge Chart Component
interface GaugeProps {
  percentage: number;
  size?: number;
}

const GaugeChart: React.FC<GaugeProps> = ({ percentage, size = 120 }) => {
  const safePercentage = Math.min(100, Math.max(0, percentage || 0));
  const radius = size / 2;
  const strokeWidth = 10;
  const center = radius;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = Math.PI * normalizedRadius;
  const offset = circumference - (safePercentage / 100) * circumference;

  return (
    <svg width={size} height={size / 1.5} viewBox={`0 0 ${size} ${size / 1.5}`} className="mx-auto">
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#84CC16', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d={`M ${strokeWidth / 2} ${center} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
        stroke="#374151"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <motion.path
        d={`M ${strokeWidth / 2} ${center} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
        stroke="url(#gaugeGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <motion.text
        x={center}
        y={center + 5}
        textAnchor="middle"
        fill="#F9FAFB"
        fontSize="18"
        fontWeight="700"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        {Math.round(safePercentage)}%
      </motion.text>
    </svg>
  );
};

// Header Component
interface HeaderProps {
  user: User | null;
  date?: Date;
  isScrolled?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, date = new Date(), isScrolled = false }) => (
  <motion.div 
    className={`sticky top-0 bg-slate-900/95 backdrop-blur-xl z-50 px-5 transition-all duration-300 ease-out border-b border-slate-800 ${isScrolled ? 'py-3' : 'pt-6 pb-4'}`}
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
        Dashboard
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
  </motion.div>
);

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  progress?: number;
  onTap: () => void;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, progress, onTap, color = '#84CC16' }) => (
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
      transition={{ duration: 0.3, type: "spring" }}
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
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ backgroundColor: color }}
        />
      </div>
    )}
  </motion.div>
);

// Overall Average Card
interface OverallProps {
  average: number;
  trend: number;
}

const OverallAverageCard: React.FC<OverallProps> = ({ average, trend }) => {
  const safeAverage = Math.min(100, Math.max(0, average || 0));
  const safeTrend = trend || 0;

  return (
    <motion.div
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 relative overflow-hidden shadow-xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-lime-400/5 to-emerald-400/5" />
      <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-4 font-medium relative z-10">Overall Performance</h3>
      <div className="flex items-center justify-center gap-6 relative z-10">
        <div className="flex-shrink-0">
          <GaugeChart percentage={safeAverage} size={140} />
        </div>
        <div className="text-center min-w-[100px]">
          <motion.div 
            className="text-5xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent"
            key={safeAverage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            {safeAverage.toFixed(0)}<span className="text-2xl">%</span>
          </motion.div>
          <motion.div 
            className={`flex items-center justify-center gap-1 text-sm font-medium mt-2 ${safeTrend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {safeTrend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(safeTrend).toFixed(1)}% this month</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Subject Card
interface SubjectProps {
  subject: string;
  average: number;
  trend: number;
  percentile: number;
  grades: Grade[];
  onTap: () => void;
}

const SubjectCard: React.FC<SubjectProps> = ({ subject, average, trend, percentile, grades, onTap }) => {
  const subjectInfo = { 
    name: subject.charAt(0).toUpperCase() + subject.slice(1), 
    emoji: SUBJECT_EMOJIS[subject] || '📚' 
  };
  const safeAvg = Math.min(100, Math.max(0, average || 0));
  const safeTrend = trend || 0;
  const safePerc = Math.min(100, Math.max(0, percentile || 0));

  return (
    <motion.div
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden shadow-lg cursor-pointer"
      onClick={onTap}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(132, 204, 22, 0.3)' }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-lime-400 to-emerald-400 opacity-30" />
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">{subjectInfo.emoji}</span>
          <div>
            <h4 className="font-semibold text-white text-sm">{subjectInfo.name}</h4>
            <p className="text-xs text-gray-400">{grades?.length || 0} assessments</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Percentile</p>
          <p className="font-bold text-lime-400 text-sm">{safePerc.toFixed(0)}<span className="text-xs">%</span></p>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl font-bold text-white">{safeAvg.toFixed(1)}%</span>
        <div className={`flex items-center gap-1 text-sm font-medium ${safeTrend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {safeTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(safeTrend).toFixed(1)}%</span>
        </div>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${safeAvg}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

// Empty State
interface EmptyProps {
  onAddGrade: () => void;
}

const EmptyState: React.FC<EmptyProps> = ({ onAddGrade }) => (
  <motion.div 
    className="flex flex-col items-center justify-center py-12 px-6 text-center bg-slate-900 border border-slate-800 rounded-2xl shadow-xl"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <motion.div 
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
    >
      <div className="text-6xl mb-4">🎯</div>
    </motion.div>
    <h3 className="text-2xl font-bold text-white mb-3">Welcome to Outrank! 🚀</h3>
    <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
      Track your grades, unlock insights, and see how you rank among peers. Start by adding your first assessment.
    </p>
    <motion.button
      onClick={onAddGrade}
      className="bg-lime-400 text-black font-bold rounded-xl px-8 py-4 flex items-center gap-2 shadow-xl"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(132, 204, 22, 0.3)' }}
    >
      <Plus className="w-5 h-5" />
      Add First Grade
    </motion.button>
    <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-md">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
        <Lock size={16} className="text-lime-400 mb-1" />
        <p className="text-xs font-semibold text-white">100% Anonymous</p>
        <p className="text-xs text-gray-500">Your data is private</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
        <Users size={16} className="text-purple-400 mb-1" />
        <p className="text-xs font-semibold text-white">Real Rankings</p>
        <p className="text-xs text-gray-500">Compare with cohort</p>
      </div>
    </div>
  </motion.div>
);

// Add Grade Modal with Term/Date Toggle
interface AddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitGrade) => Promise<void>;
  subjects: string[];
}

const AddGradeModal: React.FC<AddProps> = ({ isOpen, onClose, onSubmit, subjects }) => {
  const [formData, setFormData] = useState<FormDataState>({
    subject: '',
    assessment_name: '',
    score: '',
    max_score: '100',
    term: 1,
    year: new Date().getFullYear(),
    useSpecificDate: false,
    assessment_date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentYear = new Date().getFullYear();

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.assessment_name) newErrors.assessment_name = 'Assessment name is required';
    if (!formData.score) newErrors.score = 'Score is required';
    if (parseFloat(formData.score) > parseFloat(formData.max_score)) {
      newErrors.score = "Score can't exceed maximum";
    }
    if (!formData.useSpecificDate && (!formData.term || !formData.year)) {
      newErrors.term = 'Term and year are required';
    }
    return newErrors;
  };

  const handleSubmit = async (): Promise<void> => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let finalDate: string;
    if (formData.useSpecificDate) {
      finalDate = formData.assessment_date;
    } else {
      const monthDay = TERM_END_DATES[formData.term];
      finalDate = `${formData.year}-${monthDay}`;
    }

    const submitData: SubmitGrade = { 
      ...formData, 
      assessment_date: finalDate,
      score: parseFloat(formData.score),
      max_score: parseFloat(formData.max_score)
    };
    await onSubmit(submitData);
    setFormData({
      subject: '',
      assessment_name: '',
      score: '',
      max_score: '100',
      term: 1,
      year: currentYear,
      useSpecificDate: false,
      assessment_date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-slate-900 rounded-t-3xl w-full max-w-md p-6 pb-8 shadow-2xl border-t border-slate-700 relative"
          onClick={(e) => e.stopPropagation()}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-4">Add Grade</h2>
            <button 
              onClick={onClose} 
              className="absolute top-6 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className={`w-full bg-slate-800 text-white border ${errors.subject ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all`}
              >
                <option value="">Select a subject</option>
                {subjects.map(s => (
                  <option key={s} value={s}>
                    {SUBJECT_EMOJIS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">Assessment Name</label>
              <input
                type="text"
                value={formData.assessment_name}
                onChange={(e) => setFormData({...formData, assessment_name: e.target.value})}
                placeholder="e.g., Mid-Year Exam"
                className={`w-full bg-slate-800 text-white border ${errors.assessment_name ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all`}
              />
              {errors.assessment_name && <p className="text-red-400 text-xs mt-1">{errors.assessment_name}</p>}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-400 text-sm mb-2 font-medium">Your Score</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.score}
                  onChange={(e) => setFormData({...formData, score: e.target.value})}
                  placeholder="85"
                  className={`w-full bg-slate-800 text-white border ${errors.score ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3 text-center text-xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all`}
                />
              </div>
              <div className="flex items-center justify-center text-gray-400 text-2xl pt-6">/</div>
              <div className="flex-1">
                <label className="block text-gray-400 text-sm mb-2 font-medium">Max Score</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.max_score}
                  onChange={(e) => setFormData({...formData, max_score: e.target.value})}
                  className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-center text-xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all"
                />
              </div>
            </div>
            {errors.score && <p className="text-red-400 text-xs -mt-3">{errors.score}</p>}

            {/* Term/Date Input */}
            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">Date/Term</label>
              {!formData.useSpecificDate ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={formData.term}
                      onChange={(e) => setFormData({...formData, term: parseInt(e.target.value)})}
                      className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                    >
                      <option value={1}>Term 1</option>
                      <option value={2}>Term 2</option>
                      <option value={3}>Term 3</option>
                      <option value={4}>Term 4</option>
                    </select>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      className="w-28 bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                    >
                      {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  {errors.term && <p className="text-red-400 text-xs mt-1">{errors.term}</p>}
                  <motion.button
                    onClick={() => setFormData(prev => ({ ...prev, useSpecificDate: true }))}
                    className="w-full text-xs text-lime-400 hover:text-lime-300 flex items-center justify-center gap-1"
                    whileTap={{ scale: 0.98 }}
                  >
                    Use specific date instead
                  </motion.button>
                </div>
              ) : (
                <div>
                  <input
                    type="date"
                    value={formData.assessment_date}
                    onChange={(e) => setFormData({...formData, assessment_date: e.target.value})}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                  />
                  <motion.button
                    onClick={() => setFormData(prev => ({ ...prev, useSpecificDate: false }))}
                    className="w-full text-xs text-lime-400 hover:text-lime-300 flex items-center justify-center gap-1 mt-2"
                    whileTap={{ scale: 0.98 }}
                  >
                    Use term instead
                  </motion.button>
                </div>
              )}
            </div>

            <motion.button
              onClick={handleSubmit}
              className="w-full bg-lime-400 text-black font-bold rounded-xl py-4 text-base shadow-xl"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
            >
              Add Grade
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Subject Detail Modal
interface DetailProps {
  isOpen: boolean;
  subject: SubjectData | null;
  onClose: () => void;
}

const SubjectDetailModal: React.FC<DetailProps> = ({ isOpen, subject, onClose }) => {
  if (!isOpen || !subject) return null;

  const sortedGrades = [...(subject.grades || [])].sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime());
  const chartData = sortedGrades.map((g) => ({ 
    name: new Date(g.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
    value: g.percentage || 0 
  }));

  const safeAvg = Math.min(100, Math.max(0, subject.average || 0));
  const safeTrend = subject.trend || 0;

  // In SubjectDetailModal
  const recentGrades = sortedGrades.slice(-5); // remove .reverse()
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-slate-900 z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="flex h-full flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          <div className="bg-slate-800/95 backdrop-blur-xl flex items-center px-4 py-3 border-b border-slate-700">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Back">
              <ChevronLeft size={24} className="text-white" />
            </button>
            <h2 className="ml-3 text-xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent flex-1">
              {subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1)}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{safeAvg.toFixed(1)}%</div>
              <p className="text-gray-400 text-sm mb-4">{sortedGrades.length} assessments</p>
              <GaugeChart percentage={safeAvg} size={120} />
            </div>

            {chartData.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-700">
                <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Progress Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E293B', 
                        border: '1px solid #475569', 
                        borderRadius: '12px',
                        color: '#F9FAFB' 
                      }} 
                    />
                    <Line type="monotone" dataKey="value" stroke="#84CC16" strokeWidth={3} dot={{ fill: '#84CC16', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Subject Grades Bar Chart */}
            {recentGrades.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-white">{safeAvg.toFixed(1)}</span>
                  <span className={`text-sm ${safeTrend >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                    {safeTrend >= 0 ? '↑' : '↓'} {Math.abs(safeTrend).toFixed(1)}
                  </span>
                </div>
                <div className="h-12 flex items-end gap-1">
                  {Array(5).fill(null).map((_, i) => {
                    if (i < recentGrades.length) {
                      const g = recentGrades[i];
                      return (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-lime-400 to-emerald-400 rounded-t"
                          initial={{ height: 0 }}
                          animate={{ height: `${g.percentage || 0}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                      );
                    } else {
                      return <div key={i} className="flex-1 rounded-t" />;
                    }
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-gray-400 text-xs uppercase tracking-wide font-medium">Assessments</h3>
              {sortedGrades.map((grade, index) => (
                <motion.div 
                  key={grade.id || index} 
                  className="bg-slate-800 rounded-xl p-4 flex justify-between items-center shadow-lg border border-slate-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div>
                    <p className="font-semibold text-white text-sm">{grade.assessment_name}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(grade.assessment_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">{grade.score}/{grade.max_score}</p>
                    <p className="text-xs text-lime-400 font-medium">({(grade.percentage || 0).toFixed(1)}%)</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Dashboard
const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [overallAverage, setOverallAverage] = useState<number>(0);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [percentile, setPercentile] = useState<Percentile>({ 
    school: { percentile: 0, rank: 0, total: 0 }, 
    national: { percentile: 0, rank: 0, total: 0 } 
  });
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);
  const [topSchools, setTopSchools] = useState<TopSchool[]>([]);
  const [bestSubject, setBestSubject] = useState<string | null>(null);
  const [bestAvg, setBestAvg] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [trend, setTrend] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const router = useRouter();

  const refetchData = useCallback(async (currentUser: User): Promise<void> => {
    try {
      // Fetch grades
      const { data: fetchedGrades, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('assessment_date', { ascending: false });

      if (error) throw error;

      const currentGrades: Grade[] = fetchedGrades || [];
      setGrades(currentGrades);

      if (currentGrades.length > 0) {
        // Calculate overall average
        const avg = currentGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / currentGrades.length;
        setOverallAverage(avg);

        // Fetch school percentile
        try {
          const { data: schoolPercData } = await supabase.rpc('calculate_percentile', { 
            p_user_id: currentUser.id, 
            p_school_code: currentUser.school_code 
          });
          const schoolPerc = schoolPercData?.[0] || {};
          setPercentile(prev => ({ 
            ...prev, 
            school: { 
              percentile: schoolPerc.percentile || 0, 
              rank: schoolPerc.rank || 1, 
              total: schoolPerc.total || 1 
            } 
          }));
        } catch (err) {
          console.error('School percentile error:', err);
        }

        // Fetch national percentile
        try {
          const { data: nationalPercData } = await supabase.rpc('calculate_percentile', { 
            p_user_id: currentUser.id 
          });
          const nationalPerc = nationalPercData?.[0] || {};
          setPercentile(prev => ({ 
            ...prev, 
            national: { 
              percentile: nationalPerc.percentile || 0, 
              rank: nationalPerc.rank || 1, 
              total: nationalPerc.total || 1 
            } 
          }));
        } catch (err) {
          console.error('National percentile error:', err);
        }

        // Fetch school stats
        try {
          const { data: schoolData } = await supabase
            .from('school_stats')
            .select('*')
            .eq('school_code', currentUser.school_code)
            .eq('level', currentUser.level)
            .maybeSingle();
          setSchoolStats(schoolData || { 
            national_rank: 0, 
            total_students: 0, 
            best_subject_average: 0, 
            improvement_amount: 0 
          });
        } catch (err) {
          console.error('School stats error:', err);
          setSchoolStats({ 
            national_rank: 0, 
            total_students: 0, 
            best_subject_average: 0, 
            improvement_amount: 0 
          });
        }

        // Fetch top schools
        try {
          const { data: topSchoolsData } = await supabase
            .from('school_stats')
            .select('school_code, school_name, average_overall, national_rank')
            .eq('level', currentUser.level)
            .order('average_overall', { ascending: false })
            .limit(5);
          setTopSchools(topSchoolsData || []);
        } catch (err) {
          console.error('Top schools error:', err);
        }

        // Calculate subject data
        const subjects = [...new Set(currentGrades.map(g => g.subject))];
        const subjectStatsPromises = subjects.map(async (sub: string) => {
          const subGrades = currentGrades.filter(g => g.subject === sub);
          const sortedSubGrades = [...subGrades].sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime());
          const subAvg = sortedSubGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / sortedSubGrades.length;
          const subTrend = sortedSubGrades.length >= 2 
            ? (sortedSubGrades[sortedSubGrades.length - 1].percentage || 0) - (sortedSubGrades[0].percentage || 0) 
            : 0;

          let subPerc = 0;
          try {
            const { data: subPercData } = await supabase.rpc('calculate_percentile', { 
              p_user_id: currentUser.id, 
              p_school_code: currentUser.school_code, 
              p_subject: sub 
            });
            subPerc = subPercData?.[0]?.percentile || 0;
          } catch (err) {
            console.error('Subject percentile error:', err);
          }

          return { 
            subject: sub, 
            average: subAvg, 
            trend: subTrend, 
            percentile: subPerc, 
            grades: sortedSubGrades 
          };
        });
        
        const subjectStats = await Promise.all(subjectStatsPromises);
        setSubjectData(subjectStats);

        // Compute best subject
        if (subjectStats.length > 0) {
          const best = subjectStats.reduce((prev, curr) => 
            (prev.average > curr.average ? prev : curr)
          );
          setBestSubject(best.subject);
          setBestAvg(best.average);
        }

        // Calculate overall trend
        const recentCount = Math.min(3, currentGrades.length);
        const recentAvg = currentGrades.slice(0, recentCount)
          .reduce((sum, g) => sum + (g.percentage || 0), 0) / recentCount;
        const olderSlice = currentGrades.slice(recentCount, recentCount * 2);
        const olderAvg = olderSlice.length > 0 
          ? olderSlice.reduce((sum, g) => sum + (g.percentage || 0), 0) / olderSlice.length 
          : recentAvg;
        setTrend(recentAvg - olderAvg);
      } else {
        setOverallAverage(0);
        setSubjectData([]);
        setTrend(0);
        setBestSubject(null);
        setBestAvg(0);
      }
    } catch (err) {
      console.error('Error refetching data:', err);
    }
  }, []);

useEffect(() => {
  const loadData = async (): Promise<void> => {
    try {
      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) throw anonError;
        session = anonData.session;
        if (!session) {
          throw new Error('Anonymous sign-in failed');
        }
      }

      const localUserStr = localStorage.getItem('outrankUser');
const localUserPartial: Partial<User> = localUserStr ? JSON.parse(localUserStr) : {
  school_code: 'RI',
  school_name: 'Raffles Institution',
  level: 'sec_4'
};

const fallbackNickname = localUserPartial.nickname || `Anon${Math.random().toString(36).slice(2, 7).toUpperCase()}`; // e.g., "ANONX7K2P"

const defaultUser: Omit<User, 'id' | 'opted_in_cohort' | 'created_at' | 'updated_at' | 'last_active_at'> = {
  nickname: fallbackNickname,
  school_code: localUserPartial.school_code || 'RI',
  school_name: localUserPartial.school_name || 'Raffles Institution',
  level: localUserPartial.level || 'sec_4'
};

// Upsert user in DB
const { data: existingUser, error: fetchError }: { data: User | null; error: PostgrestError | null } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single();

// Handle potential nulls/errors explicitly to avoid runtime issues
if (fetchError && fetchError.code !== 'PGRST116') {
  throw fetchError; // Or handle gracefully
}

      let dbUser: User;
      if (fetchError && fetchError.code === 'PGRST116') {
        // Insert new user
        const newUser: User = {
          id: session.user.id,
          ...defaultUser,
          opted_in_cohort: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        };
        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
        if (insertError) throw insertError;
        dbUser = insertedUser!;
      } else if (existingUser) {
        dbUser = existingUser;
        // Update if local data changed
        const updates: Partial<User> = {};
        if (localUserPartial.nickname && localUserPartial.nickname !== dbUser.nickname) {
          updates.nickname = localUserPartial.nickname;
        }
        if (localUserPartial.school_code && localUserPartial.school_code !== dbUser.school_code) {
          updates.school_code = localUserPartial.school_code;
        }
        if (localUserPartial.school_name && localUserPartial.school_name !== dbUser.school_name) {
          updates.school_name = localUserPartial.school_name;
        }
        if (localUserPartial.level && localUserPartial.level !== dbUser.level) {
          updates.level = localUserPartial.level;
        }
        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          updates.last_active_at = new Date().toISOString();
          const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', session.user.id);
          if (updateError) console.error('Update error:', updateError);
        }
      } else {
        throw new Error('User fetch failed');
      }

      // Update localStorage with db id if needed
      const updatedLocalUser = { ...localUserPartial, id: session.user.id };
      localStorage.setItem('outrankUser', JSON.stringify(updatedLocalUser));

      setUser(dbUser);
      await refetchData(dbUser);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [refetchData]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddGrade = async (formData: SubmitGrade): Promise<void> => {
    if (!user) return;

    const newGrade: Omit<Grade, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      subject: formData.subject,
      assessment_name: formData.assessment_name,
      score: formData.score,
      max_score: formData.max_score,
      assessment_date: formData.assessment_date
    };

    try {
      const { data, error } = await supabase
        .from('grades')
        .insert([newGrade])
        .select()
        .single();

      if (error) {
        console.error('Error adding grade:', error);
        return;
      }
    } catch (err) {
      console.error('Error adding grade:', err);
      return;
    }

    setIsModalOpen(false);
    if (user) {
      await refetchData(user);
    }
  };

  const handleSubjectTap = (sub: SubjectData): void => {
    setSelectedSubject(sub);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header user={null} isScrolled={false} />
        <div className="px-5 py-6 space-y-6">
          <motion.div 
            className="bg-slate-800 rounded-2xl h-64 animate-pulse"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="bg-slate-800 rounded-xl h-40 animate-pulse"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div 
              className="bg-slate-800 rounded-xl h-40 animate-pulse"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
          </div>
        </div>
      </div>
    );
  }

  const safeSchoolPerc = percentile.school.percentile || 0;
  const safeNatPerc = percentile.national.percentile || 0;

  const safeSchoolTotal = percentile.school.total || 0;
  const safeNatTotal = percentile.national.total || 0;

  const clampedSchoolRank = Math.max(1, Math.min(safeSchoolTotal, Math.max(1, percentile.school.rank || 1)));
  const clampedNatRank = Math.max(1, Math.min(safeNatTotal, Math.max(1, percentile.national.rank || 1)));
  
  const safeSchoolRank = percentile.school.rank || 1;
  const safeNatRank = percentile.national.rank || 1;
const safeSchoolBetter = Math.max(0, safeSchoolTotal - clampedSchoolRank);
const safeNatBetter = Math.max(0, safeNatTotal - clampedNatRank);

const getOrdinal = (n: number): string => {
  if (n < 1) return '1st'; // Fallback for invalid ranks
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  const suffix = s[(v - 20) % 10] || s[v] || s[0];
  return n + suffix;
};

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <Header user={user} isScrolled={isScrolled} />

      <div className="px-5 py-6 space-y-6">
        {grades.length === 0 ? (
          <EmptyState onAddGrade={() => setIsModalOpen(true)} />
        ) : (
          <>
            <OverallAverageCard average={overallAverage} trend={trend} />

            <div className="grid grid-cols-2 gap-4">
<StatCard
  title="School Ranking"
  value={getOrdinal(clampedSchoolRank)}
  subtitle={`Better than ${safeSchoolBetter} peers`}
  progress={Math.min(100, Math.max(0, percentile.school.percentile || 0))}
  icon={<Crown size={18} />}
  color="#A855F7"
  onTap={() => {}}
/>

<StatCard
  title="National Ranking"
  value={getOrdinal(clampedNatRank)}
  subtitle={`Better than ${safeNatBetter} students`}
  progress={Math.min(100, Math.max(0, percentile.national.percentile || 0))}
  icon={<Crown size={18} />}
  color="#06B6D4"
  onTap={() => {}}
/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {bestSubject && (
                <StatCard
                  title="Top Subject"
                  value={bestSubject.charAt(0).toUpperCase() + bestSubject.slice(1)}
                  subtitle={`${bestAvg.toFixed(1)}% avg`}
                  icon={<span className="text-xl">{SUBJECT_EMOJIS[bestSubject]}</span>}
                  onTap={() => handleSubjectTap(subjectData.find(s => s.subject === bestSubject)!)}
                  color="#84CC16"
                />
              )}
              <StatCard
                title="School Performance"
                value={`#${schoolStats?.national_rank || 1}`}
                subtitle={`${schoolStats?.total_students || 0} students`}
                icon={<Users size={18} />}
                color="#10B981"
                onTap={() => {}}
              />
            </div>

            {/* School Comparisons */}
            {topSchools.length > 0 && (
              <>
                <h3 className="text-gray-400 text-xs uppercase tracking-wide mt-8 mb-4 font-medium">
                  School Comparisons
                </h3>
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-2">
                  {topSchools.map((school, i) => {
                    const highlight = school.school_code === user?.school_code;
                    return (
                      <div key={i} className={`flex items-center justify-between text-sm ${highlight ? 'text-cyan-400' : 'text-gray-400'}`}>
                        <span>#{school.national_rank} {school.school_name}</span>
                        <span className="font-bold">{school.average_overall?.toFixed(1) || 0}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {subjectData.length > 0 && (
              <>
                <h3 className="text-gray-400 text-xs uppercase tracking-wide mt-8 mb-4 font-medium">
                  Subject Insights
                </h3>
                <div className="space-y-4">
                  {subjectData.map((sub, index) => (
                    <motion.div
                      key={sub.subject}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <SubjectCard
                        {...sub}
                        onTap={() => handleSubjectTap(sub)}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AddGradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddGrade}
        subjects={Object.keys(SUBJECT_EMOJIS)}
      />

      <SubjectDetailModal
        isOpen={!!selectedSubject}
        subject={selectedSubject}
        onClose={() => setSelectedSubject(null)}
      />

      {/* Bottom Navigation */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 grid grid-cols-5 place-items-center py-3 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.button 
          className="flex flex-col items-center text-xs font-medium text-lime-400" 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/dashboard')}
        >
          <BarChart3 size={24} className="mb-1" />
          <span>Dashboard</span>
        </motion.button>
        <motion.button 
          className="flex flex-col items-center text-xs font-medium text-gray-400" 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/rankings')}
        >
          <Trophy size={24} className="mb-1" />
          <span>Rankings</span>
        </motion.button>
        <motion.button 
          className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center -mt-8 shadow-2xl border-4 border-slate-900 col-span-1" 
          onClick={() => setIsModalOpen(true)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          <Plus size={28} className="text-black" />
        </motion.button>
        <motion.button 
          className="flex flex-col items-center text-xs font-medium text-gray-400" 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/history')}
        >
          <Calendar size={24} className="mb-1" />
          <span>History</span>
        </motion.button>
        <motion.button 
          className="flex flex-col items-center text-xs font-medium text-gray-400" 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/profile')}
        >
          <Sparkles size={24} className="mb-1" />
          <span>Profile</span>
        </motion.button>
      </motion.div>

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
        html {
          scroll-behavior: smooth;
        }
        input[type="number"] {
          font-size: 16px;
        }
        .recharts-default-tooltip {
          background: #1E293B !important;
          border: 1px solid #475569 !important;
          border-radius: 12px !important;
        }
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #1E293B;
        }
        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;