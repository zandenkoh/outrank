"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, User, School, GraduationCap, ShieldCheck, ShieldOff, Save, Edit3, X, Sparkles, BarChart3, Trophy, Calendar, Plus, Filter, Search, Key, Bell, Download, Trash2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

interface School {
  code: string;
  name: string;
}

interface User {
  id: string;
  nickname: string;
  school_code: string;
  school_name: string;
  level: string;
  avatar_seed?: string;
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
  percentage: number;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  overall_average: number;
  total_grades: number;
  subjects_count: number;
  best_subject: string | null;
  best_subject_average: number;
  most_improved_subject: string | null;
  improvement_amount: number;
  consistency_score: number;
}

interface ProfileFormData {
  nickname: string;
  school_code: string;
  school_name: string;
  level: string;
  opted_in_cohort: boolean;
  twoFA: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    inapp: boolean;
  };
  share_school: boolean;
  share_national: boolean;
  data_retention: string;
  sessions: Array<{
    device: string;
    location: string;
    lastActive: string;
  }>;
}

interface AddGradeForm {
  subject: string;
  assessment_name: string;
  score: string;
  max_score: string;
  term: number;
  year: number;
  useSpecificDate: boolean;
  assessment_date: string;
}

type LevelOption = { value: string; label: string };

type SchoolsRecord = Record<'secondary' | 'jc' | 'ib', School[]>;

type SubjectEmojisRecord = Record<string, string>;

type AuthStatus = 'anonymous' | 'pending' | 'verified';

const SCHOOLS: SchoolsRecord = {
  secondary: [
    { code: 'RI', name: 'Raffles Institution' },
    { code: 'HCI', name: 'Hwa Chong Institution' },
    { code: 'ACS-I', name: 'Anglo-Chinese School (Independent)' },
    { code: 'NUSH', name: 'NUS High School of Math and Science' },
    { code: 'SJI', name: "St. Joseph's Institution" },
    { code: 'SCGS', name: "Singapore Chinese Girls' School" },
    { code: 'MGS', name: "Methodist Girls' School" },
    { code: 'CHIJ-SN', name: 'CHIJ St. Nicholas Girls School' },
    { code: 'DMSS', name: 'Dunman High School' },
    { code: 'VS', name: 'Victoria School' },
    { code: 'NYGH', name: 'Nanyang Girls High School' },
    { code: 'RGS', name: "Raffles Girls' School" },
    { code: 'TKGS', name: 'Tanjong Katong Girls School' },
    { code: 'CHIJ-KCP', name: 'CHIJ Katong Convent' },
    { code: 'CEDAR', name: 'Cedar Girls Secondary School' },
    { code: 'CHSS', name: 'Catholic High School' },
    { code: 'SSH', name: 'Singapore Sports School' },
    { code: 'SAS', name: 'School of the Arts' },
    { code: 'NPS', name: 'Naval Base Secondary School' },
    { code: 'TKSS', name: 'Tanjong Katong Secondary School' },
    { code: 'BBSS', name: 'Bukit Batok Secondary School' },
    { code: 'PLMGSS', name: 'Paya Lebar Methodist Girls School' },
    { code: 'RVHS', name: 'River Valley High School' },
    { code: 'CHIJ-OLQP', name: 'CHIJ Our Lady Queen of Peace' },
    { code: 'CHIJ-SJC', name: 'CHIJ St. Joseph\'s Convent' },
    { code: 'CHIJ-TP', name: 'CHIJ Toa Payoh' },
    { code: 'CHIJ-KC', name: 'CHIJ Kellock' },
    { code: 'SNGS', name: 'Singapore Nanyang Girls\' School' },
    { code: 'ACSBR', name: 'Anglo-Chinese School (Barker Road)' },
    { code: 'AI', name: 'Anderson Secondary School' },
    { code: 'BTSS', name: 'Beatty Secondary School' },
    { code: 'BPS', name: 'Bedok South Secondary School' },
    { code: 'BVSS', name: 'Bedok View Secondary School' },
    { code: 'BGSS', name: 'Bendemeer Secondary School' },
    { code: 'BSS', name: 'Bowen Secondary School' },
    { code: 'BPGHS', name: 'Bukit Panjang Government High School' },
    { code: 'CVSS', name: 'Canberra Secondary School' },
    { code: 'CGSS', name: 'Changkat Changi Secondary School' },
    { code: 'CTSS', name: 'Chung Cheng High School (Main)' },
    { code: 'CCYSS', name: 'Chung Cheng High School (Yishun)' },
    { code: 'CLSS', name: 'Clementi Town Secondary School' },
    { code: 'CWSS', name: 'Commonwealth Secondary School' },
    { code: 'CVSS-2', name: 'Compassvale Secondary School' },
    { code: 'DBSS', name: 'Dunearn Secondary School' },
    { code: 'FCSS', name: 'Fairfield Methodist School (Secondary)' },
    { code: 'FMSS', name: 'Fajar Secondary School' },
    { code: 'FTSS', name: 'Fuchun Secondary School' },
    { code: 'GNSS', name: 'Gan Eng Seng School' },
    { code: 'GESS', name: 'Geylang Methodist School (Secondary)' },
    { code: 'GVSS', name: 'Greendale Secondary School' },
    { code: 'GRSS', name: 'Greenridge Secondary School' },
    { code: 'HGSS', name: 'Hougang Secondary School' },
    { code: 'HTSS', name: 'Hua Yi Secondary School' },
    { code: 'JRS', name: 'Jurongville Secondary School' },
    { code: 'JSSS', name: 'Junyuan Secondary School' },
    { code: 'KGSS', name: 'Kai Chun Secondary School' },
    { code: 'KCPSS', name: 'Kuo Chuan Presbyterian Secondary School' },
    { code: 'KWSS', name: 'Kranji Secondary School' },
    { code: 'MGSS-2', name: 'Maris Stella High School' },
    { code: 'MSS', name: 'Marsiling Secondary School' },
    { code: 'MBSS', name: 'Mayflower Secondary School' },
    { code: 'MSHS', name: 'Montfort Secondary School' },
    { code: 'NBSS-2', name: 'Naval Base Secondary School' },
    { code: 'NCHS', name: 'Nan Chiau High School' },
    { code: 'NHSS', name: 'Nan Hua High School' },
    { code: 'NASS', name: 'North Vista Secondary School' },
    { code: 'NBSS-3', name: 'Northbrooks Secondary School' },
    { code: 'NLSS', name: 'Northland Secondary School' },
    { code: 'OLPS', name: 'Outram Secondary School' },
    { code: 'PTHS', name: 'Pasir Ris Crest Secondary School' },
    { code: 'PRSS', name: 'Pasir Ris Secondary School' },
    { code: 'PHSS', name: 'Pei Hwa Secondary School' },
    { code: 'PJSS', name: 'Peicai Secondary School' },
    { code: 'POCS', name: 'Poi Ching School' },
    { code: 'PRCS', name: 'Presbyterian High School' },
    { code: 'QTSS', name: 'Queenstown Secondary School' },
    { code: 'QHSS', name: 'Queensway Secondary School' },
    { code: 'RISS', name: 'Riverside Secondary School' },
    { code: 'SDSS', name: 'Sembawang Secondary School' },
    { code: 'SKSS', name: 'Seng Kang Secondary School' },
    { code: 'SNSS', name: 'Serangoon Garden Secondary School' },
    { code: 'SSSS', name: 'Serangoon Secondary School' },
    { code: 'SLSS', name: 'Si Ling Secondary School' },
    { code: 'SPSS', name: 'Springfield Secondary School' },
    { code: 'SASS-2', name: 'St. Andrew\'s Secondary School' },
    { code: 'SACSS', name: 'St. Anthony\'s Canossian Secondary School' },
    { code: 'SGSS-2', name: 'St. Gabriel\'s Secondary School' },
    { code: 'SHSS', name: 'St. Hilda\'s Secondary School' },
    { code: 'SMGS', name: 'St. Margaret\'s Secondary School' },
    { code: 'SPSS-2', name: 'St. Patrick\'s School' },
    { code: 'TPSS', name: 'Tampines Secondary School' },
    { code: 'TNSS', name: 'Tanglin Secondary School' },
    { code: 'TKSS-2', name: 'Tanjong Katong Secondary School' },
    { code: 'TASS', name: 'Temasek Secondary School' },
    { code: 'TCHS', name: 'The Chinese High School' },
    { code: 'TWSS', name: 'Teck Whye Secondary School' },
    { code: 'YCKSS', name: 'Yio Chu Kang Secondary School' },
    { code: 'YSHS', name: 'Yishun Secondary School' },
    { code: 'YTSS-2', name: 'Yishun Town Secondary School' },
    { code: 'YCSS-2', name: 'Yuan Ching Secondary School' },
    { code: 'YISS', name: 'Yusof Ishak Secondary School' },
  ],
  jc: [
    { code: 'RJC', name: 'Raffles Junior College' },
    { code: 'HCJC', name: 'Hwa Chong Junior College' },
    { code: 'VJC', name: 'Victoria Junior College' },
    { code: 'NJC', name: 'National Junior College' },
    { code: 'ACJC', name: 'Anglo-Chinese Junior College' },
    { code: 'TJC', name: 'Temasek Junior College' },
    { code: 'DHS-JC', name: 'Dunman High School (JC)' },
    { code: 'NYJC', name: 'Nanyang Junior College' },
    { code: 'SAJC', name: 'St. Andrew\'s Junior College' },
    { code: 'CJC', name: 'Catholic Junior College' },
    { code: 'TPJC', name: 'Tampines Junior College' },
    { code: 'JJC', name: 'Jurong Junior College' },
    { code: 'YJC', name: 'Yishun Junior College' },
    { code: 'MJC', name: 'Meridian Junior College' },
    { code: 'PJC', name: 'Pioneer Junior College' },
    { code: 'SRJC', name: 'Serangoon Junior College' },
    { code: 'AJC', name: 'Anderson Junior College' },
    { code: 'IJC', name: 'Innova Junior College' },
    { code: 'JPJC', name: 'Jurong Pioneer Junior College' },
    { code: 'EJC', name: 'Eunoia Junior College' },
  ],
  ib: [
    { code: 'ACS-IB', name: 'ACS (International) IB' },
    { code: 'SJI-IB', name: 'SJI International IB' },
    { code: 'UWC', name: 'United World College of South East Asia' },
    { code: 'GESS-IB', name: 'German European School Singapore IB' },
    { code: 'CIS', name: 'Canadian International School' },
    { code: 'SAIS', name: 'Stamford American International School IB' },
  ]
};

const SUBJECT_EMOJIS: SubjectEmojisRecord = {
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

const TERM_END_DATES: Record<number, string> = {
  1: '03-31', // March 31
  2: '06-30', // June 30
  3: '09-30', // September 30
  4: '12-31'  // December 31
};

// Utility functions
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const generateAvatarSeed = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getAvailableSchools = (level: string): School[] => {
  if (level.startsWith('sec_')) return SCHOOLS.secondary;
  if (level.startsWith('jc_')) return SCHOOLS.jc;
  return [];
};

const stdDev = (values: number[]): number => {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const sqDiff = values.map(v => Math.pow(v - avg, 2));
  const variance = sqDiff.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
};

// Header Component
interface HeaderProps {
  user?: User | null;
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
        className="font-bold bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 bg-clip-text text-transparent"
        animate={{ fontSize: isScrolled ? '20px' : '32px' }}
        transition={{ duration: 0.3 }}
      >
        Profile
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
  subtitle: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color = '#10B981' }) => (
  <motion.div
    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1 relative overflow-hidden shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.3)' }}
  >
    <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: color, opacity: 0.5 }} />
    <div className="flex justify-between items-start mb-3">
      <h4 className="text-gray-400 text-xs uppercase tracking-wide font-medium">{title}</h4>
      <Icon size={18} style={{ color }} className="flex-shrink-0" />
    </div>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    <p className="text-xs text-gray-400">{subtitle}</p>
  </motion.div>
);

// Toggle Switch Component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-300">{label}</span>
    <motion.button
      type="button"
      className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-lime-400/50 ${checked ? 'bg-lime-600' : 'bg-slate-700'}`}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ x: checked ? 16 : 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      />
    </motion.button>
  </div>
);

// Editable Input
interface EditableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  className?: string;
}

const EditableInput: React.FC<EditableInputProps> = ({ value, onChange, placeholder, type = 'text', error, className = '' }) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-slate-800 text-white border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all pr-10 ${error ? 'border-red-500' : 'border-slate-700'} ${className}`}
    />
    {error && <p className="text-red-400 text-xs mt-1 absolute -bottom-5 left-0">{error}</p>}
  </div>
);

interface AddGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddGradeForm) => void;
  subjects: string[];
}

const AddGradeModal: React.FC<AddGradeModalProps> = ({ isOpen, onClose, onSubmit, subjects }) => {
  const [formData, setFormData] = useState<AddGradeForm>({
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
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    setErrors({});
    try {
      // Determine assessment_date if user picked a term/year instead of a specific date
      let assessmentDate = formData.assessment_date;
      if (!formData.useSpecificDate) {
        const termKey = formData.term in TERM_END_DATES ? formData.term : 4;
        const mmdd = TERM_END_DATES[termKey] || '12-31';
        // ensure YYYY-MM-DD format
        assessmentDate = `${formData.year}-${mmdd}`;
      }

      await onSubmit({
        ...formData,
        assessment_date: assessmentDate
      });

      // clear errors and close modal on success
      setErrors({});
      onClose();
    } catch (err: unknown) {
      console.error('Add grade error:', err);
      setErrors({ general: 'Failed to add grade. Please try again.' });
    } finally {
      setLoading(false);
    }
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
              type="button"
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
                    type="button"
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
                    type="button"
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
              type="button"
              onClick={handleSubmit}
              className="w-full bg-lime-400 text-black font-bold rounded-xl py-4 text-base shadow-xl"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
            >
              {loading ? 'Adding...' : 'Add Grade'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'create' | 'confirm' | 'change' | 'signin';
  email?: string;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type, email: prefilledEmail, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: prefilledEmail || '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!formData.email.trim().endsWith('@students.edu.sg')) newErrors.email = 'Email must end with @students.edu.sg';
    if (type !== 'confirm' && !formData.password) newErrors.password = 'Password is required';
    if ((type === 'create' || type === 'change') && formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (type === 'create' && (!formData.confirmPassword || formData.password !== formData.confirmPassword)) newErrors.confirmPassword = 'Passwords do not match';
    if (type === 'change' && !formData.password) newErrors.password = 'New password is required';
    return newErrors;
  };

  const isFormValid = (): boolean => {
    const validationErrors = validate();
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      let result;
      if (type === 'create') {
        // Save current anonymous data to localStorage for migration
        const { data: { session } } = await supabase.auth.getSession();
        const oldId = session?.user?.id;
        let migrationData = null;
        if (oldId) {
          const { data: dbUser } = await supabase.from('users').select('*').eq('id', oldId).maybeSingle();
          const { data: grades } = await supabase.from('grades').select('*').eq('user_id', oldId);
          migrationData = {
            oldId,
            newId: null as string | null, // Allow string or null type
            dbUser: dbUser,
            grades: grades || []
          };
          localStorage.setItem('pendingMigration', JSON.stringify(migrationData));
        }

        // Sign out anonymous
        await supabase.auth.signOut();

        // Sign up new user
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) {
          setErrors({ general: signUpError.message });
          // Restore localStorage if failed
          if (migrationData) {
            localStorage.setItem('pendingMigration', JSON.stringify(migrationData));
          }
          return;
        }

        if (!user || !user.id) {
          setErrors({ general: 'Signup failed. Please try again.' });
          return;
        }

        // Add newId to migrationData if it exists
        if (migrationData) {
          migrationData.newId = user.id;
          localStorage.setItem('pendingMigration', JSON.stringify(migrationData));
        }

        setSent(true);
        localStorage.setItem('verificationSent', 'true');
      } else {
        switch (type) {
          case 'confirm':
            result = await supabase.auth.resend({
              type: 'signup',
              email: formData.email.trim()
            });
            break;
          case 'change':
            result = await supabase.auth.updateUser({
              password: formData.password
            });
            break;
          case 'signin':
            // No signOut needed for pure signin; only if switching from anon
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession?.user?.is_anonymous) {
              await supabase.auth.signOut();
            }
            result = await supabase.auth.signInWithPassword({
              email: formData.email.trim(),
              password: formData.password
            });
            if (result.data.session) {
              // Clear pending migration for regular signin
              localStorage.removeItem('pendingMigration');
              window.location.reload();
            }
            break;
        }

        if (result?.error) {
          setErrors({ general: result.error.message });
          return;
        }

        if (type === 'confirm') {
          setSent(true);
          localStorage.setItem('verificationSent', 'true');
        } else {
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      });

      if (error) {
        if (error.message.includes('Email not confirmed') || error.message.includes('must be confirmed')) {
          setErrors({ general: 'Please check your email and click the verification link first.' });
        } else {
          setErrors({ general: error.message });
        }
        return;
      }

      // Success: verified and signed in
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const title = {
    create: 'Create Verified Account',
    confirm: 'Confirm Email',
    change: 'Change Password',
    signin: 'Sign In'
  }[type];

  const description = {
    create: 'Enter your school email and a strong password. We\'ll send a verification email immediately after creation. You must verify before using the account.',
    confirm: 'Resend the verification email to activate your account. Check your spam folder if not received.',
    change: 'Enter your new password. It must be at least 8 characters long.',
    signin: 'Sign in with your verified credentials.'
  }[type];

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
          className="bg-slate-900 rounded-t-3xl w-full max-w-md p-6 pb-8 shadow-2xl border-t border-slate-700 relative max-h-[90vh] overflow-y-auto"
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
            <h2 className="text-2xl font-bold text-white text-center mb-2">{title}</h2>
            <p className="text-gray-400 text-sm text-center">{description}</p>
            <button 
              type="button"
              onClick={onClose} 
              className="absolute top-6 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            {sent ? (
              <div className="text-center space-y-3">
                <p className="text-lime-400 text-lg">✅ {type === 'create' ? 'Account Created! Verification Email Sent' : 'Verification Email Resent!'}</p>
                <p className="text-gray-400 text-sm">Check your inbox (and spam) at:</p>
                <p className="text-white font-mono text-sm break-all">{formData.email}</p>
                <p className="text-gray-400 text-xs">Click the verification link and refresh this page. Your account is not active until verified.</p>
                <motion.button
                  onClick={handleContinue}
                  disabled={loading}
                  className={`w-full ${loading ? 'bg-slate-700 text-gray-400 cursor-not-allowed' : 'bg-lime-400 text-black hover:bg-lime-300'} rounded-xl py-3 font-semibold`}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Checking...' : 'Continue'}
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="w-full bg-slate-700 text-white rounded-xl py-3"
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            ) : (
              <>
                {type !== 'change' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-2 font-medium flex items-center gap-1">
                      <Mail size={16} />
                      School Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={type === 'confirm'}
                      placeholder="yourname@students.edu.sg"
                      className={`w-full bg-slate-800 text-white border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 pr-10 ${
                        errors.email ? 'border-red-500' : 'border-slate-700'
                      } ${type === 'confirm' ? 'bg-slate-800/50 cursor-not-allowed' : ''}`}
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                )}
                {(type === 'create' || type === 'change' || type === 'signin') && (
                  <>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-medium flex items-center gap-1">
                        <Lock size={16} />
                        {type === 'change' ? 'New Password' : 'Password'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter a strong password (min 8 chars)"
                          className={`w-full bg-slate-800 text-white border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 pr-10 ${
                            errors.password ? 'border-red-500' : 'border-slate-700'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                    </div>
                    {type === 'create' && (
                      <div>
                        <label className="block text-gray-400 text-sm mb-2 font-medium flex items-center gap-1">
                          <Lock size={16} />
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="Confirm your password"
                            className={`w-full bg-slate-800 text-white border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 pr-10 ${
                              errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-white"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                      </div>
                    )}
                  </>
                )}
                {errors.general && <p className="text-red-400 text-sm text-center py-2 bg-red-500/10 rounded-lg border border-red-500/30">{errors.general}</p>}
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isFormValid()}
                  className={`w-full rounded-xl py-4 text-base font-bold shadow-xl transition-all ${
                    isFormValid() && !loading
                      ? 'bg-lime-400 text-black hover:bg-lime-300'
                      : 'bg-slate-700 text-gray-400 cursor-not-allowed'
                  }`}
                  whileTap={{ scale: 0.98 }}
                  whileHover={isFormValid() && !loading ? { scale: 1.02 } : {}}
                >
                  {loading ? 'Processing...' : {
                    create: 'Create Account & Verify Email',
                    confirm: 'Resend Verification',
                    change: 'Update Password',
                    signin: 'Sign In'
                  }[type]}
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Profile Component
const Profile: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    nickname: '',
    school_code: '',
    school_name: '',
    level: '',
    opted_in_cohort: true,
    twoFA: false,
    notifications: { email: true, push: true, inapp: true },
    share_school: true,
    share_national: true,
    data_retention: '1year',
    sessions: [
      { device: 'iPhone 15', location: 'Singapore', lastActive: '2025-10-25' },
      { device: 'Chrome on Mac', location: 'Singapore', lastActive: '2025-10-28' }
    ]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('anonymous');
  const [userEmail, setUserEmail] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<'create' | 'confirm' | 'change' | 'signin'>('create');
  const [showVerificationAnimation, setShowVerificationAnimation] = useState(false);

  const levels: LevelOption[] = [
    { value: 'sec_1', label: 'Secondary 1' },
    { value: 'sec_2', label: 'Secondary 2' },
    { value: 'sec_3', label: 'Secondary 3' },
    { value: 'sec_4', label: 'Secondary 4' },
    { value: 'jc_1', label: 'JC 1' },
    { value: 'jc_2', label: 'JC 2' }
  ];

  // Helper to generate unique nickname
  const generateUniqueNickname = async (baseNickname: string, userId: string): Promise<string> => {
    let nickname = baseNickname;
    const shortId = userId.slice(-4);
    let attempt = 0;
    while (attempt < 100) {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('nickname', nickname);
      if ((count ?? 0) === 0) {
        return nickname;
      }
      attempt++;
      nickname = `${baseNickname.slice(0, 10)}${shortId}${attempt}`;
    }
    // Fallback
    return `User${Date.now().toString().slice(-6)}`;
  };

  // Helper to ensure user exists and return it
  const ensureUserExists = async (sessionUserId: string, localUser: Partial<User>): Promise<User> => {
    // Use maybeSingle to avoid 406/PGRST116 on empty
    const fetchRes = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionUserId)
      .maybeSingle();
    let existingUser = fetchRes.data;
    const fetchError = fetchRes.error;

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Unexpected fetch error:', fetchError);
      // Fallback to local
      return {
        id: sessionUserId,
        nickname: localUser.nickname || 'Student',
        school_code: localUser.school_code || 'RI',
        school_name: localUser.school_name || 'Raffles Institution',
        level: localUser.level || 'sec_4',
        opted_in_cohort: localUser.opted_in_cohort ?? true,
        avatar_seed: localUser.avatar_seed || generateAvatarSeed(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      } as User;
    }

    if (existingUser) {
      // Update with local if needed
      const updates: Partial<User> = {};
      if (localUser.nickname && localUser.nickname !== existingUser.nickname) {
        updates.nickname = await generateUniqueNickname(localUser.nickname, sessionUserId);
      }
      if (localUser.school_code && localUser.school_code !== existingUser.school_code) {
        updates.school_code = localUser.school_code;
        updates.school_name = localUser.school_name || '';
      }
      if (localUser.level && localUser.level !== existingUser.level) {
        updates.level = localUser.level;
      }
      if (!existingUser.avatar_seed) {
        updates.avatar_seed = generateAvatarSeed();
      }
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();
        updates.last_active_at = new Date().toISOString();
        const { error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', sessionUserId);
        if (updateError) {
          console.error('Update error (non-fatal):', updateError);
        } else {
          // Refetch after update
          const { data: refetchedUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionUserId)
            .single();
          existingUser = refetchedUser;
        }
      }
      return existingUser as User;
      } else {
      // Create new user
      const uniqueNickname = await generateUniqueNickname(localUser.nickname || 'Student', sessionUserId);
      const avatarSeed = localUser.avatar_seed || generateAvatarSeed();
      const newUser: User = {
        id: sessionUserId,
        nickname: uniqueNickname,
        school_code: localUser.school_code || 'RI',
        school_name: localUser.school_name || 'Raffles Institution',
        level: localUser.level || 'sec_4',
        avatar_seed: avatarSeed,
        opted_in_cohort: localUser.opted_in_cohort ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      };
      const { data: confirmedUser, error: insertError } = await supabase
        .from('users')
        .upsert([newUser], { onConflict: 'id' })
        .select('*')
        .single();
      if (insertError) {
        console.error('Insert error:', insertError);
        // Fallback to local-like
        return newUser;
      }
      return confirmedUser as User;
    }
  };

  const loadData = useCallback(async (): Promise<void> => {
    try {
      const sessionResp = await supabase.auth.getSession();
      let session = sessionResp.data?.session ?? null;

      if (!session) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) throw anonError;
        session = anonData?.session ?? null;
      }

      if (!session || !session.user || !session.user.id) {
        throw new Error('No active session available');
      }

      const hasEmail = !!session.user.email;
      const isConfirmed = !!session.user.email_confirmed_at;
      const newAuthStatus = hasEmail && !isConfirmed ? 'pending' : isConfirmed ? 'verified' : 'anonymous';
      setAuthStatus(newAuthStatus);
      setUserEmail(session.user.email || '');

      // Check for verification animation
      if (newAuthStatus === 'verified' && localStorage.getItem('verificationSent')) {
        setShowVerificationAnimation(true);
        localStorage.removeItem('verificationSent');
      }

      // Load local user data
      const localUserStr = localStorage.getItem('outrankUser');
      const localUser: Partial<User> = localUserStr ? JSON.parse(localUserStr) : {
        nickname: 'Student',
        school_code: 'RI',
        school_name: 'Raffles Institution',
        level: 'sec_4'
      };

      // MIGRATION: Handle pending if verified
// MIGRATION: Handle pending if verified
      const pendingStr = localStorage.getItem('pendingMigration');
      if (pendingStr && newAuthStatus === 'verified' && session.user.id) {
        try {
          const pending = JSON.parse(pendingStr);
          if (pending.oldId && pending.newId && pending.oldId !== session.user.id && pending.newId === session.user.id) {
            // Merge pending data into localUser
            if (pending.dbUser) {
              localUser.nickname = pending.dbUser.nickname || localUser.nickname;
              localUser.school_code = pending.dbUser.school_code || localUser.school_code;
              localUser.school_name = pending.dbUser.school_name || localUser.school_name;
              localUser.level = pending.dbUser.level || localUser.level;
              localUser.avatar_seed = pending.dbUser.avatar_seed || localUser.avatar_seed;
              localUser.opted_in_cohort = pending.dbUser.opted_in_cohort ?? localUser.opted_in_cohort;
            }

            // Ensure/create user with merged data
            const mergedUser = await ensureUserExists(session.user.id, localUser);

            // Insert grades if any
            if (pending.grades && pending.grades.length > 0) {
              const newGrades = pending.grades.map((g: Grade) => ({
                ...g,
                user_id: session.user.id,
                id: undefined  // New UUID
              }));
              const { error: insertError } = await supabase.from('grades').insert(newGrades);
              if (insertError) {
                console.error('Grade insert error (non-fatal):', insertError);
              }
            }

            // Cleanup old data
            const { error: cleanupError } = await supabase.rpc('delete_user_and_data', { 
              p_user_id: pending.oldId 
            });
            if (cleanupError) {
              console.error('Cleanup error (non-fatal):', cleanupError);
            }

            localStorage.removeItem('pendingMigration');
            // Set user from merged
            setUser(mergedUser);
          } else {
            // Not a matching migration, clear pending
            localStorage.removeItem('pendingMigration');
          }
        } catch (err) {
          console.error('Migration error (retry next load):', err);
          // Keep pending for retry
        }
      }

      // Ensure user exists (handles creation or fetch)
        if (!user) {
        const dbUser = await ensureUserExists(session.user.id, localUser);
        setUser(dbUser);

        // Update localStorage — copy only known user fields (avoid referencing local-only settings like data_retention)
        const updatedLocalUser = {
          id: session.user.id,
          nickname: localUser.nickname ?? dbUser.nickname ?? 'Student',
          school_code: localUser.school_code ?? dbUser.school_code ?? 'RI',
          school_name: localUser.school_name ?? dbUser.school_name ?? 'Raffles Institution',
          level: localUser.level ?? dbUser.level ?? 'sec_4',
          opted_in_cohort: localUser.opted_in_cohort ?? dbUser.opted_in_cohort ?? true,
          avatar_seed: localUser.avatar_seed ?? dbUser.avatar_seed
        } as Partial<User> & { id: string };

        localStorage.setItem('outrankUser', JSON.stringify(updatedLocalUser));
      }

      const localSettingsStr = localStorage.getItem('outrankLocalSettings');
      const localSettings = localSettingsStr ? JSON.parse(localSettingsStr) : {
        twoFA: false,
        notifications: { email: true, push: true, inapp: true },
        share_school: true,
        share_national: true,
        data_retention: '1year'
      };

      setFormData({
        nickname: user?.nickname || '',
        school_code: user?.school_code || '',
        school_name: user?.school_name || '',
        level: user?.level || '',
        opted_in_cohort: user?.opted_in_cohort ?? true,
        twoFA: (localSettings as Partial<ProfileFormData>).twoFA as boolean || false,
        notifications: (localSettings as Partial<ProfileFormData>).notifications as ProfileFormData['notifications'] || { email: true, push: true, inapp: true },
        share_school: (localSettings as Partial<ProfileFormData>).share_school as boolean || true,
        share_national: (localSettings as Partial<ProfileFormData>).share_national as boolean || true,
        data_retention: (localSettings as Partial<ProfileFormData>).data_retention as string || '1year',
        sessions: formData.sessions
      });

    } catch (err) {
      console.error('Error loading profile data:', err);
      // Fallback: Use local data only
      const localUserStr = localStorage.getItem('outrankUser');
      if (localUserStr) {
        const fallbackUser: User = {
          id: 'fallback',
          nickname: JSON.parse(localUserStr).nickname || 'Student',
          school_code: JSON.parse(localUserStr).school_code || 'RI',
          school_name: JSON.parse(localUserStr).school_name || 'Raffles Institution',
          level: JSON.parse(localUserStr).level || 'sec_4',
          opted_in_cohort: true,
          avatar_seed: generateAvatarSeed(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        };
        setUser(fallbackUser);
        setFormData({
          ...formData,
          nickname: fallbackUser.nickname,
          school_code: fallbackUser.school_code,
          school_name: fallbackUser.school_name,
          level: fallbackUser.level,
          opted_in_cohort: fallbackUser.opted_in_cohort
        });
      }
    } finally {
      setLoading(false);
    }
  }, [formData.sessions, user]);  // Note: user in deps to refetch if needed, but careful with loops

  const loadStats = useCallback(async (): Promise<void> => {
    if (!user || !user.id || user.id === 'fallback') return;
    try {
      const { data: fetchedGrades } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', user.id)
        .order('assessment_date', { ascending: true });

      const currentGrades: Grade[] = fetchedGrades || [];

      if (currentGrades.length === 0) {
        setUserStats({
          overall_average: 0,
          total_grades: 0,
          subjects_count: 0,
          best_subject: null,
          best_subject_average: 0,
          most_improved_subject: null,
          improvement_amount: 0,
          consistency_score: 0.00
        });
        return;
      }

      const allPercentages = currentGrades.map(g => g.percentage);
      const overallAvg = allPercentages.reduce((sum, p) => sum + p, 0) / allPercentages.length;
      const totalGrades = currentGrades.length;

      const subjects: Record<string, { percentages: number[]; count: number }> = {};
      currentGrades.forEach(g => {
        if (!subjects[g.subject]) {
          subjects[g.subject] = { percentages: [], count: 0 };
        }
        subjects[g.subject].percentages.push(g.percentage);
        subjects[g.subject].count++;
      });

      const subjectsCount = Object.keys(subjects).length;

      let bestSubject: string | null = null, bestAvg = 0;
      let mostImproved: string | null = null, maxImp = 0;

      for (const sub in subjects) {
        const subPercentages = subjects[sub].percentages;
        const avg = subPercentages.reduce((s, v) => s + v, 0) / subPercentages.length;
        const subGrades = currentGrades.filter(g => g.subject === sub).sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime());
        const first = subGrades[0]?.percentage || 0;
        const last = subGrades[subGrades.length - 1]?.percentage || 0;
        const trendAmount = Math.abs(last - first);

        if (last > first && trendAmount > maxImp) {
          maxImp = trendAmount;
          mostImproved = sub;
        }

        if (avg > bestAvg) {
          bestAvg = avg;
          bestSubject = sub;
        }
      }

      const std = stdDev(allPercentages);
      const consistency = Math.max(0, Math.min(10, 10 - std * 0.2));

      setUserStats({
        overall_average: Math.round(overallAvg * 100) / 100,
        total_grades: totalGrades,
        subjects_count: subjectsCount,
        best_subject: bestSubject,
        best_subject_average: Math.round(bestAvg * 100) / 100,
        most_improved_subject: mostImproved,
        improvement_amount: Math.round(maxImp * 100) / 100,
        consistency_score: Math.round(consistency * 100) / 100,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      setUserStats({
        overall_average: 0,
        total_grades: 0,
        subjects_count: 0,
        best_subject: null,
        best_subject_average: 0,
        most_improved_subject: null,
        improvement_amount: 0,
        consistency_score: 0
      });
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const hasEmail = !!session?.user?.email;
      const isConfirmed = !!session?.user?.email_confirmed_at;
      const newAuthStatus = hasEmail && !isConfirmed ? 'pending' : isConfirmed ? 'verified' : 'anonymous';
      setAuthStatus(newAuthStatus);
      setUserEmail(session?.user?.email || '');
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        loadData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !loading) {
      loadStats();
    }
  }, [user, loading, loadStats]);

  useEffect(() => {
    if (isEditing && formData.level) {
      const availableSchools = getAvailableSchools(formData.level);
      const currentSchool = availableSchools.find(s => s.code === formData.school_code);
      if (!currentSchool && availableSchools.length > 0) {
        const firstSchool = availableSchools[0];
        setFormData(prev => ({
          ...prev,
          school_code: firstSchool.code,
          school_name: firstSchool.name
        }));
      }
    }
  }, [formData.level, isEditing, formData.school_code]);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nickname || formData.nickname.length < 2) {
      newErrors.nickname = 'Nickname must be at least 2 characters';
    }
    if (!formData.school_name || formData.school_name.length < 2) {
      newErrors.school_name = 'School is required';
    }
    if (!formData.school_code || formData.school_code.length < 2) {
      newErrors.school_code = 'School code is required';
    }
    if (!formData.level) {
      newErrors.level = 'Level is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveLocalSettings = useCallback((): void => {
    const local: Partial<ProfileFormData> = {
      twoFA: formData.twoFA,
      notifications: formData.notifications,
      share_school: formData.share_school,
      share_national: formData.share_national,
      data_retention: formData.data_retention
    };
    localStorage.setItem('outrankLocalSettings', JSON.stringify(local));
  }, [formData]);

  const handleSave = async (): Promise<void> => {
    if (!validateForm() || !user) return;

    setSaving(true);
    try {
      // Resolve unique nickname if changed
      let uniqueNickname = formData.nickname;
      if (formData.nickname !== user.nickname) {
        uniqueNickname = await generateUniqueNickname(formData.nickname, user.id);
      }

      // Only include User fields in updates
      const userUpdates: Partial<User> = {
        nickname: uniqueNickname,
        school_code: formData.school_code,
        school_name: formData.school_name,
        level: formData.level,
        opted_in_cohort: formData.opted_in_cohort,
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local outrankUser
      const currentLocalStr = localStorage.getItem('outrankUser') || '{}';
      const currentLocal = JSON.parse(currentLocalStr);
      const updatedLocalUser = {
        ...currentLocal,
        id: user.id,
        nickname: uniqueNickname,
        school_code: formData.school_code,
        school_name: formData.school_name,
        level: formData.level,
        opted_in_cohort: formData.opted_in_cohort,
        avatar_seed: user.avatar_seed // Preserve
      };
      localStorage.setItem('outrankUser', JSON.stringify(updatedLocalUser));

      setUser({ ...user, ...userUpdates });
      setIsEditing(false);
      setErrors({});
      saveLocalSettings();

      await loadStats();

    } catch (err) {
      console.error('Error saving profile:', err);
      setErrors({ general: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (): void => {
    if (!user) return;
    setFormData({
      nickname: user.nickname,
      school_code: user.school_code,
      school_name: user.school_name,
      level: user.level,
      opted_in_cohort: user.opted_in_cohort,
      twoFA: formData.twoFA,
      notifications: formData.notifications,
      share_school: formData.share_school,
      share_national: formData.share_national,
      data_retention: formData.data_retention,
      sessions: formData.sessions
    });
    setErrors({});
    setIsEditing(false);
    saveLocalSettings();
  };

  const handleAddGrade = async (submitFormData: AddGradeForm): Promise<void> => {
    if (!user || user.id === 'fallback') return;

    const scoreNum = parseFloat(submitFormData.score);
    const maxScoreNum = parseFloat(submitFormData.max_score);
    const percentage = (scoreNum / maxScoreNum) * 100;

    const newGrade: Omit<Grade, 'id'> = {
      user_id: user.id,
      subject: submitFormData.subject,
      assessment_name: submitFormData.assessment_name,
      score: scoreNum,
      max_score: maxScoreNum,
      assessment_date: submitFormData.assessment_date,
      percentage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
    await loadStats();
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone. All data will be permanently lost.')) return;
    try {
      if (user && user.id !== 'fallback') {
        await supabase.from('grades').delete().eq('user_id', user.id);
        await supabase.from('users').delete().eq('id', user.id);
      }
      await supabase.auth.signOut();
      localStorage.removeItem('outrankUser');
      localStorage.removeItem('outrankLocalSettings');
      router.push('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Error deleting account. Please try again.');
    }
  };

  const handleAuthOpen = (typ: typeof authType) => {
    setAuthType(typ);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    loadData();
  };

  const availableSchools = getAvailableSchools(formData.level || user?.level || 'sec_4');

  const hasChanges = JSON.stringify({
    nickname: formData.nickname,
    school_code: formData.school_code,
    school_name: formData.school_name,
    level: formData.level,
    opted_in_cohort: formData.opted_in_cohort
  }) !== JSON.stringify({
    nickname: user?.nickname,
    school_code: user?.school_code,
    school_name: user?.school_name,
    level: user?.level,
    opted_in_cohort: user?.opted_in_cohort
  });

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
              className="bg-slate-800 rounded-xl h-32 animate-pulse"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div 
              className="bg-slate-800 rounded-xl h-32 animate-pulse"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
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

  const avatarUrl = user?.avatar_seed ? `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${user.avatar_seed}` : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <Header user={user} isScrolled={isScrolled} />

      <div className="px-5 py-6 space-y-6 relative">
        {/* Avatar and Profile Display */}
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full border-4 border-slate-700 shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-lime-400 border-4 border-slate-700 shadow-2xl">
                {user?.nickname?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="text-center space-y-1">
            <h2 className={`font-bold ${isEditing ? '' : 'text-white text-2xl'}`}>
              {isEditing ? (
                <EditableInput
                  value={formData.nickname}
                  onChange={(val) => setFormData({ ...formData, nickname: val })}
                  placeholder="Enter nickname"
                  error={errors.nickname}
                  className="text-center text-2xl py-2 px-0 border-0 bg-transparent rounded-none focus:ring-0 focus:border-transparent text-white font-bold"
                />
              ) : (
                user?.nickname || 'Student'
              )}
              {authStatus === 'verified' ? (
                <ShieldCheck size={18} className="text-emerald-400 inline ml-2" />
              ) : authStatus === 'pending' ? (
                <ShieldOff size={18} className="text-amber-400 inline ml-2" />
              ) : (
                <ShieldOff size={18} className="text-gray-500 inline ml-2" />
              )}
            </h2>
            {user && (
              <div className="space-y-1">
                <p className="text-sm text-gray-300">
                  {isEditing ? (
                    <select
                      value={formData.school_code}
                      onChange={(e) => {
                        const selectedSchool = availableSchools.find(s => s.code === e.target.value);
                        if (selectedSchool) {
                          setFormData({
                            ...formData,
                            school_code: e.target.value,
                            school_name: selectedSchool.name
                          });
                        }
                      }}
                      className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-sm"
                    >
                      {availableSchools.map(s => (
                        <option key={s.code} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  ) : (
                    `${user.school_name} (${user.school_code})`
                  )}
                  {errors.school_code && <p className="text-red-400 text-xs mt-1">{errors.school_code}</p>}
                </p>
                <p className="text-sm text-gray-400">
                  {isEditing ? (
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-sm"
                    >
                      {levels.map(l => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    levels.find(l => l.value === user.level)?.label || 'N/A'
                  )}
                  {errors.level && <p className="text-red-400 text-xs mt-1">{errors.level}</p>}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        {userStats && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Overall Average"
              value={`${(userStats.overall_average || 0).toFixed(1)}%`}
              subtitle="Lifetime performance"
              icon={BarChart3}
              color="#10B981"
            />
            <StatCard
              title="Total Grades"
              value={userStats.total_grades || 0}
              subtitle="Assessments logged"
              icon={GraduationCap}
              color="#10B981"
            />
            <StatCard
              title="Subjects Covered"
              value={userStats.subjects_count || 0}
              subtitle="Unique subjects"
              icon={School}
              color="#10B981"
            />
            <StatCard
              title="Consistency"
              value={(userStats.consistency_score || 0).toFixed(1)}
              subtitle="Score /10"
              icon={ShieldCheck}
              color="#10B981"
            />
          </div>
        )}

        {/* Account Status Section */}
        <motion.div
          className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User size={20} className="mr-2 text-lime-400" />
            Account
          </h3>
          <div className="space-y-3">
            {authStatus === 'anonymous' && (
              <>
                <p className="text-gray-400 text-sm">Your data is stored locally. Create a verified account to sync across devices and contribute to rankings.</p>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    onClick={() => handleAuthOpen('create')}
                    className="flex-1 bg-lime-500/10 border border-lime-500/30 text-lime-400 hover:bg-lime-500/20 rounded-xl py-3 flex items-center justify-center gap-2 transition-all min-w-0"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Key size={16} />
                    Create
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => handleAuthOpen('signin')}
                    className="flex-1 bg-slate-700/50 border border-slate-700 text-gray-300 hover:bg-slate-700 rounded-xl py-3 flex items-center justify-center gap-2 transition-all min-w-0"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail size={16} />
                    Sign In
                  </motion.button>
                </div>
              </>
            )}
            {authStatus === 'pending' && (
              <>
                <p className="text-amber-400 flex items-center gap-1 mb-2">
                  <ShieldOff size={16} />
                  Verification Required
                </p>
                <p className="text-gray-400 text-sm mb-3">Your account is created but not verified. Complete email verification to access full features.</p>
                <motion.button
                  type="button"
                  onClick={() => handleAuthOpen('confirm')}
                  className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail size={16} />
                  Resend Verification Email
                </motion.button>
              </>
            )}
            {authStatus === 'verified' && userEmail && (
              <div className="space-y-2">
                <p className="text-white font-mono text-sm break-all">{userEmail}</p>
                <p className="text-gray-400 text-xs">Account fully verified. Secure and synced.</p>
                <motion.button
                  type="button"
                  onClick={() => handleAuthOpen('change')}
                  className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <Lock size={16} />
                  Change Password
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Privacy Settings - Always visible, editable only in edit mode */}
        <motion.div
          className="bg-slate-800 rounded-2xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ShieldCheck size={20} className="mr-2 text-lime-400" />
            Privacy Settings
          </h3>
          <div className="space-y-4">
            <ToggleSwitch
              checked={formData.opted_in_cohort}
              onChange={(val) => setFormData({ ...formData, opted_in_cohort: val })}
              label={
                <span>
                  Share anonymized data for rankings and insights
                  <span className="text-xs block text-gray-500 mt-1">
                    {formData.opted_in_cohort ? 'Your data helps improve cohort comparisons' : 'Opt-in to contribute to national rankings'}
                  </span>
                </span>
              }
            />
            {isEditing && (
              <div className="space-y-4 pt-4 border-t border-slate-700">
                <ToggleSwitch
                  checked={formData.share_school}
                  onChange={(val) => setFormData({ ...formData, share_school: val })}
                  label={
                    <span>
                      Share with School Cohort
                      <span className="text-xs block text-gray-500 mt-1">Visible only to peers in your school</span>
                    </span>
                  }
                />
                <ToggleSwitch
                  checked={formData.share_national}
                  onChange={(val) => setFormData({ ...formData, share_national: val })}
                  label={
                    <span>
                      Share with National Rankings
                      <span className="text-xs block text-gray-500 mt-1">Contribute to country-wide benchmarks</span>
                    </span>
                  }
                />
                <div>
                  <label className="block text-gray-400 text-sm mb-2 font-medium">Data Retention Period</label>
                  <select
                    value={formData.data_retention}
                    onChange={(e) => setFormData({ ...formData, data_retention: e.target.value })}
                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                  >
                    <option value="3months">3 Months</option>
                    <option value="1year">1 Year</option>
                    <option value="permanent">Permanent</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">How long your anonymized data is kept for analysis</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Edit and Delete Buttons - Moved to bottom of content */}
        <div className="space-y-4 pt-6 border-t border-slate-700">
<motion.button
  type="button"
  onClick={isEditing ? handleCancel : () => setIsEditing(true)}
  className="w-full bg-lime-500/10 border border-lime-500/30 text-lime-400 hover:bg-lime-500/20 rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
  whileTap={{ scale: 0.98 }}
>
  <Edit3 size={20} />
  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
</motion.button>
          {isEditing && (
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`w-full rounded-xl py-4 text-base font-bold shadow-xl transition-all ${
                !hasChanges || saving
                  ? 'bg-slate-700 text-gray-400 cursor-not-allowed'
                  : 'bg-lime-400 text-black hover:bg-lime-300'
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl py-4 flex items-center justify-center gap-2 transition-all"
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 size={20} />
            Delete Account
          </motion.button>
        </div>
      </div>

      <AddGradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddGrade}
        subjects={Object.keys(SUBJECT_EMOJIS)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type={authType}
        email={userEmail}
        onSuccess={handleAuthSuccess}
      />

      {/* Verification Animation */}
      <AnimatePresence>
        {showVerificationAnimation && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVerificationAnimation(false)}
          >
            <motion.div
              className="bg-slate-900 rounded-2xl p-8 flex flex-col items-center max-w-sm mx-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ShieldCheck size={64} className="text-emerald-400 mb-4" />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white text-center mb-4"
              >
                Account Verified!
              </motion.p>
              <p className="text-gray-400 text-sm text-center mb-6">
                Your account is now fully activated and synced across devices.
              </p>
              <motion.button
                onClick={() => setShowVerificationAnimation(false)}
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                Awesome!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 grid grid-cols-5 place-items-center py-3 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.button 
          type="button"
          className="flex flex-col items-center text-xs font-medium text-gray-400" 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/dashboard')}
        >
          <BarChart3 size={24} className="mb-1" />
          <span>Dashboard</span>
        </motion.button>
        <motion.button 
          type="button"
          className="flex flex-col items-center text-xs font-medium text-gray-400" 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/rankings')}
        >
          <Trophy size={24} className="mb-1" />
          <span>Rankings</span>
        </motion.button>
        <motion.button 
          type="button"
          className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center -mt-8 shadow-2xl border-4 border-slate-900 col-span-1" 
          onClick={() => setIsModalOpen(true)}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          <Plus size={28} className="text-black" />
        </motion.button>
        <motion.button 
          type="button"
          className="flex flex-col items-center text-xs font-medium text-gray-400" 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/history')}
        >
          <Calendar size={24} className="mb-1" />
          <span>History</span>
        </motion.button>
        <motion.button 
          type="button"
          className="flex flex-col items-center text-xs font-medium text-lime-400" 
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
      `}</style>
    </div>
  );
};

export default Profile;