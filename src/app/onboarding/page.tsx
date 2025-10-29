"use client"

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Sparkles, ArrowLeft, Check, Shield, Lock, Users, TrendingUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Comprehensive Singapore schools data with UNIQUE keys
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

const LEVELS = [
  { id: 'sec_1', label: 'Sec 1', type: 'secondary' },
  { id: 'sec_2', label: 'Sec 2', type: 'secondary' },
  { id: 'sec_3', label: 'Sec 3', type: 'secondary' },
  { id: 'sec_4', label: 'Sec 4', type: 'secondary' },
  { id: 'jc_1', label: 'JC 1', type: 'jc' },
  { id: 'jc_2', label: 'JC 2', type: 'jc' },
  { id: 'ib_1', label: 'IB Year 1', type: 'ib' },
  { id: 'ib_2', label: 'IB Year 2', type: 'ib' },
];

const NICKNAME_SUGGESTIONS = [
  'MathGenius', 'ChemWizard', 'PhysicsKing', 'StudyGrind',
  'GradeAce', 'ExamNinja', 'BioWhiz', 'CalcPro',
  'QuantumLeap', 'AlphaStudent', 'BetaLearner', 'SigmaScholar'
];

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const router = useRouter();
  
  // Form data
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<{ code: string; name: string } | null>(null);
  const [nickname, setNickname] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<{ id: string; label: string; type: string } | null>(null);
  
  // UI state
  const [isAnimating, setIsAnimating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter schools based on search
  const allSchools = [...SCHOOLS.secondary, ...SCHOOLS.jc, ...SCHOOLS.ib];
  const filteredSchools = searchQuery
    ? allSchools.filter(school => 
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allSchools;

  // Get school type to filter levels
  const getSchoolType = () => {
    if (!selectedSchool) return null;
    if (SCHOOLS.secondary.find(s => s.code === selectedSchool.code)) return 'secondary';
    if (SCHOOLS.jc.find(s => s.code === selectedSchool.code)) return 'jc';
    if (SCHOOLS.ib.find(s => s.code === selectedSchool.code)) return 'ib';
    return null;
  };

  const filteredLevels = selectedSchool 
    ? LEVELS.filter(level => level.type === getSchoolType())
    : LEVELS;

  const goToNextStep = () => {
    setDirection('forward');
    setIsAnimating(true);
    setTimeout(() => {
      setStep(step + 1);
      setIsAnimating(false);
    }, 300);
  };

  const goToPrevStep = () => {
    setDirection('backward');
    setIsAnimating(true);
    setTimeout(() => {
      setStep(step - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleComplete = async () => {
    setIsSaving(true);
    setSaveError(null);

    if (!selectedSchool || !selectedLevel) {
      setSaveError("Please complete the onboarding steps before saving.");
      setIsSaving(false);
      return;
    }

    // Prepare user data
    const userData = {
      nickname,
      school_code: selectedSchool.code,
      school_name: selectedSchool.name,
      level: selectedLevel.id,
      opted_in_cohort: true,
    };
    
    // Save to Supabase
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add the generated ID to the user data for localStorage
      const fullUserData = { ...userData, id: data.id };

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(fullUserData));

      console.log('User data saved successfully:', fullUserData);
    } catch (error: unknown) {
      console.error('Error saving user data:', error);
      if (error instanceof Error) {
        setSaveError(error.message || 'Failed to save data. Please try again.');
      } else {
        setSaveError('Failed to save data. Please try again.');
      }
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    
    // Show success animation
    setStep(4);
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const canProceed = () => {
    if (step === 1) return selectedSchool !== null;
    if (step === 2) return nickname.length >= 3 && nickname.length <= 15;
    if (step === 3) return selectedLevel !== null;
    return false;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Progress bar */}
      {step > 0 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-900 z-50">
          <div 
            className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      )}

      {/* Back button (except on first step) */}
      {step > 1 && step < 4 && (
        <button
          onClick={goToPrevStep}
          className="fixed top-6 left-6 z-40 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          
          {/* Step 0: Welcome & Privacy Info */}
          {step === 0 && (
            <div className={`space-y-6 ${isAnimating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce">🚀</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                  Welcome to Outrank
                </h1>
                <p className="text-lg text-gray-400">
                  Track grades. Compare anonymously. Rank up.
                </p>
              </div>

              {/* Quick promises - 2x2 grid, compact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <Lock size={20} className="text-lime-400 mb-2" />
                  <p className="text-sm font-semibold mb-1">100% Anonymous</p>
                  <p className="text-xs text-gray-500">No real names required</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <Users size={20} className="text-purple-400 mb-2" />
                  <p className="text-sm font-semibold mb-1">Compare Cohorts</p>
                  <p className="text-xs text-gray-500">See your real rank</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <TrendingUp size={20} className="text-cyan-400 mb-2" />
                  <p className="text-sm font-semibold mb-1">Track Progress</p>
                  <p className="text-xs text-gray-500">Watch trends over time</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <Shield size={20} className="text-orange-400 mb-2" />
                  <p className="text-sm font-semibold mb-1">You Control Data</p>
                  <p className="text-xs text-gray-500">Opt in/out anytime</p>
                </div>
              </div>

              {/* Get Started button */}
              <button
                onClick={goToNextStep}
                className="w-full py-4 rounded-xl font-bold text-lg bg-lime-400 text-black hover:bg-lime-300 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-xl shadow-lime-400/20"
              >
                Get Started
                <ChevronRight size={24} />
              </button>

              <p className="text-center text-xs text-gray-500">
                Takes 60 seconds • Free forever
              </p>
            </div>
          )}

          {/* Step 1: School Selection */}
          {step === 1 && (
            <div className={`space-y-4 ${isAnimating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🏫</div>
                <h1 className="text-3xl font-bold mb-2">Which school are you from?</h1>
                <p className="text-gray-400">This helps us show you relevant comparisons</p>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search for your school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20 transition-all"
                  autoFocus
                />
              </div>

              {/* School list - scrollable */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 max-h-72 overflow-y-auto">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school) => (
                    <button
                      key={school.code}
                      onClick={() => setSelectedSchool(school)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors flex items-center justify-between border-t border-slate-800 first:border-t-0 ${
                        selectedSchool?.code === school.code ? 'bg-lime-400/10 border-lime-400/30' : ''
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-sm">{school.name}</div>
                        <div className="text-xs text-gray-500">{school.code}</div>
                      </div>
                      {selectedSchool?.code === school.code && (
                        <Check size={18} className="text-lime-400" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500 text-sm">
                    No schools found. Try a different search.
                  </div>
                )}
              </div>

              {/* Continue button */}
              <button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  canProceed()
                    ? 'bg-lime-400 text-black hover:bg-lime-300 hover:scale-105'
                    : 'bg-slate-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                Continue
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Step 2: Nickname */}
          {step === 2 && (
            <div className={`space-y-4 ${isAnimating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">✨</div>
                <h1 className="text-3xl font-bold mb-2">Choose your nickname</h1>
                <p className="text-gray-400">How you&apos;ll appear to others (anonymous)</p>
              </div>

              {/* Nickname input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter a cool nickname..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.slice(0, 15))}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl py-5 px-6 text-white text-center text-xl placeholder-gray-500 focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/20 transition-all"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {nickname.length}/15
                </div>
              </div>

              {/* Character validation */}
              {nickname.length > 0 && nickname.length < 3 && (
                <div className="text-center text-orange-400 text-sm animate-pulse">
                  At least 3 characters needed
                </div>
              )}

              {/* Suggestions */}
              <div>
                <p className="text-xs text-gray-500 mb-2 text-center">Need inspiration?</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {NICKNAME_SUGGESTIONS.slice(0, 6).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setNickname(suggestion)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs hover:border-lime-400 hover:text-lime-400 transition-all hover:scale-105"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue button */}
              <button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  canProceed()
                    ? 'bg-lime-400 text-black hover:bg-lime-300 hover:scale-105'
                    : 'bg-slate-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                Continue
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Step 3: Level Selection */}
          {step === 3 && (
            <div className={`space-y-4 ${isAnimating ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📚</div>
                <h1 className="text-3xl font-bold mb-2">What level are you?</h1>
                <p className="text-gray-400">Select your current year</p>
              </div>

              {/* Level grid */}
              <div className="grid grid-cols-2 gap-3">
                {filteredLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level)}
                    className={`relative p-5 rounded-xl border-2 transition-all hover:scale-105 ${
                      selectedLevel?.id === level.id
                        ? 'bg-lime-400/10 border-lime-400 shadow-lg shadow-lime-400/20'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xl font-bold">{level.label}</div>
                    {selectedLevel?.id === level.id && (
                      <div className="absolute top-2 right-2">
                        <Check size={18} className="text-lime-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Error display */}
              {saveError && (
                <div className="bg-red-900/50 border border-red-500 rounded-xl p-3 text-center text-red-300 text-sm">
                  {saveError}
                  <button
                    onClick={() => setSaveError(null)}
                    className="ml-2 text-red-300 hover:text-red-200"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Complete button */}
              <button
                onClick={handleComplete}
                disabled={!canProceed() || isSaving}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  canProceed() && !isSaving
                    ? 'bg-lime-400 text-black hover:bg-lime-300 hover:scale-105'
                    : 'bg-slate-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    Saving...
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  </>
                ) : (
                  <>
                    Let&apos;s go!
                    <Sparkles size={20} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Step 4: Success Animation */}
          {step === 4 && (
            <div className="text-center space-y-6 animate-fadeIn">
              <div className="text-8xl animate-bounce mb-4">🎉</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
                You&apos;re all set!
              </h1>
              <p className="text-lg text-gray-400">Welcome to Outrank, {nickname}!</p>
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
                <span>Taking you to your dashboard...</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Step indicator */}
      {step > 0 && step < 4 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-lime-400'
                  : s < step
                  ? 'w-2 bg-lime-400/50'
                  : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}