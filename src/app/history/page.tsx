"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Calendar, Sparkles, BarChart3, Trophy, Plus, Search, Filter, Edit3, Trash2, X, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SUBJECT_EMOJIS = {
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
} as const;

// Term end dates (approximate for Singapore schools)
const TERM_END_DATES = {
  1: '03-31', // March 31
  2: '06-30', // June 30
  3: '09-30', // September 30
  4: '12-31'  // December 31
} as const;

interface User {
  id: string;
  nickname: string;
  school_code: string;
  school_name: string;
  level: string;
}

interface Grade {
  id: number;
  user_id: string;
  subject: string;
  assessment_name: string;
  score: number;
  max_score: number;
  assessment_date: string;
  percentage?: number;
}

interface FormData {
  subject: string;
  assessment_name: string;
  score: string;
  max_score: string;
  term: number;
  year: number;
  useSpecificDate: boolean;
  assessment_date: string;
}

interface YearStats {
  avg: number;
  total: number;
  bestSubject: string | null;
  bestAvg: number;
  improvedSubject: string | null;
  improvement: number;
}

interface SubjectData {
  subject: string;
  grades: Grade[];
  average: number;
  trend: number;
}

interface SelectedTermData {
  year: number;
  term: number;
  termGrades: Grade[];
}

interface SelectedYearData {
  year: number;
  yearGrades: Grade[];
}

interface SelectedGradeData {
  grade: Grade;
  subjectGrades: Grade[];
}

interface GaugeChartProps {
  percentage: number;
  size?: number;
}

interface HeaderProps {
  user: User | null;
  date?: Date;
  isScrolled?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'individual' | 'report';
  onViewModeChange: (mode: 'individual' | 'report') => void;
  isViewDropdownOpen: boolean;
  setIsViewDropdownOpen: (open: boolean) => void;
  showSearch: boolean;
}

interface GradeItemProps {
  grade: Grade;
  onClick: (grade: Grade) => void;
  onEdit: (grade: Grade) => void;
  onDelete: (id: number) => void;
  isEditing: boolean;
}

interface EmptyHistoryStateProps {
  onAddGrade: () => void;
}

interface AddGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  subjects: string[];
}
interface AssessmentDetailModalProps {
  isOpen: boolean;
  grade: Grade | null;
  subjectGrades: Grade[];
  onClose: () => void;
}

interface SubjectDetailModalProps {
  isOpen: boolean;
  subjectData: SubjectData | null;
  onClose: () => void;
  onGradeClick: (grade: Grade, grades: Grade[]) => void;
}

interface TermMiniCardProps {
  term: number;
  termGrades: Grade[];
  onClick: () => void;
}

interface TermDetailModalProps {
  isOpen: boolean;
  year?: number;
  term?: number;
  termGrades?: Grade[];
  onClose: () => void;
  onSubjectClick: (subData: SubjectData) => void;
}

interface YearMiniCardProps {
  year: number;
  yearGrades: Grade[];
  onClick: () => void;
}

interface YearDetailModalProps {
  isOpen: boolean;
  year?: number;
  yearGrades?: Grade[];
  onClose: () => void;
  onTermClick: (year: number, term: number, termGrades: Grade[]) => void;
}

interface SubjectMiniCardProps {
  subData: SubjectData;
  onClick: () => void;
}

interface TermFilterDropdownProps {
  selectedTerm: string | number;
  onTermSelect: (term: string | number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatShortDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Simple Gauge Component
const GaugeChart: React.FC<GaugeChartProps> = ({ percentage, size = 120 }) => {
  const safePercentage = Math.min(100, Math.max(0, percentage || 0));
  const radius = size / 2;
  const strokeWidth = 8;
  const center = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * center;

  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={center}
          cx={radius}
          cy={radius}
          className="opacity-50"
        />
        <circle
          stroke="#84CC16"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={center}
          cx={radius}
          cy={radius}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(safePercentage)}%</span>
      </div>
    </div>
  );
};

// Header Component with View Mode Dropdown
const Header: React.FC<HeaderProps> = ({ 
  user, 
  date = new Date(), 
  isScrolled = false, 
  searchQuery, 
  onSearchChange, 
  viewMode, 
  onViewModeChange, 
  isViewDropdownOpen, 
  setIsViewDropdownOpen, 
  showSearch 
}) => (
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
    <div className="flex justify-between items-center mb-4">
      <motion.h1 
        className="font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent"
        animate={{ fontSize: isScrolled ? '20px' : '32px' }}
        transition={{ duration: 0.3 }}
      >
        History
      </motion.h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.button 
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg bg-slate-800/50 transition-all"
            onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
            whileTap={{ scale: 0.98 }}
            animate={{ scale: isScrolled ? 0.9 : 1 }}
          >
            {viewMode === 'individual' ? 'Tests' : 'Report Card'}
            <ChevronDown className={`transition-transform ${isViewDropdownOpen ? 'rotate-180' : ''}`} size={16} />
          </motion.button>
          <AnimatePresence>
            {isViewDropdownOpen && (
              <motion.div 
                className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <motion.button
                  onClick={() => { onViewModeChange('individual'); setIsViewDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700 rounded-t-xl"
                  whileTap={{ scale: 0.98 }}
                >
                  Tests
                </motion.button>
                <motion.button
                  onClick={() => { onViewModeChange('report'); setIsViewDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-slate-700 rounded-b-xl"
                  whileTap={{ scale: 0.98 }}
                >
                  Report Card
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.div 
          className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center text-black font-bold text-sm shadow-lg"
          animate={{ scale: isScrolled ? 0.85 : 1 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.9 }}
        >
          {user?.nickname?.[0]?.toUpperCase() || 'U'}
        </motion.div>
      </div>
    </div>
    {showSearch && (
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search assessments..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-lime-400/50"
        />
      </div>
    )}
  </motion.div>
);

// Grade Item Component
const GradeItem: React.FC<GradeItemProps> = ({ grade, onClick, onEdit, onDelete, isEditing }) => (
  <motion.div
    className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-3 last:mb-0 hover:bg-slate-700/50 transition-colors cursor-pointer"
    onClick={() => onClick(grade)}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.005 }}
  >
    <div className="flex justify-between items-end">
      <div className="flex-1">
        <div className="mb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{SUBJECT_EMOJIS[grade.subject as keyof typeof SUBJECT_EMOJIS] || '📚'}</span>
              <p className="font-semibold text-white text-base">
                {grade.subject.charAt(0).toUpperCase() + grade.subject.slice(1)}
              </p>
            </div>
            <p className="text-sm text-left font-medium text-gray-300">{grade.assessment_name}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-[calc(2.5rem+0.75rem)]">
            {formatShortDate(grade.assessment_date)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-left">
            <p className="text-lg font-bold text-white">{grade.score}/{grade.max_score}</p>
            <p className="text-sm text-lime-400">{(grade.percentage || 0).toFixed(1)}%</p>
          </div>
          {isEditing && (
            <div className="flex gap-2 ml-auto">
              <motion.button onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(grade); }} whileTap={{ scale: 0.9 }} className="p-1 text-lime-400 hover:text-lime-300">
                <Edit3 size={16} />
              </motion.button>
              <motion.button onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(grade.id); }} whileTap={{ scale: 0.9 }} className="p-1 text-red-400 hover:text-red-300">
                <Trash2 size={16} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// Empty State
const EmptyHistoryState: React.FC<EmptyHistoryStateProps> = ({ onAddGrade }) => (
  <motion.div 
    className="flex flex-col items-center justify-center py-12 px-6 text-center bg-slate-900 border border-slate-800 rounded-2xl shadow-xl"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <motion.div>
      <Calendar className="text-6xl mb-4 text-gray-600" />
    </motion.div>
    <h3 className="text-2xl font-bold text-white mb-3">No Grades Yet</h3>
    <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
      Your academic journey starts here. Add your first assessment to begin tracking your progress.
    </p>
    <motion.button
      onClick={onAddGrade}
      className="bg-lime-400 text-black font-bold px-8 py-3 rounded-xl shadow-xl flex items-center gap-2"
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
    >
      <Plus size={20} />
      Add First Grade
    </motion.button>
  </motion.div>
);


// Add Grade Modal with Term/Date Toggle
const AddGradeModal: React.FC<AddGradeModalProps> = ({ isOpen, onClose, onSubmit, subjects }) => {
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    assessment_name: '',
    score: '',
    max_score: '100',
    term: 1,
    year: new Date().getFullYear(),
    useSpecificDate: false,
    assessment_date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const currentYear = new Date().getFullYear();

  const validate = (): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};
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

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let finalDate: string;
    if (formData.useSpecificDate) {
      finalDate = formData.assessment_date;
    } else {
      const monthDay = TERM_END_DATES[formData.term as keyof typeof TERM_END_DATES];
      finalDate = `${formData.year}-${monthDay}`;
    }

    const submitData: FormData & { assessment_date: string } = { ...formData, assessment_date: finalDate };
    onSubmit(submitData);
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
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, subject: e.target.value})}
                className={`w-full bg-slate-800 text-white border ${errors.subject ? 'border-red-500' : 'border-slate-700'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all`}
              >
                <option value="">Select a subject</option>
                {subjects.map(s => (
                  <option key={s} value={s}>
                    {SUBJECT_EMOJIS[s as keyof typeof SUBJECT_EMOJIS]} {s.charAt(0).toUpperCase() + s.slice(1)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, assessment_name: e.target.value})}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, score: e.target.value})}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, max_score: e.target.value})}
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
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, term: parseInt(e.target.value)})}
                      className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                    >
                      <option value={1}>Term 1</option>
                      <option value={2}>Term 2</option>
                      <option value={3}>Term 3</option>
                      <option value={4}>Term 4</option>
                    </select>
                    <select
                      value={formData.year}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, year: parseInt(e.target.value)})}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, assessment_date: e.target.value})}
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

// Assessment Detail Modal with horizontal bar chart
const AssessmentDetailModal: React.FC<AssessmentDetailModalProps> = ({ isOpen, grade, subjectGrades, onClose }) => {
  if (!isOpen || !grade) return null;

  // Compute subject stats
  const subjectAvg = subjectGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / subjectGrades.length || 0;
  const recentGrades = subjectGrades.slice(0, 5).sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime()); // Most recent 5, sorted oldest first
  const chartData = subjectGrades.map((g) => ({ 
    name: formatShortDate(g.assessment_date), 
    value: g.percentage || 0,
    date: g.assessment_date
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date

  const safeAvg = Math.min(100, Math.max(0, subjectAvg));
  const gradePercentage = grade.percentage || 0;
  const trend = subjectGrades.length > 1 ? ((subjectGrades[0].percentage ?? 0) - (subjectGrades[1]?.percentage ?? 0)) : 0; // Most recent trend
  const safeTrend = trend;

  // Placeholder percentile
  const percentile = Math.min(100, Math.max(0, 50 + (gradePercentage - 70) * 2));

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
              {grade.assessment_name}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Grade Summary */}
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{gradePercentage.toFixed(1)}%</div>
              <p className="text-gray-400 text-sm mb-4">{grade.score}/{grade.max_score} • {formatDate(grade.assessment_date)}</p>
              <GaugeChart percentage={gradePercentage} size={120} />
              <p className="text-lime-400 font-semibold mt-2">Top {percentile.toFixed(0)}% in {grade.subject}</p>
            </div>

            {/* Subject Context */}
            <div className="bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-700">
              <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Subject Overview</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-white">{safeAvg.toFixed(1)}%</span>
                <span className={`text-sm ${safeTrend >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                  {safeTrend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {Math.abs(safeTrend).toFixed(1)} pts
                </span>
              </div>
              <p className="text-xs text-gray-500">{subjectGrades.length} assessments in {grade.subject}</p>
            </div>

            {/* Progress Chart */}
            {chartData.length > 1 && (
              <div className="bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-700">
                <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Progress Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E293B', 
                        border: '1px solid #475569', 
                        borderRadius: '12px',
                        color: '#F9FAFB' 
                      }} 
                    />
                    <Line type="monotone" dataKey="value" stroke="#84CC16" strokeWidth={3} dot={{ fill: '#84CC16', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Grades Vertical Bar */}
            {recentGrades.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Recent Assessments</h3>
                <div className="space-y-4">
                  <div className="h-12 flex items-end gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const g = recentGrades[i];
                      const isCurrent = g && g.id === grade.id;
                      return (
                        <div key={i} className="flex-1 relative group h-full">
                          <div className="absolute inset-0 bg-slate-700 rounded-t opacity-20" />
                          {g ? (
                            <motion.div
                              className={`absolute bottom-0 left-0 right-0 rounded-t ${isCurrent ? 'bg-gradient-to-t from-lime-500 to-emerald-500 shadow-md' : 'bg-gradient-to-t from-lime-400 to-emerald-400'}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${g.percentage || 0}%` }}
                              transition={{ delay: i * 0.1, duration: 0.5 }}
                            />
                          ) : null}
                          {g && (
                            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity pb-1">
                              <span className="text-xs text-white bg-black/50 px-1 rounded">{g.assessment_name.slice(0, 10)}...</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const g = recentGrades[i];
                      return (
                        <span key={i} className="text-center min-w-[20%]">
                          {g ? formatShortDate(g.assessment_date) : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* All Subject Grades List */}
            <div className="space-y-3">
              <h3 className="text-gray-400 text-xs uppercase tracking-wide font-medium">All {grade.subject} Assessments</h3>
              {subjectGrades.map((g, index) => (
                <motion.div 
                  key={g.id} 
                  className={`rounded-xl p-4 flex justify-between items-center shadow-lg border ${g.id === grade.id ? 'border-lime-400 bg-lime-500/5 border-l-4' : 'border-slate-700'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div>
                    <p className={`font-semibold text-sm ${g.id === grade.id ? 'text-lime-400' : 'text-white'}`}>{g.assessment_name}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(g.assessment_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${g.id === grade.id ? 'text-lime-400' : 'text-white'}`}>{g.score}/{g.max_score}</p>
                    <p className={`text-xs font-medium ${ (g.percentage || 0) > 80 ? 'text-lime-400' : (g.percentage || 0) > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      ({(g.percentage || 0).toFixed(1)}%)
                    </p>
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

// Subject Detail Modal
const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({ isOpen, subjectData, onClose, onGradeClick }) => {
  if (!isOpen || !subjectData) return null;

  const { subject, grades, average, trend } = subjectData;
  const chartData = grades.map((g) => ({ 
    name: formatShortDate(g.assessment_date), 
    value: g.percentage || 0,
    date: g.assessment_date
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const safeAvg = Math.min(100, Math.max(0, average || 0));
  const safeTrend = trend || 0;

  const recentGrades = grades.slice(-5).sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime()); // Most recent 5, sorted oldest first

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
              {subject.charAt(0).toUpperCase() + subject.slice(1)}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{safeAvg.toFixed(1)}%</div>
              <p className="text-gray-400 text-sm mb-4">{grades.length} assessments</p>
              <GaugeChart percentage={safeAvg} size={120} />
            </div>

            {chartData.length > 1 && (
              <div className="bg-slate-800 rounded-2xl p-4 shadow-lg border border-slate-700">
                <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium">Progress Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                    <RechartsTooltip 
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

            {/* Recent Grades Horizontal Bar */}
            {recentGrades.length > 0 && (
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-white">{safeAvg.toFixed(1)}%</span>
                  <span className={`text-sm ${safeTrend >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                    {safeTrend >= 0 ? '↑' : '↓'} {Math.abs(safeTrend).toFixed(1)}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="h-12 flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => recentGrades[i] || null).map((g, i) => (
                      <div key={i} className="flex-1 relative group">
                        {g ? (
                          <motion.div
                            className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded"
                            initial={{ width: 0 }}
                            animate={{ width: `${g.percentage || 0}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                          />
                        ) : (
                          <div className="h-full bg-slate-700 rounded opacity-50" />
                        )}
                        {g && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-white bg-black/50 px-1 rounded">{g.assessment_name.slice(0, 10)}...</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    {Array.from({ length: 5 }, (_, i) => recentGrades[i] || null).map((g, i) => (
                      <span key={i} className="text-center min-w-[20%]">
                        {g ? formatShortDate(g.assessment_date) : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-gray-400 text-xs uppercase tracking-wide font-medium">Assessments</h3>
              {grades.sort((a, b) => new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime()).map((grade, index) => (
                <motion.div 
                  key={grade.id} 
                  className="bg-slate-800 rounded-xl p-4 flex justify-between items-center shadow-lg border border-slate-700 cursor-pointer hover:bg-slate-700/50"
                  onClick={() => onGradeClick(grade, grades)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
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

// Term Mini Card for Year/Term Modals
const TermMiniCard: React.FC<TermMiniCardProps> = ({ term, termGrades, onClick }) => {
  const termAvg = termGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / termGrades.length || 0;
  const count = termGrades.length;

  return (
    <motion.div
      className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold text-lime-400">Term {term}</h4>
          <p className="text-xs text-gray-400">{count} assessments</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm text-white">{termAvg.toFixed(1)}%</p>
        </div>
      </div>
    </motion.div>
  );
};

// Term Detail Modal
const TermDetailModal: React.FC<TermDetailModalProps> = ({ isOpen, year, term, termGrades, onClose, onSubjectClick }) => {
  if (!isOpen || !year || !term || !termGrades) return null;

  const termAvg = termGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / termGrades.length || 0;
  const count = termGrades.length;

  const bySub = termGrades.reduce((acc: { [key: string]: Grade[] }, g) => {
    if (!acc[g.subject]) acc[g.subject] = [];
    acc[g.subject].push(g);
    return acc;
  }, {});

  const subjectEntries = Object.entries(bySub).map(([sub, sGrades]) => {
    const sortedGrades = [...sGrades].sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime());
    const avg = sortedGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / sortedGrades.length || 0;
    const tr = sortedGrades.length > 1 ? sortedGrades[sortedGrades.length - 1].percentage! - sortedGrades[0].percentage! : 0;
    return {
      subject: sub,
      grades: sortedGrades,
      average: avg,
      trend: tr
    };
  });

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
              Term {term} {year}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{termAvg.toFixed(1)}%</div>
              <p className="text-gray-400 text-sm mb-4">{count} assessments</p>
              <GaugeChart percentage={termAvg} size={120} />
            </div>

            <div className="space-y-3">
              <h3 className="text-gray-400 text-xs uppercase tracking-wide font-medium">Subjects</h3>
              {subjectEntries.map((subData, index) => (
                <motion.div 
                  key={subData.subject}
                  className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  onClick={() => onSubjectClick(subData)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{SUBJECT_EMOJIS[subData.subject as keyof typeof SUBJECT_EMOJIS] || '📚'}</span>
                      <div>
                        <p className="font-semibold text-white">{subData.subject.charAt(0).toUpperCase() + subData.subject.slice(1)}</p>
                        <p className="text-xs text-gray-400">{subData.grades.length} assessments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-lime-400">{subData.average.toFixed(1)}%</p>
                    </div>
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

// Year Mini Card for Report View
const YearMiniCard: React.FC<YearMiniCardProps> = ({ year, yearGrades, onClick }) => {
  const stats = computeYearStats(yearGrades);
  return (
    <motion.div
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-700/50 transition-colors shadow-lg"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">{year}</h3>
          <p className="text-sm text-gray-400">{stats.total} assessments • Avg: {stats.avg.toFixed(1)}%</p>
        </div>
        <ChevronDown size={20} className="text-lime-400" />
      </div>
    </motion.div>
  );
};

// Year Detail Modal
const YearDetailModal: React.FC<YearDetailModalProps> = ({ isOpen, year, yearGrades, onClose, onTermClick }) => {
  if (!isOpen || !year || !yearGrades) return null;

  const stats = computeYearStats(yearGrades);

  // Filter terms with grades
  const termsWithGrades = [1, 2, 3, 4].filter(t => {
    const tg = yearGrades.filter(g => getTermFromDate(g.assessment_date, year) === t);
    return tg.length > 0;
  }).map(t => ({
    term: t,
    grades: yearGrades.filter(g => getTermFromDate(g.assessment_date, year) === t)
  }));

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
              {year} Report
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Year in Review */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4">Year in Review</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-600 p-3 rounded-lg text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Overall Average</p>
                  <p className="text-2xl font-bold text-lime-400">{stats.avg.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-600 p-3 rounded-lg text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Total Assessments</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-slate-600 p-3 rounded-lg text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Best Subject</p>
                  <p className="text-lg font-bold text-white">{stats.bestSubject || 'N/A'}</p>
                  <p className="text-sm text-lime-400">{stats.bestAvg.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-600 p-3 rounded-lg text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Most Improved</p>
                  <p className="text-lg font-bold text-white">{stats.improvedSubject || 'N/A'}</p>
                  <p className="text-sm text-emerald-400">+{stats.improvement.toFixed(1)} pts</p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-3">
              <h3 className="text-gray-400 text-xs uppercase tracking-wide font-medium">Terms</h3>
              {termsWithGrades.map(({ term, grades }, index) => (
                <TermMiniCard
                  key={term}
                  term={term}
                  termGrades={grades}
                  onClick={() => onTermClick(year, term, grades)}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Subject Mini Card for Term Modal
const SubjectMiniCard: React.FC<SubjectMiniCardProps> = ({ subData, onClick }) => {
  const { subject, average, grades } = subData;
  return (
    <motion.div
      className="bg-slate-800 rounded-xl p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{SUBJECT_EMOJIS[subject as keyof typeof SUBJECT_EMOJIS] || '📚'}</span>
          <div>
            <p className="font-semibold text-white">{subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
            <p className="text-xs text-gray-400">{grades.length} assessments</p>
          </div>
        </div>
        <p className="font-bold text-lg text-lime-400">{average.toFixed(1)}%</p>
      </div>
    </motion.div>
  );
};

// Helper to get term from date
const getTermFromDate = (dateStr: string, year: number): number => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
};

// Compute Year Stats
const computeYearStats = (yearGrades: Grade[]): YearStats => {
  if (!yearGrades.length) {
    return { avg: 0, total: 0, bestSubject: null, bestAvg: 0, improvedSubject: null, improvement: 0 };
  }
  const avg = yearGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / yearGrades.length;
  const bySubject = yearGrades.reduce((acc: { [key: string]: Grade[] }, g) => {
    if (!acc[g.subject]) acc[g.subject] = [];
    acc[g.subject].push(g);
    return acc;
  }, {});
  const subjectAvgs = Object.fromEntries(
    Object.entries(bySubject).map(([sub, gs]) => [sub, gs.reduce((sum, g) => sum + (g.percentage || 0), 0) / gs.length])
  );
  const bestEntry = Object.entries(subjectAvgs).reduce(([maxKey, maxVal], [curKey, curVal]) => (curVal > maxVal ? [curKey, curVal] : [maxKey, maxVal]), ['', 0] as [string, number]);
  const bestSubject = bestEntry[0];
  const bestAvg = bestEntry[1];
  let maxImprove = 0;
  let impSub: string | null = null;
  for (const [sub, gs] of Object.entries(bySubject)) {
    if (gs.length < 2) continue;
    const sorted = [...gs].sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime());
    const diff = sorted[sorted.length - 1].percentage! - sorted[0].percentage!;
    if (diff > maxImprove) {
      maxImprove = diff;
      impSub = sub;
    }
  }
  return { avg, total: yearGrades.length, bestSubject, bestAvg, improvedSubject: impSub, improvement: maxImprove };
};

// Term Filter Dropdown
const TermFilterDropdown: React.FC<TermFilterDropdownProps> = ({ selectedTerm, onTermSelect, isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        className="absolute top-full right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-10"
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <motion.button
          onClick={() => { onTermSelect('all'); onClose(); }}
          className={`w-full text-left px-4 py-3 text-sm rounded-t-xl ${selectedTerm === 'all' ? 'bg-lime-400 text-black' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}
          whileTap={{ scale: 0.98 }}
        >
          All Terms
        </motion.button>
        {[1, 2, 3, 4].map(t => (
          <motion.button
            key={t}
            onClick={() => { onTermSelect(t); onClose(); }}
            className={`w-full text-left px-4 py-3 text-sm ${selectedTerm === t ? 'bg-lime-400 text-black' : 'text-gray-400 hover:bg-slate-700 hover:text-white'}`}
            whileTap={{ scale: 0.98 }}
          >
            Term {t}
          </motion.button>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// Main History Component
const History: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string | number>('all');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'individual' | 'report'>('individual'); // 'individual' or 'report'
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGrade, setSelectedGrade] = useState<SelectedGradeData | null>(null);
  const [selectedYear, setSelectedYear] = useState<SelectedYearData | null>(null);
  const [selectedTermData, setSelectedTermData] = useState<SelectedTermData | null>(null);
  const [selectedSubjectData, setSelectedSubjectData] = useState<SubjectData | null>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState<boolean>(false);
  const [isTermFilterOpen, setIsTermFilterOpen] = useState<boolean>(false);
  const [backStack, setBackStack] = useState<Array<{ type: string; data: SelectedYearData | SelectedTermData | SubjectData }>>([]);

  // Get unique subjects with grades
  const userSubjects = [...new Set(grades.map(g => g.subject))];

  // Group grades by year for report view
  const gradesByYear = grades.reduce((acc: { [key: number]: Grade[] }, g) => {
    const year = new Date(g.assessment_date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(g);
    return acc;
  }, {});

  // Available years with grades
  const availableYears = Object.keys(gradesByYear).sort((a, b) => parseInt(b) - parseInt(a)).map(Number);

  const loadUserAndGrades = useCallback(async () => {
    try {
      const getSessionRes = await supabase.auth.getSession();
      let session = getSessionRes?.data?.session ?? null;

      if (!session) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) throw anonError;
        session = anonData?.session ?? null;
      }

      if (!session || !session.user) {
        throw new Error('Unable to obtain a valid session');
      }

      const userId = session.user.id;

      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!dbUser) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            id: userId,
            nickname: 'Student',
            school_code: 'DEMO',
            school_name: 'Demo School',
            level: 'sec_4'
          }])
          .select()
          .single();
        if (createError) throw createError;
        setUser(newUser as User);
      } else {
        setUser(dbUser as User);
      }

      const { data: gradesData, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false });

      if (error) throw error;

      const processedGrades = (gradesData as Grade[] || []).map(g => ({
        ...g,
        percentage: (g.score / g.max_score) * 100
      }));

      setGrades(processedGrades);
      setFilteredGrades(processedGrades);

    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserAndGrades();
  }, [loadUserAndGrades]);

  // Filter grades based on search, subject filter, and term filter
  useEffect(() => {
    let filtered = grades;

    if (searchQuery) {
      filtered = filtered.filter(grade =>
        grade.assessment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grade.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(grade => grade.subject === activeFilter);
    }

    if (selectedTerm !== 'all') {
      filtered = filtered.filter(grade => {
        const gradeYear = new Date(grade.assessment_date).getFullYear();
        const termNum = getTermFromDate(grade.assessment_date, gradeYear);
        return termNum === parseInt(selectedTerm as string);
      });
    }

    setFilteredGrades(filtered);
  }, [searchQuery, activeFilter, selectedTerm, grades]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddGrade = async (formData: FormData) => {
    if (!user) return;

    const newGrade: Omit<Grade, 'id' | 'percentage'> = {
      user_id: user.id,
      subject: formData.subject,
      assessment_name: formData.assessment_name,
      score: parseFloat(formData.score),
      max_score: parseFloat(formData.max_score),
      assessment_date: formData.assessment_date,
    };

    try {
      const { data, error } = await supabase
        .from('grades')
        .insert([newGrade])
        .select()
        .single();

      if (error) throw error;

      await loadUserAndGrades();
    } catch (err) {
      console.error('Error adding grade:', err);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    const { error } = await supabase.from('grades').delete().eq('id', id);
    if (error) {
      console.error('Error deleting grade:', error);
      return;
    }

    await loadUserAndGrades();
  };

  const handleEdit = (grade: Grade): void => {
    console.log('Edit grade:', grade);
  };

  const handleGradeClick = (grade: Grade, contextGrades?: Grade[]): void => {
    const subjectGrades = contextGrades || grades.filter((g) => g.subject === grade.subject);
    const fromSubject = !!selectedSubjectData;
    if (fromSubject) {
      setBackStack((prev) => [...prev, { type: 'subject', data: selectedSubjectData! }]);
      setSelectedSubjectData(null);
    }
    setSelectedGrade({ grade, subjectGrades });
  };

  const handleYearClick = (year: number, yearGrades: Grade[]): void => {
    setSelectedYear({ year, yearGrades });
  };

  const handleTermClick = (year: number, term: number, termGrades: Grade[]): void => {
    if (selectedYear) {
      setBackStack((prev) => [...prev, { type: 'year', data: selectedYear }]);
      setSelectedYear(null);
    }
    setSelectedTermData({ year, term, termGrades });
  };

  const handleSubjectClick = (subData: SubjectData): void => {
    if (selectedTermData) {
      setBackStack((prev) => [...prev, { type: 'term', data: selectedTermData }]);
      setSelectedTermData(null);
    }
    setSelectedSubjectData(subData);
  };

  const handleModalClose = useCallback((type: 'year' | 'term' | 'subject' | 'assessment'): void => {
    type ModalType = 'year' | 'term' | 'subject' | 'assessment';
    // union of all possible selected data shapes accepted by setters
    type ModalData = SelectedYearData | SelectedTermData | SubjectData | SelectedGradeData | null;

    const setters: Record<ModalType, ((val: ModalData) => void) | undefined> = {
      year: (v) => setSelectedYear(v as SelectedYearData | null),
      term: (v) => setSelectedTermData(v as SelectedTermData | null),
      subject: (v) => setSelectedSubjectData(v as SubjectData | null),
      assessment: (v) => setSelectedGrade(v as SelectedGradeData | null),
    };
    setters[type]?.(null);

    if (backStack.length === 0) return;

    setBackStack((prev) => {
      const newStack = [...prev];
      const popped = newStack.pop();
      if (popped) {
        const popSetters: Record<'year' | 'term' | 'subject', (val: SelectedYearData | SelectedTermData | SubjectData | null) => void> = {
          year: (v) => setSelectedYear(v as SelectedYearData | null),
          term: (v) => setSelectedTermData(v as SelectedTermData | null),
          subject: (v) => setSelectedSubjectData(v as SubjectData | null),
        };
        const setter = popSetters[popped.type as 'year' | 'term' | 'subject'];
        if (setter) {
          setter(popped.data as SelectedYearData | SelectedTermData | SubjectData | null);
        }
      }
      return newStack;
    });
  }, [backStack]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header 
          user={null} 
          isScrolled={false} 
          searchQuery="" 
          onSearchChange={() => {}} 
          viewMode="individual"
          onViewModeChange={() => {}} 
          isViewDropdownOpen={false}
          setIsViewDropdownOpen={() => {}}
          showSearch={false}
        />
        <div className="px-5 py-6 space-y-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
              <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 grid grid-cols-5 place-items-center py-3 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.button 
          className="flex flex-col items-center text-xs font-medium text-gray-400" 
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
          className="flex flex-col items-center text-xs font-medium text-lime-400" 
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <Header 
        user={user} 
        isScrolled={isScrolled} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isViewDropdownOpen={isViewDropdownOpen}
        setIsViewDropdownOpen={setIsViewDropdownOpen}
        showSearch={viewMode === 'individual'}
      />

      <div className="px-5 py-6 space-y-6 relative">
        {viewMode === 'individual' && (
          <>
            {/* Filter Tabs */}
            <div className="flex bg-slate-800 rounded-xl p-1 overflow-x-auto scrollbar-hide box-border">
              <motion.button
                onClick={() => setActiveFilter('all')}
                className={`flex-shrink-0 px-4 py-3 mx-1 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-w-max max-w-32 overflow-hidden box-border ${
                  activeFilter === 'all'
                    ? 'bg-lime-400 text-black shadow-lg'
                    : 'text-gray-400 hover:text-white bg-slate-700/50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span className="truncate">All Subjects</span>
              </motion.button>
              {userSubjects.map((subject) => (
                <motion.button
                  key={subject}
                  onClick={() => setActiveFilter(subject)}
                  className={`flex-shrink-0 px-4 py-3 mx-1 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-w-max max-w-32 overflow-hidden box-border ${
                    activeFilter === subject
                      ? 'bg-lime-400 text-black shadow-lg'
                      : 'text-gray-400 hover:text-white bg-slate-700/50'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="truncate">
                    {SUBJECT_EMOJIS[subject as keyof typeof SUBJECT_EMOJIS]} {subject.charAt(0).toUpperCase() + subject.slice(1)}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center">
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isEditing
                    ? 'text-red-400 hover:text-red-300 bg-red-500/10'
                    : 'text-gray-400 hover:text-white bg-slate-700/50'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                {isEditing ? 'Done Editing' : 'Edit Grades'}
              </motion.button>
              <div className="relative">
                <motion.button
                  onClick={() => setIsTermFilterOpen(!isTermFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all text-gray-400 hover:text-white bg-slate-700/50"
                  whileTap={{ scale: 0.98 }}
                >
                  <Filter size={16} />
                  {selectedTerm === 'all' ? 'All Terms' : `Term ${selectedTerm}`}
                  <ChevronDown className={`transition-transform ${isTermFilterOpen ? 'rotate-180' : ''}`} size={16} />
                </motion.button>
                <TermFilterDropdown
                  selectedTerm={selectedTerm}
                  onTermSelect={setSelectedTerm}
                  isOpen={isTermFilterOpen}
                  onClose={() => setIsTermFilterOpen(false)}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {filteredGrades.length > 0 ? (
                <div className="space-y-3">
                  {filteredGrades.map((grade) => (
                    <GradeItem
                      key={grade.id}
                      grade={grade}
                      onClick={handleGradeClick}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isEditing={isEditing}
                    />
                  ))}
                </div>
              ) : (
                <EmptyHistoryState onAddGrade={() => setIsModalOpen(true)} />
              )}
            </AnimatePresence>
          </>
        )}

        {viewMode === 'report' && (
          <AnimatePresence mode="wait">
            <div className="space-y-4">
              {availableYears.map((year) => (
                <YearMiniCard
                  key={year}
                  year={year}
                  yearGrades={gradesByYear[year]}
                  onClick={() => handleYearClick(year, gradesByYear[year])}
                />
              ))}
              {availableYears.length === 0 && <EmptyHistoryState onAddGrade={() => setIsModalOpen(true)} />}
            </div>
          </AnimatePresence>
        )}
      </div>

      <AddGradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddGrade}
        subjects={Object.keys(SUBJECT_EMOJIS)}
      />

<AssessmentDetailModal
  isOpen={!!selectedGrade}
  grade={selectedGrade?.grade || null}
  subjectGrades={selectedGrade?.subjectGrades || []}
  onClose={() => handleModalClose('assessment')}
/>

      <YearDetailModal
        isOpen={!!selectedYear}
        year={selectedYear?.year}
        yearGrades={selectedYear?.yearGrades}
        onClose={() => handleModalClose('year')}
        onTermClick={handleTermClick}
      />

      <TermDetailModal
        isOpen={!!selectedTermData}
        year={selectedTermData?.year}
        term={selectedTermData?.term}
        termGrades={selectedTermData?.termGrades}
        onClose={() => handleModalClose('term')}
        onSubjectClick={handleSubjectClick}
      />

      <SubjectDetailModal
        isOpen={!!selectedSubjectData}
        subjectData={selectedSubjectData}
        onClose={() => handleModalClose('subject')}
        onGradeClick={handleGradeClick}
      />

      {/* Bottom Navigation */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 grid grid-cols-5 place-items-center py-3 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.button 
          className="flex flex-col items-center text-xs font-medium text-gray-400" 
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
          className="flex flex-col items-center text-xs font-medium text-lime-400" 
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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default History;