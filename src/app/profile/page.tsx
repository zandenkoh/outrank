"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, User, School, GraduationCap, ShieldCheck, ShieldOff, Save, Edit3, X, Sparkles, BarChart3, Trophy, Calendar, Plus, Filter, Search, Key, Bell, Download, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SCHOOLS = {
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

const TERM_END_DATES = {
  1: '03-31', // March 31
  2: '06-30', // June 30
  3: '09-30', // September 30
  4: '12-31'  // December 31
};

// Utility functions
const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const generateAvatarSeed = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getAvailableSchools = (level) => {
  if (level.startsWith('sec_')) return SCHOOLS.secondary;
  if (level.startsWith('jc_')) return SCHOOLS.jc;
  return [];
};

const stdDev = (values) => {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b) / values.length;
  const sqDiff = values.map(v => Math.pow(v - avg, 2));
  const variance = sqDiff.reduce((a, b) => a + b) / values.length;
  return Math.sqrt(variance);
};

// Header Component
const Header = ({ user, date = new Date(), isScrolled = false }) => (
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
const StatCard = ({ title, value, subtitle, icon: Icon, color = '#10B981' }) => (
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
const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-300">{label}</span>
    <motion.button
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
const EditableInput = ({ value, onChange, placeholder, type = 'text', error }) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-slate-800 text-white border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all pr-10 ${
        error ? 'border-red-500' : 'border-slate-700'
      }`}
    />
    {error && <p className="text-red-400 text-xs mt-1 absolute -bottom-5 left-0">{error}</p>}
  </div>
);

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

// Main Profile Component
export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const levels = [
    { value: 'sec_1', label: 'Secondary 1' },
    { value: 'sec_2', label: 'Secondary 2' },
    { value: 'sec_3', label: 'Secondary 3' },
    { value: 'sec_4', label: 'Secondary 4' },
    { value: 'jc_1', label: 'JC 1' },
    { value: 'jc_2', label: 'JC 2' }
  ];

  const loadData = useCallback(async () => {
    try {
      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) throw anonError;
        session = anonData.session;
      }

      const localUserStr = localStorage.getItem('outrankUser');
      const localUser = localUserStr ? JSON.parse(localUserStr) : {
        nickname: 'Student',
        school_code: 'RI',
        school_name: 'Raffles Institution',
        level: 'sec_4'
      };

      // Fetch or upsert user
      let { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      let dbUser;
      if (fetchError && fetchError.code === 'PGRST116') {
        // Generate avatar seed if needed
        const avatarSeed = localUser.avatar_seed || generateAvatarSeed();
        dbUser = {
          id: session.user.id,
          ...localUser,
          avatar_seed: avatarSeed,
          opted_in_cohort: localUser.opted_in_cohort !== undefined ? localUser.opted_in_cohort : true,
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
        // Sync local changes
        const updates = {};
        if (localUser.nickname && localUser.nickname !== dbUser.nickname) updates.nickname = localUser.nickname;
        if (localUser.school_code && localUser.school_code !== dbUser.school_code) {
          updates.school_code = localUser.school_code;
          updates.school_name = localUser.school_name;
        }
        if (localUser.level && localUser.level !== dbUser.level) updates.level = localUser.level;
        if (!dbUser.avatar_seed) {
          const newSeed = generateAvatarSeed();
          updates.avatar_seed = newSeed;
        }
        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          updates.last_active_at = new Date().toISOString();
          const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', session.user.id);
          if (updateError) console.error('Update error:', updateError);
          // Refetch after update
          ({ data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single());
        }
      } else {
        throw new Error('User fetch failed');
      }

      // Update localStorage
      if (localUser.id !== session.user.id) {
        localUser.id = session.user.id;
        localStorage.setItem('outrankUser', JSON.stringify(localUser));
      }

      // Load local settings
      const localSettingsStr = localStorage.getItem('outrankLocalSettings');
      const localSettings = localSettingsStr ? JSON.parse(localSettingsStr) : {
        twoFA: false,
        notifications: { email: true, push: true, inapp: true },
        share_school: true,
        share_national: true,
        data_retention: '1year'
      };

      setUser(dbUser);
      setFormData({
        nickname: dbUser.nickname,
        school_code: dbUser.school_code,
        school_name: dbUser.school_name,
        level: dbUser.level,
        opted_in_cohort: dbUser.opted_in_cohort,
        twoFA: localSettings.twoFA,
        notifications: localSettings.notifications,
        share_school: localSettings.share_school,
        share_national: localSettings.share_national,
        data_retention: localSettings.data_retention,
        sessions: [
          { device: 'iPhone 15', location: 'Singapore', lastActive: '2025-10-25' },
          { device: 'Chrome on Mac', location: 'Singapore', lastActive: '2025-10-28' }
        ]
      });

    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data: fetchedGrades } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', user.id)
        .order('assessment_date', { ascending: true });

      const currentGrades = fetchedGrades || [];

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

      const subjects = {};
      currentGrades.forEach(g => {
        if (!subjects[g.subject]) {
          subjects[g.subject] = { percentages: [], count: 0 };
        }
        subjects[g.subject].percentages.push(g.percentage);
        subjects[g.subject].count++;
      });

      const subjectsCount = Object.keys(subjects).length;

      let bestSubject = null, bestAvg = 0;
      let mostImproved = null, maxImp = 0;

      for (let sub in subjects) {
        const subPercentages = subjects[sub].percentages;
        const avg = subPercentages.reduce((s, v) => s + v, 0) / subPercentages.length;
        const subGrades = currentGrades.filter(g => g.subject === sub).sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date));
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
        consistency_score: 0
      });
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (user && loading === false) {
      loadStats();
    }
  }, [user, loading, loadStats]);

  // Handle level change for schools
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
  }, [formData.level, isEditing]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateForm = () => {
    const newErrors = {};
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

  const saveLocalSettings = useCallback(() => {
    const local = {
      twoFA: formData.twoFA,
      notifications: formData.notifications,
      share_school: formData.share_school,
      share_national: formData.share_national,
      data_retention: formData.data_retention
    };
    localStorage.setItem('outrankLocalSettings', JSON.stringify(local));
  }, [formData]);

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updates = {
        nickname: formData.nickname,
        school_code: formData.school_code,
        school_name: formData.school_name,
        level: formData.level,
        opted_in_cohort: formData.opted_in_cohort,
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      };

      // Check nickname uniqueness (excluding self)
      const { count: nickCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('nickname', formData.nickname)
        .neq('id', user.id);

      if (nickCount > 0) {
        setErrors({ nickname: 'Nickname already taken' });
        return;
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update localStorage
      const updatedLocal = { ...JSON.parse(localStorage.getItem('outrankUser') || '{}'), ...formData };
      localStorage.setItem('outrankUser', JSON.stringify(updatedLocal));

      setUser({ ...user, ...formData });
      setIsEditing(false);
      setErrors({});
      saveLocalSettings();

      // Refetch stats in case level changed
      await loadStats();

    } catch (err) {
      console.error('Error saving profile:', err);
      setErrors({ general: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nickname: user.nickname,
      school_code: user.school_code,
      school_name: user.school_name,
      level: user.level,
      opted_in_cohort: user.opted_in_cohort,
      twoFA: formData.twoFA, // Keep local
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
    await loadStats();
  };

  const handleChangePassword = () => {
    // Mock
    alert('Password updated successfully! (Demo mode)');
  };

  const handleLogoutAll = () => {
    // Mock
    setFormData(prev => ({ ...prev, sessions: [] }));
    alert('All other sessions logged out! (Demo mode)');
  };

  const handleExportData = () => {
    // Mock export
    const dataStr = JSON.stringify({ user: formData, stats: userStats }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'outrank-data.json';
    link.click();
  };

  const handleDeleteAccount = () => {
    // Mock
    if (confirm('Delete account? (Demo mode - no real deletion)')) {
      alert('Account deleted! (Demo mode)');
      router.push('/');
    }
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
      </div>
    );
  }

  const avatarUrl = user?.avatar_seed ? `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${user.avatar_seed}` : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <Header user={user} isScrolled={isScrolled} />

      <div className="px-5 py-6 space-y-6 relative">
        {/* Avatar and Quick Stats */}
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
            {isEditing && (
              <motion.button
                className="absolute -top-2 -right-2 bg-lime-600 rounded-full p-1 shadow-lg"
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const newSeed = generateAvatarSeed();
                  setUser({ ...user, avatar_seed: newSeed });
                  // Update DB
                  supabase.from('users').update({ avatar_seed: newSeed }).eq('id', user.id);
                }}
              >
                <Edit3 size={14} className="text-white" />
              </motion.button>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white">{user?.nickname || 'Student'}</h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Overall Average"
            value={`${(userStats?.overall_average || 0)?.toFixed(1)}%`}
            subtitle="Lifetime performance"
            icon={BarChart3}
            color="#10B981"
          />
          <StatCard
            title="Total Grades"
            value={userStats?.total_grades || 0}
            subtitle="Assessments logged"
            icon={GraduationCap}
            color="#10B981"
          />
          <StatCard
            title="Subjects Covered"
            value={userStats?.subjects_count || 0}
            subtitle="Unique subjects"
            icon={School}
            color="#10B981"
          />
          <StatCard
            title="Consistency"
            value={(userStats?.consistency_score || 0)?.toFixed(1)}
            subtitle="Score /10"
            icon={ShieldCheck}
            color="#10B981"
          />
        </div>

        {/* Profile Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isEditing ? 'edit' : 'view'}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <User size={20} className="mr-2 text-lime-400" />
                Personal Info
              </h3>
              {!isEditing ? (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-lime-400 hover:text-lime-300 text-sm font-medium"
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit3 size={16} className="mr-1" />
                  Edit
                </motion.button>
              ) : (
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-300 p-1"
                    whileTap={{ scale: 0.98 }}
                  >
                    <X size={20} />
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      !hasChanges || saving
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-lime-400 hover:text-lime-300 bg-lime-500/10'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save size={16} className="mr-1" />
                    {saving ? 'Saving...' : 'Save'}
                  </motion.button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Nickname</label>
                {isEditing ? (
                  <EditableInput
                    value={formData.nickname}
                    onChange={(val) => setFormData({ ...formData, nickname: val })}
                    placeholder="Enter your nickname"
                    error={errors.nickname}
                  />
                ) : (
                  <p className="text-white font-semibold">{formData.nickname}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">School</label>
                {isEditing ? (
                  <select
                    value={formData.school_code}
                    onChange={(e) => {
                      const code = e.target.value;
                      const school = availableSchools.find(s => s.code === code);
                      setFormData(prev => ({
                        ...prev,
                        school_code: code,
                        school_name: school ? school.name : ''
                      }));
                    }}
                    className={`w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${
                      errors.school_code || errors.school_name ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select a school</option>
                    {availableSchools.map((school) => (
                      <option key={school.code} value={school.code}>
                        {school.name} ({school.code})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white font-semibold">{formData.school_name} ({formData.school_code})</p>
                )}
                {(errors.school_code || errors.school_name) && (
                  <p className="text-red-400 text-xs mt-1">{errors.school_code || errors.school_name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">Level</label>
                {isEditing ? (
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className={`w-full bg-slate-700 text-white border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-400/50 transition-all ${
                      errors.level ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select level</option>
                    {levels.map((lvl) => (
                      <option key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white font-semibold">
                    {levels.find((l) => l.value === formData.level)?.label || 'N/A'}
                  </p>
                )}
                {errors.level && <p className="text-red-400 text-xs mt-1">{errors.level}</p>}
              </div>

              {errors.general && (
                <p className="text-red-400 text-sm text-center py-2 bg-red-500/10 rounded-lg border border-red-500/30">
                  {errors.general}
                </p>
              )}

              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-gray-400 text-sm uppercase tracking-wide mb-3 font-medium flex items-center">
                  <ShieldCheck size={16} className="mr-2 text-lime-400" />
                  Privacy Settings
                </h4>
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
                  <div className="space-y-4 mt-4 pt-4 border-t border-slate-700">
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
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AddGradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddGrade}
        subjects={Object.keys(SUBJECT_EMOJIS)}
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
          className="flex flex-col items-center text-xs font-medium text-gray-400" 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push('/history')}
        >
          <Calendar size={24} className="mb-1" />
          <span>History</span>
        </motion.button>
        <motion.button 
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
}