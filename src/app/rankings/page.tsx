"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, ChevronLeft, Trophy, ChevronRight, Users, BarChart3, Calendar, Sparkles, Crown, ArrowUpRight, Lock, Shield, X, Filter, Search, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility functions
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

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
};

// Term end dates (approximate for Singapore schools)
const TERM_END_DATES = {
  1: '03-31', // March 31
  2: '06-30', // June 30
  3: '09-30', // September 30
  4: '12-31'  // December 31
};

// Header Component (adapted for Rankings)
const Header = ({ user, date = new Date(), isScrolled = false, activeTab = 'overall' }) => (
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
          className={`h-1 rounded-full transition-all duration-300 ${activeTab === tab ? 'w-6 bg-lime-400' : 'w-3 bg-slate-700'}`}
          initial={false}
          animate={{ width: activeTab === tab ? 24 : 12 }}
        />
      ))}
    </div>
  </motion.div>
);

// Stat Card Component (reused)
const StatCard = ({ title, value, subtitle, icon, progress, onTap, color = '#84CC16' }) => (
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

// School Ranking Item
const SchoolRankingItem = ({ school, index, isUserSchool, onTap }) => (
  <motion.div
    className={`flex items-center justify-between p-4 border-b border-slate-800 last:border-b-0 cursor-pointer hover:bg-slate-800/50 transition-colors ${isUserSchool ? 'bg-slate-800/30 border-l-4 border-lime-400' : ''}`}
    onClick={onTap}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    whileHover={{ backgroundColor: isUserSchool ? 'rgba(132, 204, 22, 0.1)' : 'rgba(34, 197, 94, 0.05)' }}
    whileTap={{ scale: 0.99 }}
  >
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isUserSchool ? 'bg-lime-400 text-black' : 'bg-slate-700 text-gray-400'}`}>
        {index + 1}
      </div>
      <div>
        <p className={`font-semibold ${isUserSchool ? 'text-lime-400' : 'text-white'}`}>
          {school.school_name}
        </p>
        <p className="text-xs text-gray-500">{school.school_code}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`font-bold text-lg ${isUserSchool ? 'text-lime-400' : 'text-white'}`}>
        {school.average_overall?.toFixed(1) || 0}%
      </p>
      <p className="text-xs text-gray-400">Avg</p>
    </div>
  </motion.div>
);

// Subject Ranking Item
const SubjectRankingItem = ({ subject, index, userPercentile, onTap }) => {
  const safeUserPerc = userPercentile || 0;
  const isTop = safeUserPerc >= 80;

  return (
    <motion.div
      className={`flex items-center justify-between p-4 border-b border-slate-800 last:border-b-0 cursor-pointer hover:bg-slate-800/50 transition-colors ${isTop ? 'bg-slate-800/30 border-l-4 border-emerald-400' : ''}`}
      onClick={onTap}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ backgroundColor: isTop ? 'rgba(16, 185, 129, 0.1)' : 'rgba(34, 197, 94, 0.05)' }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isTop ? 'bg-emerald-400 text-black' : 'bg-slate-700 text-gray-400'}`}>
          {index + 1}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{SUBJECT_EMOJIS[subject.subject] || '📚'}</span>
          <div>
            <p className={`font-semibold ${isTop ? 'text-emerald-400' : 'text-white'}`}>
              {subject.subject.charAt(0).toUpperCase() + subject.subject.slice(1)}
            </p>
            <p className="text-xs text-gray-500">{subject.total_students} students</p>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg ${isTop ? 'text-emerald-400' : 'text-white'}`}>
          {subject.average?.toFixed(1) || 0}%
        </p>
        {userPercentile !== undefined && (
          <p className="text-xs text-gray-400">Your: {safeUserPerc.toFixed(0)}%</p>
        )}
      </div>
    </motion.div>
  );
};

// School Insights Modal
const SchoolInsightsModal = ({ school, level, isOpen, onClose }) => {
  const [subjectData, setSubjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && school) {
      const fetchSchoolSubjects = async () => {
        try {
          const { data, error } = await supabase
            .rpc('get_school_subject_averages', { 
              p_school_code: school.school_code, 
              p_level: level 
            });

          if (error) {
            console.error('Error fetching school subject data:', error);
            setSubjectData([]);
          } else {
            setSubjectData(data || []);
          }
        } catch (err) {
          console.error('Error in fetchSchoolSubjects:', err);
          setSubjectData([]);
        } finally {
          setLoading(false);
        }
      };

      fetchSchoolSubjects();
    }
  }, [isOpen, school, level]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-slate-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 p-6">
            <div className="flex justify-between items-center mb-2">
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-white text-center flex-1">Cohort Insights</h2>
              <div className="w-6" />
            </div>
            <div className="text-center">
              <p className="text-lime-400 font-semibold text-lg">{school.school_name}</p>
              <p className="text-gray-500 text-sm">{getOrdinal(school.national_rank)} nationally</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Overall Stat */}
            <div className="bg-slate-800 rounded-xl p-4 text-center border border-slate-700">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Overall Average</p>
              <p className="text-3xl font-bold text-white">{school.average_overall?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">{school.total_students} students</p>
            </div>

            {/* Subject Breakdown */}
            <div>
              <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-3 font-medium flex items-center">
                Subject Averages
                <Users size={14} className="ml-1 opacity-50" />
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : subjectData.length > 0 ? (
                <div className="space-y-3">
                  {subjectData.map((sub, index) => (
                    <motion.div
                      key={sub.subject}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{SUBJECT_EMOJIS[sub.subject] || '📚'}</span>
                        <div>
                          <p className="font-semibold text-white">
                            {sub.subject.charAt(0).toUpperCase() + sub.subject.slice(1)}
                          </p>
                          <p className="text-xs text-gray-500">{sub.total_students} students</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-emerald-400">{sub.average?.toFixed(1) || 0}%</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No subject data available yet.</p>
              )}
            </div>

            {/* Insights Teaser */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4 text-center border border-slate-600">
              <Lock size={16} className="mx-auto text-blue-400 mb-2" />
              <p className="text-xs text-gray-400">All data is anonymized and aggregated.</p>
              <p className="text-xs text-gray-500 mt-1">Your privacy is our priority.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Empty State for Rankings
const EmptyRankingsState = () => (
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
      <div className="text-6xl mb-4">🏆</div>
    </motion.div>
    <h3 className="text-2xl font-bold text-white mb-3">Rankings Coming Soon!</h3>
    <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
      Add more grades to unlock detailed rankings and see how you stack up against others.
    </p>
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
        <Trophy size={16} className="text-lime-400 mb-1" />
        <p className="text-xs font-semibold text-white">Live Rankings</p>
        <p className="text-xs text-gray-500">Updated in real-time</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
        <Users size={16} className="text-purple-400 mb-1" />
        <p className="text-xs font-semibold text-white">Anonymous</p>
        <p className="text-xs text-gray-500">Peer comparison</p>
      </div>
    </div>
  </motion.div>
);

// Tab Button
const TabButton = ({ active, onClick, children, icon: Icon }) => (
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

// Add Grade Modal with Term/Date Toggle
const AddGradeModal = ({ isOpen, onClose, onSubmit, subjects }) => {
  const [formData, setFormData] = useState({
    subject: '',
    assessment_name: '',
    score: '',
    max_score: '100',
    term: 1,
    year: new Date().getFullYear(),
    useSpecificDate: false,
    assessment_date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});

  const currentYear = new Date().getFullYear();

  const validate = () => {
    const newErrors = {};
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

    let finalDate;
    if (formData.useSpecificDate) {
      finalDate = formData.assessment_date;
    } else {
      const monthDay = TERM_END_DATES[formData.term];
      finalDate = `${formData.year}-${monthDay}`;
    }

    const submitData = { ...formData, assessment_date: finalDate };
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

// Main Rankings Component
export default function Rankings() {
  const [user, setUser] = useState(null);
  const [schoolRankings, setSchoolRankings] = useState([]);
  const [subjectRankings, setSubjectRankings] = useState([]);
  const [userPercentiles, setUserPercentiles] = useState({});
  const [activeTab, setActiveTab] = useState('overall');
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSchoolFallback, setUserSchoolFallback] = useState(false);
  // New state for school insights modal
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);

  const refetchData = useCallback(async (currentUser) => {
    try {
      // Validate level
      if (!currentUser?.level || typeof currentUser.level !== 'string') {
        console.error('Invalid level:', currentUser?.level);
        throw new Error('Invalid user level');
      }

      // Proactively update school stats (with error handling)
      try {
        await supabase.rpc('update_school_stats_by_level', { p_level: currentUser.level });
      } catch (rpcErr) {
        if (rpcErr.code === '400') {
          console.error('RPC failed (possibly no data):', rpcErr);
          // Continue without update; fetch existing
        } else {
          throw rpcErr;  // Re-throw non-400
        }
      }

      // Fetch school rankings
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('school_stats')
        .select('school_code, school_name, average_overall, national_rank, total_students, level')
        .eq('level', currentUser.level)
        .order('average_overall', { ascending: false })
        .limit(20);

      if (schoolsError) throw schoolsError;

      // Fallback ranks
      const rankedSchools = (schoolsData || []).map((school, index) => ({
        ...school,
        national_rank: school.national_rank ?? (index + 1)
      }));

      setSchoolRankings(rankedSchools);

      // Check user's school
      const userSchool = rankedSchools.find(s => s.school_code === currentUser.school_code);
      setUserSchoolFallback(!userSchool || userSchool.total_students === 0 || userSchool.average_overall === null);

      // Fetch subject rankings
      const { data: subjectsData, error: subjectsError } = await supabase
        .rpc('get_national_subject_averages', { p_level: currentUser.level });

      if (subjectsError) {
        console.error('Subject fetch error:', subjectsError);
        setSubjectRankings([]);
      } else {
        setSubjectRankings(subjectsData || []);
      }

      // Fetch user percentiles for each subject (national scope)
      const subjects = Object.keys(SUBJECT_EMOJIS);
      const userPerc = {};
      for (const sub of subjects) {
        try {
          const { data: percData } = await supabase
            .rpc('calculate_percentile', { 
              p_user_id: currentUser.id, 
              p_subject: sub,
              p_school_code: null  // national
            });
          if (percData && percData.length > 0) {
            userPerc[sub] = percData[0].percentile;
          } else {
            userPerc[sub] = 0;
          }
        } catch (err) {
          console.error(`Error fetching percentile for ${sub}:`, err);
          userPerc[sub] = 0;
        }
      }
      setUserPercentiles(userPerc);

    } catch (err) {
      console.error('Error refetching rankings data:', err);
      setSchoolRankings([]);
      setSubjectRankings([]);
      setUserSchoolFallback(true);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        let { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
          if (anonError) throw anonError;
          session = anonData.session;
        }

        const localUserStr = localStorage.getItem('outrankUser');
        let localUser = localUserStr ? JSON.parse(localUserStr) : {
          nickname: 'Student',
          school_code: 'RI',
          school_name: 'Raffles Institution',
          level: 'sec_4'
        };

        // Upsert user (same as dashboard)
        let { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        let dbUser;
        if (fetchError && fetchError.code === 'PGRST116') {
          dbUser = {
            id: session.user.id,
            ...localUser,
            opted_in_cohort: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_active_at: new Date().toISOString()
          };
          const { error: insertError } = await supabase
            .from('users')
            .insert([dbUser]);
          if (insertError) throw insertError;
        } else if (existingUser) {
          dbUser = existingUser;
          const updates = {};
          if (localUser.nickname && localUser.nickname !== dbUser.nickname) updates.nickname = localUser.nickname;
          if (localUser.school_code && localUser.school_code !== dbUser.school_code) {
            updates.school_code = localUser.school_code;
            updates.school_name = localUser.school_name;
          }
          if (localUser.level && localUser.level !== dbUser.level) updates.level = localUser.level;
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

        if (localUser.id !== session.user.id) {
          localUser.id = session.user.id;
          localStorage.setItem('outrankUser', JSON.stringify(localUser));
        }

        setUser(dbUser);
        await refetchData(dbUser);
      } catch (err) {
        console.error('Error loading rankings data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refetchData]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddGrade = async (formData) => {
    if (!user) return;

    const newGrade = {
      user_id: user.id,
      subject: formData.subject,
      assessment_name: formData.assessment_name,
      score: parseFloat(formData.score),
      max_score: parseFloat(formData.max_score),
      assessment_date: formData.assessment_date,
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
    await refetchData(user);
  };

  // New handler for school tap
  const handleSchoolTap = (school) => {
    setSelectedSchool(school);
    setIsSchoolModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header user={null} isScrolled={false} activeTab={activeTab} />
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

  const userSchool = schoolRankings.find(s => s.school_code === user?.school_code);
  const safeSchoolRank = userSchool?.national_rank || 1;
  const safeSchoolAvg = userSchool?.average_overall || 0;
  const safeSchoolStudents = userSchool?.total_students || 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <Header user={user} isScrolled={isScrolled} activeTab={activeTab} />

      <div className="px-5 py-6 space-y-6 relative">
        {/* Tab Bar */}
        <div className="flex bg-slate-800 rounded-xl p-1 mb-6">
          <TabButton
            active={activeTab === 'overall'}
            onClick={() => setActiveTab('overall')}
            icon={BarChart3}
          >
            Overall
          </TabButton>
          <TabButton
            active={activeTab === 'subjects'}
            onClick={() => setActiveTab('subjects')}
            icon={Sparkles}
          >
            Subjects
          </TabButton>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overall' && (
            <>
              {/* Your Position Cards */}
              <div className="grid grid-cols-1 gap-4">
                <StatCard
                  title="Your School Rank"
                  value={userSchoolFallback ? 'N/A' : getOrdinal(safeSchoolRank)}
                  subtitle={userSchoolFallback ? 'Add grades to unlock rankings' : `${safeSchoolStudents} students`}
                  progress={userSchoolFallback ? 0 : safeSchoolAvg}
                  icon={<Crown size={18} />}
                  color={userSchoolFallback ? '#6B7280' : '#A855F7'}  // Gray if fallback
                  onTap={() => {}}
                />  
              </div>

              {/* School Rankings Chart */}
              {schoolRankings.length > 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-400 text-xs uppercase tracking-wide font-medium">National School Rankings</h3>
                    <p className="text-xs text-gray-500">{user?.level?.replace('_', ' ')?.toUpperCase() || 'N/A'}</p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={schoolRankings} layout="vertical">
                      <CartesianGrid stroke="#374151" vertical={false} />
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="school_name" 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        tickLine={false}
                        width={120}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1E293B', 
                          border: '1px solid #475569', 
                          borderRadius: '12px',
                          color: '#F9FAFB' 
                        }} 
                      />
                      <Bar dataKey="average_overall" fill="#84CC16" radius={[4, 4, 0, 0]}>
                        {schoolRankings.map((entry, index) => {
                          const isUserSchool = entry.school_code === user?.school_code;
                          return <Cell key={`cell-${index}`} fill={isUserSchool ? '#10B981' : '#84CC16'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyRankingsState />
              )}

              {/* Top Schools List */}
              {schoolRankings.length > 0 && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  <h3 className="text-gray-400 text-xs uppercase tracking-wide p-4 border-b border-slate-700 font-medium">Top Schools</h3>
                  <div className="divide-y divide-slate-700">
                    {schoolRankings.slice(0, 10).map((school, index) => (
                      <SchoolRankingItem
                        key={school.school_code}
                        school={school}
                        index={index}
                        isUserSchool={school.school_code === user?.school_code}
                        onTap={() => handleSchoolTap(school)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'subjects' && (
            <>
              {/* Subject Rankings */}
              {subjectRankings.length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <h3 className="text-gray-400 text-xs uppercase tracking-wide p-4 border-b border-slate-700 font-medium">National Subject Averages</h3>
                    <div className="divide-y divide-slate-700">
                      {subjectRankings.map((sub, index) => (
                        <SubjectRankingItem
                          key={sub.subject}
                          subject={sub}
                          index={index}
                          userPercentile={userPercentiles[sub.subject]}
                          onTap={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyRankingsState />
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      <AddGradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddGrade}
        subjects={Object.keys(SUBJECT_EMOJIS)}
      />

      {/* New School Insights Modal */}
      <SchoolInsightsModal
        school={selectedSchool}
        level={user?.level}
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
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
          className="flex flex-col items-center text-xs font-medium text-lime-400" 
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
}