"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Users, TrendingUp, TrendingDown, BarChart3, Calendar, Sparkles, Crown, ArrowUpRight, Shield, X, Filter, Search, Plus, Share2, Trophy, UserCheck, Zap, BookOpen, Clock, Activity, FileText, Settings, Book, BarChart2, Users2, Home, Award, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Edit2, Trash2, User, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility functions
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getOrdinal = (n: number): string => {
  if (n < 1) return '1st';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
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
const TERM_END_DATES = {
  1: '03-31', // March 31
  2: '06-30', // June 30
  3: '09-30', // September 30
  4: '12-31'  // December 31
} as const;

// Toast utility
interface Toast {
  id: number;
  message: string;
  type?: 'success' | 'error' | 'info';
}

const Toast: React.FC<{ toast: Toast; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const bgColor = toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-lime-500';

  return (
    <motion.div
      className={`flex items-center gap-3 p-4 rounded-xl shadow-xl border border-slate-700/50 ${bgColor} text-white max-w-sm`}
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className={`w-4 h-4 rounded-full ${toast.type === 'success' ? 'bg-white/20' : toast.type === 'error' ? 'bg-white/20' : 'bg-white/20'}`} />
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="p-1 hover:opacity-70">
        <X size={16} className="text-white/70" />
      </button>
    </motion.div>
  );
};

// Interfaces
interface User {
  id: string;
  nickname?: string;
  school_code: string;
  school_name: string;
  level: string;
  opted_in_cohort?: boolean;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  invite_code: string;
  member_count: number;
  average_overall: number | null;
  created_at: string;
}

interface GroupMember {
  user_id: string;
  nickname: string;
  role: 'admin' | 'member';
  joined_at: string;
  percentile: number;
  rank: number;
  avg_score?: number;
}

interface GroupStats {
  average_overall: number;
  top_performer_percentile: number;
  most_improved: number;
  consistency_avg: number;
  subjects_breakdown: Array<{ subject: string; avg: number; top_member: string }>;
  trends: Array<{ period: string; change: number }>;
  vs_school_avg: number;
  vs_school_difference: number;
  total_grades: number;
  active_members: number;
}

interface Grade {
  id: string;
  user_id: string;
  subject: string;
  assessment_name: string;
  score: number;
  max_score: number;
  percentage: number;
  assessment_date: string;
}

interface HeaderProps {
  group: Group | null;
  isScrolled?: boolean;
  onBack?: () => void;
  userRole?: 'admin' | 'member' | null;
  onSettings?: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  progress?: number;
  onTap: () => void;
  color?: string;
  trend?: 'up' | 'down' | null;
}

interface MemberRankingItemProps {
  member: GroupMember;
  index: number;
  isUser: boolean;
  onTap: (member: GroupMember) => void;
}

interface SubjectBreakdownItemProps {
  subject: { subject: string; avg: number; top_member: string };
  index: number;
  onTap: (subject: string) => void;
}

interface TrendsItemProps {
  trend: { period: string; change: number };
  index: number;
}

interface TabToggleProps {
  activeTab: 'overview' | 'members' | 'subjects';
  onTabChange: (tab: 'overview' | 'members' | 'subjects') => void;
}

interface SubjectModalProps {
  subject: string;
  subjectMembers: GroupMember[];
  onClose: () => void;
  loading: boolean;
  userId: string;
}

interface SettingsModalProps {
  group: Group;
  userRole: 'admin';
  members: GroupMember[];
  onClose: () => void;
  onDelete: () => void;
  onEdit: (name: string, description: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  groupId: string;
  userId: string;
  onRemove: (userId: string) => void; // <-- ADD THIS
}

interface ManageMembersModalProps {
  members: GroupMember[];
  userId: string;
  groupId: string;
  onClose: () => void;
  onRemove: (userId: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
}

interface EditGroupModalProps {
  group: Group;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
}

// Tab Toggle Component
const TabToggle: React.FC<TabToggleProps> = ({ activeTab, onTabChange }) => (
  <div className="flex border-b border-slate-700 px-4 mb-4 bg-slate-900/50">
{[
  { key: 'overview' as const, icon: Home, label: 'Overview' },
  { key: 'members' as const, icon: Users2, label: 'Members' },
  { key: 'subjects' as const, icon: Book, label: 'Subjects' }
].map(({ key, icon: Icon, label }) => (
      <motion.button
        key={key}
        onClick={() => onTabChange(key)}
        className={`flex-1 py-4 px-3 border-b-2 flex-row flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
          activeTab === key
            ? 'border-lime-400 text-lime-400'
            : 'border-transparent text-gray-400 hover:text-white'
        }`}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className="hidden" size={18} />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{label}</span>
      </motion.button>
    ))}
  </div>
);

// Header Component
const Header: React.FC<HeaderProps> = ({ group, isScrolled = false, onBack, userRole, onSettings }) => (
  <motion.div 
    className={`sticky top-0 bg-slate-900/95 backdrop-blur-xl z-50 px-4 transition-all duration-300 ease-out border-b border-slate-800 ${isScrolled ? 'py-2' : 'pt-4 pb-3'}`}
    initial={false}
    animate={{ opacity: isScrolled ? 0.98 : 1 }}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <motion.button
          onClick={onBack}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 flex-shrink-0"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={20} />
        </motion.button>
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {!isScrolled && (
              <motion.p 
                className="text-gray-400 text-xs uppercase tracking-wide mb-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                Group
              </motion.p>
            )}
          </AnimatePresence>
          <motion.h1 
            className="font-bold bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 bg-clip-text text-transparent text-xl truncate"
            animate={{ fontSize: isScrolled ? '16px' : '20px' }}
            transition={{ duration: 0.3 }}
          >
            {group?.name || 'Group'}
          </motion.h1>
        </div>
      </div>
      {userRole === 'admin' && (
        <motion.button
          onClick={onSettings}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 flex-shrink-0"
          whileTap={{ scale: 0.9 }}
        >
          <Settings size={20} />
        </motion.button>
      )}
    </div>
    {group?.description && (
      <p className="text-gray-400 text-xs line-clamp-2">{group.description}</p>
    )}
  </motion.div>
);

// StatCard
const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, progress, onTap, color = '#A855F7', trend = null }) => (
  <motion.div
    className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden shadow-lg cursor-pointer"
    onClick={onTap}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.3)' }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: color, opacity: 0.5 }} />
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-gray-400 text-xs uppercase tracking-wide font-medium flex items-center">
        {title} 
        <ArrowUpRight size={12} className="ml-1 opacity-50" />
      </h4>
      {icon && <div className="flex-shrink-0" style={{ color }}>{icon}</div>}
    </div>
    <p className="text-xs text-gray-500 mb-1">Group Performance</p>
    <motion.p 
      className="text-xl font-bold text-white mb-1"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: "spring" }}
    >
      {value}
    </motion.p>
    {subtitle && <p className="text-xs text-gray-400 mb-2">{subtitle}</p>}
    {progress !== undefined && (
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ backgroundColor: color }}
        />
      </div>
    )}
    {trend && (
      <div className="flex items-center gap-1">
        {trend === 'up' ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-red-400" />}
        <p className="text-xs text-gray-500">Trending {trend}</p>
      </div>
    )}
  </motion.div>
);

// Minimalistic MemberRankingItem
const MemberRankingItem: React.FC<MemberRankingItemProps> = ({ member, index, isUser, onTap }) => (
  <motion.div
    className={`p-3 border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30 transition-all duration-200 ${isUser ? 'bg-lime-900/20 border-l-4 border-lime-400' : ''}`}
    onClick={() => onTap(member)}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={{ backgroundColor: isUser ? 'rgba(190, 242, 100, 0.15)' : 'rgba(75, 85, 99, 0.1)' }}
    whileTap={{ scale: 0.99 }}
    role="button"
    tabIndex={0}
    aria-label={`View ${member.nickname}'s profile`}
  >
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg flex-shrink-0 ${isUser ? 'bg-transparent text-white border-2 border-none' : 'bg-slate-700 text-gray-300 border border-slate-600'}`}>
          {getOrdinal(member.rank)}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`w-8 h-8 bg-gradient-to-br from-lime-400 via-lime-500 to-lime-600 rounded-full flex items-center justify-center text-black font-bold text-xs shadow-xl flex-shrink-0 ${isUser ? 'ring-2 ring-lime-400/30' : ''}`}>
            {member.nickname?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold truncate text-sm ${isUser ? 'text-lime-300' : 'text-white'}`}>
              {member.nickname}
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 overflow-hidden">
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {member.role === 'admin' ? <Crown size={8} className="text-yellow-400" /> : <UserCheck size={8} className="text-gray-400" />}
                <span className="capitalize">{member.role}</span>
              </div>
              <span className="w-0.5 h-0.5 bg-gray-400 rounded-full mx-1 flex-shrink-0" />
              <span className="truncate">{formatDate(member.joined_at)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex flex-row items-end gap-0.5">
          <p className={`font-bold text-xs ${isUser ? 'text-lime-400' : 'text-white'}`}>
            {Math.max(0, Math.min(100, member.percentile)).toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500">Pctl</p>
          </div>
          {member.avg_score !== undefined && (
            <div className="flex flex-row items-end gap-0.5">
              <p className={`font-bold text-xs ${isUser ? 'text-lime-400' : 'text-emerald-400'}`}>
                {Math.max(0, Math.min(100, member.avg_score)).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Avg</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

// SubjectBreakdownItem
const SubjectBreakdownItem: React.FC<SubjectBreakdownItemProps> = ({ subject, index, onTap }) => (
  <motion.div
    className="p-5 border-b border-slate-800 last:border-b-0 cursor-pointer hover:bg-slate-800/30 transition-all duration-200"
    onClick={() => onTap(subject.subject)}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={{ backgroundColor: 'rgba(190, 242, 100, 0.08)' }}
    whileTap={{ scale: 0.99 }}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 bg-transparent rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-2xl">{SUBJECT_EMOJIS[subject.subject] || '📚'}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white text-base truncate mb-1">
            {subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1)}
          </p>
          <p className="text-xs text-gray-300 truncate">Top: {subject.top_member}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-2xl text-emerald-400">{Math.max(0, Math.min(100, subject.avg)).toFixed(1)}%</p>
        <p className="text-xs text-gray-500 mt-1">Group Avg</p>
      </div>
    </div>
  </motion.div>
);

// TrendsItem
const TrendsItem: React.FC<TrendsItemProps> = ({ trend, index }) => {
  const isUp = trend.change >= 0;
  return (
    <motion.div
      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Clock size={16} className="text-gray-400" />
        </div>
        <p className="font-semibold text-white truncate">{trend.period}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-lg ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend.change.toFixed(1)}%
        </p>
        <p className="flex items-center justify-end gap-1 mt-1 text-xs text-gray-500">
          {isUp ? <TrendingUpIcon size={12} className="text-emerald-400" /> : <TrendingDownIcon size={12} className="text-red-400" />}
          Change
        </p>
      </div>
    </motion.div>
  );
};

// EmptyGroupState
const EmptyGroupState: React.FC = () => (
  <motion.div 
    className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-900/50 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    <div className="text-6xl mb-4">👥</div>
    <h3 className="text-2xl font-bold text-white mb-3">No Rankings Yet</h3>
    <p className="text-gray-400 mb-8 max-w-sm text-sm leading-relaxed">
      Add grades to unlock group comparisons. Progress will appear here as everyone contributes.
    </p>
    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
      <motion.div 
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col items-center gap-2 backdrop-blur-sm"
        whileHover={{ scale: 1.02 }}
      >
        <Trophy size={24} className="text-lime-400" />
        <p className="text-sm font-semibold text-white">Live Rankings</p>
        <p className="text-xs text-gray-500 text-center">Updates in real-time</p>
      </motion.div>
      <motion.div 
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col items-center gap-2 backdrop-blur-sm"
        whileHover={{ scale: 1.02 }}
      >
        <Shield size={24} className="text-lime-400" />
        <p className="text-sm font-semibold text-white">Private</p>
        <p className="text-xs text-gray-500 text-center">Invite-only access</p>
      </motion.div>
    </div>
  </motion.div>
);

// Vertical Subject Detail Modal
const SubjectModal: React.FC<SubjectModalProps> = ({ subject, subjectMembers, onClose, loading, userId }) => {
  const userMember = subjectMembers.find(m => m.user_id === userId);
  const userAvg = userMember?.avg_score || 0;
  const takingCount = subjectMembers.filter(m => (m.avg_score || 0) > 0).length;
  const groupAvg = takingCount > 0 ? subjectMembers.reduce((sum, m) => sum + (m.avg_score || 0), 0) / takingCount : 0;
  const topScore = Math.max(...subjectMembers.map(m => m.avg_score || 0));
  const sortedTop = [...subjectMembers].sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0)).slice(0, 5);
  const chartData = subjectMembers
    .filter(m => (m.avg_score || 0) > 0)
    .slice(0, 10)
    .map((m, i) => ({ name: m.nickname, score: m.avg_score || 0, fill: ['#A855F7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899', '#14B8A6', '#6366F1'][i % 10] }));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-900 rounded-t-3xl w-full max-h-[95vh] overflow-hidden flex flex-col border-t border-slate-700 shadow-2xl relative"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 pb-0">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.button onClick={onClose} className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50" whileTap={{ scale: 0.9 }}>
                  <ChevronLeft size={20} />
                </motion.button>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{SUBJECT_EMOJIS[subject] || '📚'}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{subject.charAt(0).toUpperCase() + subject.slice(1)}</h2>
                    <p className="text-sm text-gray-400">{subjectMembers.length} members • Avg: {groupAvg.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 pt-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-gray-400 text-sm">Loading details...</p>
              </div>
            ) : subjectMembers.length > 0 ? (
              <>
                {/* Key Stats - Vertical */}
                <div className="space-y-3">
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50 mt-7">
                    <p className="text-3xl font-bold text-emerald-400">{topScore.toFixed(1)}%</p>
                    <p className="text-xs text-gray-400 mt-1">Top Score</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                    <p className="text-3xl font-bold text-lime-400">{groupAvg.toFixed(1)}%</p>
                    <p className="text-xs text-gray-400 mt-1">Group Average</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                    <p className="text-3xl font-bold text-blue-400">{takingCount}</p>
                    <p className="text-xs text-gray-400 mt-1">Taking This</p>
                  </div>
                  {userAvg > 0 && (
                    <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
                      <p className="text-3xl font-bold text-lime-400">{userAvg.toFixed(1)}%</p>
                      <p className="text-xs text-gray-400 mt-1">Your Score</p>
                    </div>
                  )}
                </div>

                {/* Bar Chart */}
                {chartData.length > 0 && (
                  <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 size={20} /> Top 10 Performers
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '12px' }} />
                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Participation Pie */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users size={20} /> Participation
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        data={[
                          { name: 'Taking', value: takingCount, fill: '#10B981' },
                          { name: 'Not Taking', value: subjectMembers.length - takingCount, fill: '#475569' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        label={(props: { name?: string; percent?: number }) =>
                        `${props.name ?? ''} ${Math.round((props.percent ?? 0) * 100)}%`
                        }
                        labelLine={false}
                      >
                        <PieCell fill="#10B981" />
                        <PieCell fill="#475569" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Performers */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Top Performers</h4>
                  <div className="space-y-2">
                    {sortedTop.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <span className="text-white truncate flex-1">{m.nickname}</span>
                        <span className="text-emerald-400 font-medium">{(m.avg_score || 0).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Rankings */}
                <div className="divide-y divide-slate-800/50 mb-7">
                  <h3 className="text-lg font-semibold text-white pb-3 flex items-center gap-2">
                    <Trophy size={20} /> Full Rankings
                  </h3>
                  {subjectMembers.map((member, index) => (
                    <MemberRankingItem
                      key={member.user_id}
                      member={member}
                      index={index}
                      isUser={member.user_id === userId}
                      onTap={() => {}}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <BookOpen size={64} className="mx-auto mb-6 opacity-30" />
                <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
                <p className="text-center max-w-md">No grades added for {subject.charAt(0).toUpperCase() + subject.slice(1)} yet. Start the competition!</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced Edit Group Modal
const EditGroupModal: React.FC<EditGroupModalProps> = ({ group, onClose, onSave, addToast }) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onSave(name, description);
      addToast('Group updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update group. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-900 rounded-t-3xl w-full max-h-[80vh] overflow-hidden flex flex-col border-t border-slate-700 shadow-2xl relative"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 pb-0">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit2 size={20} className="text-lime-400" />
                <h2 className="text-xl font-bold text-white">Edit Group</h2>
              </div>
              <motion.button onClick={onClose} className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50" whileTap={{ scale: 0.9 }}>
                <X size={20} />
              </motion.button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <User size={16} className="text-lime-400" />
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all"
                placeholder="Enter group name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FileText size={16} className="text-lime-400" />
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all resize-none"
                placeholder="Describe your study group..."
                rows={4}
              />
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600 disabled:opacity-50 rounded-xl py-4 text-black font-bold shadow-xl flex items-center justify-center gap-2 transition-all text-base"
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <CheckCircle size={20} />
              )}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced Manage Members Modal
const ManageMembersModal: React.FC<ManageMembersModalProps> = ({ members, userId, groupId, onClose, onRemove, addToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredMembers = members.filter(m => 
    m.nickname.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemove = async (targetUserId: string) => {
    if (targetUserId === userId) {
      addToast('Cannot remove yourself from the group.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', targetUserId);
      if (error) throw error;
      onRemove(targetUserId);
      addToast('Member removed successfully.', 'success');
    } catch (err) {
      addToast('Failed to remove member. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-900 rounded-t-3xl w-full max-h-[80vh] overflow-hidden flex flex-col border-t border-slate-700 shadow-2xl relative"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 pb-0">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-lime-400" />
                <h2 className="text-xl font-bold text-white">Manage Members ({members.length})</h2>
              </div>
              <motion.button onClick={onClose} className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50" whileTap={{ scale: 0.9 }}>
                <X size={20} />
              </motion.button>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 bg-slate-900/50 pt-0">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3 pt-0">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <motion.div
                    key={member.user_id}
                    className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-700/30"
                    whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.2)' }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                        {member.nickname[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate">{member.nickname}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {member.role === 'admin' ? <Crown size={10} className="text-yellow-400" /> : <UserCheck size={10} className="text-gray-400" />}
                          {member.role} • Joined {formatDate(member.joined_at)}
                        </p>
                      </div>
                    </div>
                    {member.user_id !== userId && member.role !== 'admin' && (
                      <motion.button
                        onClick={() => handleRemove(member.user_id)}
                        disabled={isSubmitting}
                        className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 flex-shrink-0"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-center text-sm">No members found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Enhanced Settings Modal
const SettingsModal: React.FC<SettingsModalProps> = ({ group, userRole, members, onClose, onDelete, onEdit, addToast, groupId, userId, onRemove }) => {

  const [showEdit, setShowEdit] = useState(false);
  const [showManage, setShowManage] = useState(false);

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(group.invite_code);
      addToast('Invite code copied to clipboard!', 'success');
    } catch (err) {
      addToast('Failed to copy invite code.', 'error');
    }
  };

return (
  <>
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 p-4 sm:p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl relative"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 pb-4 border-b border-slate-800">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 bg-slate-600 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-lime-400" />
                <h2 className="text-xl font-bold text-white">Group Settings</h2>
              </div>
              <motion.button 
                onClick={onClose} 
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors" 
                whileTap={{ scale: 0.95 }}
                aria-label="Close settings"
              >
                <X size={20} className="text-slate-400" />
              </motion.button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Invite Code Card */}
            <motion.div 
              className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50"
              whileHover={{ backgroundColor: 'rgba(31, 41, 55, 0.7)' }}
              transition={{ duration: 0.15 }}
            >
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-4">
                <Share2 size={18} className="text-lime-400" />
                Invite Code
              </h3>
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <input
                  type="text"
                  value={group.invite_code}
                  readOnly
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-600 rounded-lg px-3 sm:px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                />
                <motion.button
                  onClick={handleCopyInvite}
                  className="flex-shrink-0 p-2.5 sm:p-3 bg-lime-500 hover:bg-lime-600 rounded-lg text-black font-medium transition-all shadow-md"
                  whileTap={{ scale: 0.98 }}
                  aria-label="Copy invite code"
                >
                  <Copy size={14} className="sm:size-16" />
                </motion.button>
              </div>
              <p className="text-xs text-gray-500">Share this code to invite friends to join.</p>
            </motion.div>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                className="w-full bg-lime-500 hover:bg-lime-600 rounded-xl py-4 text-black font-medium flex items-center justify-center gap-3 transition-all border border-lime-400/30 shadow-lg"
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEdit(true)}
              >
                <Edit2 size={18} />
                Edit Group Details
              </motion.button>
              <motion.button
                className="w-full bg-slate-700 hover:bg-slate-600 rounded-xl py-4 text-white font-medium flex items-center justify-center gap-3 transition-all border border-slate-600/30"
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowManage(true)}
              >
                <Users size={18} />
                Manage Members ({members.length})
              </motion.button>
              <motion.button
                className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-4 text-white font-medium flex items-center justify-center gap-3 transition-all border border-red-600/30"
                whileTap={{ scale: 0.98 }}
                onClick={onDelete}
              >
                <Trash2 size={18} />
                Delete Group
              </motion.button>
            </div>

            {/* Group Info */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <Shield size={16} className="text-lime-400" />
                Group Info
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-400 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-500" />
                  Created: {formatDate(group.created_at)}
                </p>
                <p className="text-gray-400 flex items-center gap-2">
                  <Users size={14} className="text-slate-500" />
                  Members: {group.member_count}
                </p>
                <p className="text-gray-400 flex items-center gap-2">
                  <UserCheck size={14} className="text-lime-400" />
                  Admin: You
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>

    {showEdit && (
      <EditGroupModal
        group={group}
        onClose={() => setShowEdit(false)}
        onSave={onEdit}
        addToast={addToast}
      />
    )}

    {showManage && (
      <ManageMembersModal
        members={members}
        userId={userId}
        groupId={groupId}
        onClose={() => setShowManage(false)}
        onRemove={onRemove}
        addToast={addToast}
      />
    )}
  </>
);

};

// Main Component
const GroupRankings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [groupGrades, setGroupGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isUserMember, setIsUserMember] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'subjects'>('overview');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjectMembers, setSubjectMembers] = useState<GroupMember[]>([]);
  const [subjectLoading, setSubjectLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('id');

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const newToast: Toast = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const computeTermTrends = useCallback((grades: Grade[]): { period: string; change: number }[] => {
    if (!grades || grades.length === 0) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth() + 1;
    let currentTerm = 4;
    if (month <= 3) currentTerm = 1;
    else if (month <= 6) currentTerm = 2;
    else if (month <= 9) currentTerm = 3;
    else currentTerm = 4;

    const prevTerm = currentTerm - 1 || 4;
    const prevYear = prevTerm === 4 ? currentYear - 1 : currentYear;

    const getTermStart = (year: number, term: number): Date => {
      const starts = {
        1: '01-01',
        2: '04-01',
        3: '07-01',
        4: '10-01'
      };
      return new Date(`${year}-${starts[term as 1|2|3|4]}`);
    };

    const currentTermStart = getTermStart(currentYear, currentTerm);
    const prevTermStart = getTermStart(prevYear, prevTerm);

    const currentGrades = grades.filter(g => {
      const date = new Date(g.assessment_date);
      return date >= currentTermStart && date <= now;
    });

    const prevGrades = grades.filter(g => {
      const date = new Date(g.assessment_date);
      return date >= prevTermStart && date < currentTermStart;
    });

    const trends: { period: string; change: number }[] = [];
    if (currentGrades.length > 0 && prevGrades.length > 0) {
const currentAvg = currentGrades.reduce((sum: number, g: Grade) => sum + g.percentage, 0) / currentGrades.length;
const prevAvg = prevGrades.reduce((sum: number, g: Grade) => sum + g.percentage, 0) / prevGrades.length;
      const change = currentAvg - prevAvg;
      trends.push({ period: `Term ${currentTerm} vs Term ${prevTerm}`, change });
    }

    return trends;
  }, []);

  const refetchData = useCallback(async (currentUser: User, groupId: string): Promise<void> => {
    if (!currentUser || !groupId) return;

    try {
      // Fetch group basic info
      const { data: groupData, error: groupError } = await supabase
        .rpc('get_user_groups', { p_user_id: currentUser.id });
      if (groupError) throw groupError;
      const targetGroup = groupData?.find((g: { id: string; }) => g.id === groupId);
      if (!targetGroup) {
        router.push('/rankings');
        return;
      }
      setGroup(targetGroup);

      // Fetch comprehensive stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_group_comprehensive_stats', { p_group_id: groupId });
      if (statsError) throw statsError;
      if (statsData && statsData.length > 0) {
        const rawStats = statsData[0];
        const clampedStats: GroupStats = {
          ...rawStats,
          average_overall: Math.max(0, Math.min(100, rawStats.average_overall || 0)),
          top_performer_percentile: Math.max(0, Math.min(100, rawStats.top_performer_percentile || 0)),
          most_improved: Math.max(-100, Math.min(100, rawStats.most_improved || 0)),
          consistency_avg: Math.max(0, Math.min(10, rawStats.consistency_avg || 0)),
          vs_school_difference: Math.max(-100, Math.min(100, rawStats.vs_school_difference || 0)),
subjects_breakdown: (rawStats.subjects_breakdown || []).map((s: { subject: string; avg: number | undefined; top_member: string }) => ({
  ...s,
  avg: Math.max(0, Math.min(100, s.avg || 0))
})),
trends: (rawStats.trends || []).map((t: { period: string; change: number | undefined }) => ({
  ...t,
  change: Math.max(-100, Math.min(100, t.change || 0))
})),
          vs_school_avg: Math.max(0, Math.min(100, rawStats.vs_school_avg || 0)),
          total_grades: rawStats.total_grades || 0,
          active_members: rawStats.active_members || 0
        };
        setStats(clampedStats);
      } else {
        setStats({
          average_overall: 0,
          top_performer_percentile: 0,
          most_improved: 0,
          consistency_avg: 0,
          subjects_breakdown: [],
          trends: [],
          vs_school_avg: 0,
          vs_school_difference: 0,
          total_grades: 0,
          active_members: 0
        });
      }

      // Fetch member rankings
      const { data: membersData, error: membersError } = await supabase
        .rpc('get_group_rankings', { p_group_id: groupId });
      if (membersError) throw membersError;
      if (membersData) {
const clampedMembers = membersData?.map((m: { percentile: number; avg_score: number; } & typeof membersData[0]) => ({
  ...m,
  percentile: Math.max(0, Math.min(100, m.percentile || 0)),
  avg_score: Math.max(0, Math.min(100, m.avg_score || 0))
})) || [];
        setMembers(clampedMembers);
        const userMember = clampedMembers.find((m: { user_id: string; }) => m.user_id === currentUser.id);
        setUserRole(userMember?.role || null);
      }

      // Fetch group grades for term trends
      const userIds = members.map(m => m.user_id);
      if (userIds.length > 0) {
        const { data: gradesData, error: gradesError } = await supabase
          .from('grades')
          .select('id, user_id, subject, assessment_name, score, max_score, percentage, assessment_date')
          .in('user_id', userIds);
        if (gradesError) {
          console.warn('Failed to fetch group grades for trends:', gradesError);
        } else {
          setGroupGrades(gradesData || []);
        }
      }

      // Check if user is member
      const { data: memberCheck, error: memberCheckError } = await supabase.rpc('is_group_member', {
        p_user_id: currentUser.id,
        p_group_id: groupId
      });
      if (memberCheckError) throw memberCheckError;
      setIsUserMember(!!memberCheck);

    } catch (err) {
      console.error('Error fetching group data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load group data');
      addToast('Failed to load group data. Please refresh.', 'error');
    } finally {
      setLoading(false);
    }
  }, [router, addToast]);

  // Override trends with term-based computation
  useEffect(() => {
    if (groupGrades.length > 0 && stats) {
      const newTrends = computeTermTrends(groupGrades);
      setStats(prev => prev ? { ...prev, trends: newTrends } : prev);
    }
  }, [groupGrades, stats, computeTermTrends]);

  // Fetch subject rankings
  const fetchSubjectRankings = useCallback(async (subject: string) => {
    if (!groupId || !subject) return;
    setSubjectLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_group_subject_rankings', {
        p_group_id: groupId,
        p_subject: subject
      });
      if (error) throw error;
      if (data) {
const clamped = data.map((m: { percentile: number; avg_score: number; }) => ({
  ...m,
  percentile: Math.max(0, Math.min(100, m.percentile || 0)),
  avg_score: Math.max(0, Math.min(100, m.avg_score || 0))
}));
        setSubjectMembers(clamped);
      }
    } catch (err) {
      console.error('Error fetching subject rankings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subject rankings');
      addToast('Failed to load subject rankings.', 'error');
    } finally {
      setSubjectLoading(false);
    }
  }, [groupId, addToast]);

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectRankings(selectedSubject);
    } else {
      setSubjectMembers([]);
    }
  }, [selectedSubject, fetchSubjectRankings]);

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setError(null);
        const sessionResp = await supabase.auth.getSession();
        let session = sessionResp.data.session;

        if (!session) {
          const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
          if (anonError) throw anonError;
          session = anonData?.session ?? null;
        }

        if (!session || !groupId) {
          router.push('/rankings');
          return;
        }

        // Fetch or upsert user
        const localUserStr = localStorage.getItem('outrankUser');
        let localUser: Partial<User> = {};
        if (localUserStr) {
          try {
            localUser = JSON.parse(localUserStr) as Partial<User>;
          } catch {}
        }
        localUser = {
          ...localUser,
          nickname: localUser.nickname || `Student_${Math.random().toString(36).slice(2, 7)}`,
          school_code: localUser.school_code || 'RI',
          school_name: localUser.school_name || 'Raffles Institution',
          level: localUser.level || 'sec_4'
        };

        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (userError && userError.code !== 'PGRST116') throw userError;

let dbUser: User;

        if (!existingUser) {
dbUser = {
  id: session.user.id,
  nickname: localUser.nickname || `Student_${Math.random().toString(36).slice(2, 7)}`,
  school_code: (localUser.school_code as string) || 'RI',
  school_name: (localUser.school_name as string) || 'Raffles Institution',
  level: (localUser.level as string) || 'sec_4',
  opted_in_cohort: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_active_at: new Date().toISOString()
};
          const { error: insertError } = await supabase.from('users').insert([dbUser]);
          if (insertError) throw insertError;
        } else {
          dbUser = { ...existingUser, ...localUser };
          const { error: updateError } = await supabase
            .from('users')
            .update({ ...localUser, updated_at: new Date().toISOString(), last_active_at: new Date().toISOString() })
            .eq('id', session.user.id);
          if (updateError) throw updateError;
        }

        setUser(dbUser);
        await refetchData(dbUser, groupId);
      } catch (err) {
        console.error('Error loading group data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, [refetchData, groupId, router]);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userMember = members.find(m => m.user_id === user?.id);
  const userPercentile = userMember?.percentile || 0;
  const topAvg = members.length > 0 ? Math.max(...members.map(m => m.avg_score || 0)) : 0;

  const handleDeleteGroup = async () => {
    if (!groupId) return;
    try {
      const { error } = await supabase.rpc('delete_group', { p_group_id: groupId });
      if (error) throw error;
      addToast('Group deleted successfully.', 'success');
      router.push('/rankings');
    } catch (err) {
      console.error('Error deleting group:', err);
      addToast('Failed to delete group.', 'error');
    }
    setShowSettings(false);
  };

  const handleEditGroup = async (name: string, description: string) => {
    if (!group) return;
    try {
      const { error } = await supabase
        .from('groups')
        .update({ name, description, updated_at: new Date().toISOString() })
        .eq('id', group.id)
        .eq('creator_id', user?.id);
      if (error) throw error;
      setGroup({ ...group, name, description });
    } catch (err) {
      console.error('Error updating group:', err);
      throw err;
    }
  };

  const handleRemoveMember = useCallback((userId: string) => {
    setMembers(prev => prev.filter(m => m.user_id !== userId));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header group={null} isScrolled={false} />
        <div className="px-4 py-4 space-y-4">
          <motion.div 
            className="bg-slate-800 rounded-2xl h-48 animate-pulse"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="space-y-3">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <motion.div 
          className="text-center max-w-sm w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AlertCircle size={64} className="text-red-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="bg-lime-400 text-black font-bold rounded-xl py-3 px-6 hover:bg-lime-500 transition-colors w-full"
            whileTap={{ scale: 0.98 }}
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!group || !isUserMember) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <motion.div 
          className="text-center max-w-sm w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Shield size={64} className="text-gray-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You&apos;re not a member of this group.</p>
          <motion.button
            onClick={() => router.push('/rankings')}
            className="bg-lime-400 text-black font-bold rounded-xl py-3 px-6 hover:bg-lime-500 transition-colors w-full"
            whileTap={{ scale: 0.98 }}
          >
            Back to Groups
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <Header 
        group={group} 
        isScrolled={isScrolled} 
        onBack={() => router.back()} 
        userRole={userRole}
        onSettings={() => setShowSettings(true)}
      />
      <TabToggle activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="px-4 py-6 space-y-6 relative">
        {activeTab === 'overview' && (
          <>
            <div className="space-y-4">
              <StatCard
                title="Group Average"
                value={`${stats?.average_overall?.toFixed(1) || '0'}%`}
                subtitle={`Active: ${stats?.active_members || 0}/${group.member_count}`}
                progress={stats?.average_overall}
                icon={<Users size={18} />}
                color="#10B981"
                onTap={() => {}}
              />
              <StatCard
                title="Your Percentile"
                value={`${userPercentile.toFixed(0)}%`}
                subtitle="vs group members"
                progress={userPercentile}
                icon={<Crown size={18} />}
                color={userPercentile > 50 ? '#10B981' : '#EF4444'}
                onTap={() => {}}
              />
              <StatCard
                title="Top Performer"
                value={`${topAvg.toFixed(1)}%`}
                subtitle="Best overall average"
                progress={topAvg}
                icon={<Trophy size={18} />}
                color="#F59E0B"
                onTap={() => {}}
              />
              <StatCard
                title="Group vs School"
                value={`${stats?.average_overall?.toFixed(1) || 0}% ${stats?.vs_school_difference ? (stats.vs_school_difference > 0 ? '+' : '') + stats.vs_school_difference.toFixed(1) : '0'}%`}
                subtitle={`School Avg: ${stats?.vs_school_avg?.toFixed(1) || 0}%`}
                progress={stats?.average_overall}
                icon={<TrendingUp size={18} />}
                color={stats?.vs_school_difference ?? 0 > 0 ? '#10B981' : '#EF4444'}
                trend={stats?.vs_school_difference && stats.vs_school_difference > 0 ? 'up' : 'down'}
                onTap={() => {}}
              />
            </div>

            {stats?.trends && stats.trends.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-4 font-medium flex items-center gap-2">
                  <Activity size={14} /> Recent Trends
                </h3>
                <div className="space-y-3">
                  {stats.trends.map((trend, index) => (
                    <TrendsItem key={trend.period} trend={trend} index={index} />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-700/50 transition-all flex flex-col items-center gap-3 backdrop-blur-sm"
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/add-grade')}
              >
                <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus size={24} className="text-black" />
                </div>
                <span className="text-sm font-medium text-white text-center">Add Grade</span>
              </motion.button>
              <motion.button
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-700/50 transition-all flex flex-col items-center gap-3 backdrop-blur-sm"
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  await navigator.clipboard.writeText(group.invite_code || '');
                  addToast('Group invite copied to clipboard!', 'success');
                }}
              >
                <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center shadow-lg">
                  <Share2 size={24} className="text-black" />
                </div>
                <span className="text-sm font-medium text-white text-center">Share Group</span>
              </motion.button>
            </div>
          </>
        )}

        {activeTab === 'members' && (
          <motion.div 
            className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-slate-900/30">
              <h3 className="text-gray-300 text-sm uppercase tracking-wide font-medium flex items-center gap-2">
                <Users2 size={18} />
                Member Rankings ({members.length})
              </h3>
              {members.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-lime-400 rounded-full" />
                  <span className="text-xs text-gray-500">You</span>
                </div>
              )}
            </div>
            {members.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {members.map((member, index) => (
                  <MemberRankingItem
                    key={member.user_id}
                    member={member}
                    index={index}
                    isUser={member.user_id === user?.id}
                    onTap={() => {}}
                  />
                ))}
              </div>
            ) : (
              <EmptyGroupState />
            )}  
          </motion.div>
        )}

        {activeTab === 'subjects' && (
          <motion.div 
            className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-5 border-b border-slate-700/50 bg-slate-900/30">
              <h3 className="text-gray-300 text-sm uppercase tracking-wide font-medium flex items-center gap-2">
                <Book size={18} />
                Subject Breakdown
              </h3>
            </div>
            {stats?.subjects_breakdown && stats.subjects_breakdown.length > 0 ? (
              <div className="divide-y divide-slate-700/50">
                {stats.subjects_breakdown.map((sub, index) => (
                  <SubjectBreakdownItem
                    key={sub.subject}
                    subject={sub}
                    index={index}
                    onTap={setSelectedSubject}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400">
                <BookOpen size={64} className="mx-auto mb-6 opacity-30" />
                <h3 className="text-xl font-semibold text-white mb-2">No Subjects Yet</h3>
                <p className="max-w-md mx-auto text-sm">Add grades across different subjects to unlock detailed breakdowns and comparisons.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          subjectMembers={subjectMembers}
          onClose={() => setSelectedSubject(null)}
          loading={subjectLoading}
          userId={user?.id || ''}
        />
      )}

{showSettings && userRole === 'admin' && (
  <SettingsModal
    group={group}
    userRole={userRole}
    members={members}
    onClose={() => setShowSettings(false)}
    onDelete={handleDeleteGroup}
    onEdit={handleEditGroup}
    addToast={addToast}
    groupId={groupId || ''}
    userId={user?.id || ''}
    onRemove={handleRemoveMember} // <-- ADD THIS
  />
)}

      {/* Toasts */}
      <div className="fixed top-20 right-4 z-50 space-y-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>

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
          className="flex flex-col items-center text-xs font-medium text-lime-400" 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/rankings')}
        >
          <Trophy size={24} className="mb-1" />
          <span>Rankings</span>
        </motion.button>
        <motion.button 
          className="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center -mt-8 shadow-2xl border-4 border-slate-900 col-span-1" 
          onClick={() => router.push('/add-grade')}
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

export default GroupRankings;