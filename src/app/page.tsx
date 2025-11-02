"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowRight, Menu, X, CheckCircle, Shield, Mail, Instagram, Twitter, School, GraduationCap, Globe, BarChart3, Trophy, Sparkles, Star, Zap, Target, Building2, Phone, ChevronRight, Heart, TrendingUp, BookOpen, Award } from 'lucide-react';

type ModalType = 'features' | 'schools' | 'about' | 'pricing' | 'privacy' | 'terms' | 'contact' | 'instagram' | 'twitter' | 'faqs' | 'testimonials' | 'how-it-works';

interface ModalProps {
  type: ModalType;
  onClose: () => void;
  setActiveModal: (modal: ModalType | null) => void;
}

const SCHOOLS = {
  secondary: [
    { code: 'RI', name: 'Raffles Institution' },
    { code: 'HCI', name: 'Hwa Chong Institution' },
    { code: 'ACS-I', name: 'Anglo-Chinese School (Independent)' },
    { code: 'NUSH', name: 'NUS High School' },
    { code: 'SJI', name: "St. Joseph's Institution" },
    { code: 'SCGS', name: "Singapore Chinese Girls' School" },
    { code: 'MGS', name: "Methodist Girls' School" },
    { code: 'DMSS', name: 'Dunman High School' },
    { code: 'VS', name: 'Victoria School' },
    { code: 'NYGH', name: 'Nanyang Girls High School' },
    { code: 'RGS', name: "Raffles Girls' School" },
    { code: 'CEDAR', name: 'Cedar Girls Secondary School' },
    { code: 'CHSS', name: 'Catholic High School' },
    { code: 'SSH', name: 'Singapore Sports School' },
    { code: 'RVHS', name: 'River Valley High School' },
    { code: 'ACSBR', name: 'Anglo-Chinese School (Barker Road)' },
    { code: 'AI', name: 'Anderson Secondary School' },
    { code: 'BBSS', name: 'Bukit Batok Secondary School' },
    { code: 'BPGHS', name: 'Bukit Panjang Government High School' },
    { code: 'CTSS', name: 'Chung Cheng High School (Main)' },
  ],
  jc: [
    { code: 'RJC', name: 'Raffles Junior College' },
    { code: 'HCJC', name: 'Hwa Chong Junior College' },
    { code: 'VJC', name: 'Victoria Junior College' },
    { code: 'NJC', name: 'National Junior College' },
    { code: 'ACJC', name: 'Anglo-Chinese Junior College' },
    { code: 'TJC', name: 'Temasek Junior College' },
    { code: 'NYJC', name: 'Nanyang Junior College' },
    { code: 'SAJC', name: "St. Andrew's Junior College" },
    { code: 'CJC', name: 'Catholic Junior College' },
    { code: 'TPJC', name: 'Tampines Junior College' },
    { code: 'JJC', name: 'Jurong Junior College' },
    { code: 'YJC', name: 'Yishun Junior College' },
    { code: 'MJC', name: 'Meridian Junior College' },
    { code: 'EJC', name: 'Eunoia Junior College' },
  ],
  ib: [
    { code: 'ACS-IB', name: 'ACS (International)' },
    { code: 'UWC', name: 'United World College SEA' },
    { code: 'GESS', name: 'German European School' },
    { code: 'CIS', name: 'Canadian International School' },
    { code: 'SAIS', name: 'Stamford American International' },
  ]
};

const TESTIMONIALS = [
  {
    quote: "I used to feel lost comparing myself to others. Outrank helped me see my actual progress and focus on improving, not just competing. My grades improved naturally.",
    author: "Sarah L.",
    school: "Tampines Junior College",
    rating: 5,
    improvement: "B to A"
  },
  {
    quote: "Finally, a tool that respects privacy while giving honest feedback. Helped me identify weak spots in Chemistry without the pressure of public rankings.",
    author: "Marcus T.",
    school: "Anderson Secondary",
    rating: 5,
    improvement: "+15 marks"
  },
  {
    quote: "As a parent, I appreciate seeing my daughter's progress without hovering. The insights help us have better conversations about her studies.",
    author: "Mrs. Chen",
    school: "Parent, Nanyang Girls'",
    rating: 5,
    improvement: "Better communication"
  },
  {
    quote: "Coming from a neighborhood school, I worried I was behind. Outrank showed me I was doing better than I thought and gave me confidence to aim higher.",
    author: "Raj K.",
    school: "Bukit Batok Secondary",
    rating: 5,
    improvement: "New confidence"
  },
  {
    quote: "The study group feature connected me with peers who genuinely wanted to help each other. We all improved together, not against each other.",
    author: "Li Ying",
    school: "Catholic Junior College",
    rating: 5,
    improvement: "Found my people"
  },
  {
    quote: "Clear data, no judgment. Helped me understand where to focus my limited study time. Simple interface, big impact on my Economics grade.",
    author: "Daniel W.",
    school: "Meridian Junior College",
    rating: 5,
    improvement: "Smarter studying"
  }
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Share Your Results",
    description: "Add your grades from any school in Singapore—O-Level, A-Level, IB, or IGCSE. Manual entry or school portal sync, whatever works for you.",
    icon: <BookOpen className="w-8 h-8" />
  },
  {
    step: 2,
    title: "Understand Your Journey",
    description: "See where you stand, track your growth over time, and get personalized insights. All anonymously—no names, just numbers.",
    icon: <TrendingUp className="w-8 h-8" />
  },
  {
    step: 3,
    title: "Grow With Support",
    description: "Connect with study partners, follow suggested focus areas, and celebrate your wins. Progress at your own pace.",
    icon: <Heart className="w-8 h-8" />
  }
];

const FEATURES = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Clear Grade Tracking",
    description: "Keep all your results in one place. See your progress over time with simple charts and comparisons.",
    color: "lime"
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Anonymous Benchmarking",
    description: "Understand where you stand without the stress. Compare progress within your cohort privately and fairly.",
    color: "emerald"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Supportive Community",
    description: "Find study partners who match your goals and subjects. Learn together, help each other improve.",
    color: "cyan"
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Smart Suggestions",
    description: "Get personalized recommendations based on your performance patterns. Focus on what matters most.",
    color: "violet"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy Protected",
    description: "Your data stays yours. We never share personal information without your permission. Built with care.",
    color: "blue"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Goal Setting",
    description: "Set realistic targets, track milestones, and celebrate achievements. Small steps lead to big wins.",
    color: "amber"
  }
];

const FAQS = [
  {
    question: "How accurate is the benchmarking?",
    answer: "Our data comes from real students across Singapore. We use statistical methods to ensure fair comparisons within your specific cohort and subjects. Results are updated regularly to stay current."
  },
  {
    question: "Is my information really private?",
    answer: "Yes. We encrypt all data and follow Singapore's Personal Data Protection Act (PDPA). Your grades are anonymized for comparisons—no one can identify you. You control what you share and can delete your account anytime."
  },
  {
    question: "Which schools and subjects are included?",
    answer: "We work with secondary schools, junior colleges, and international schools across Singapore. All major subjects for O-Level, A-Level, and IB are supported. Don't see yours? Let us know and we'll add it."
  },
  {
    question: "Can my parents or teachers see my grades?",
    answer: "Only if you choose to share. By default, your account is private. There's an optional parent access feature if you want to give them visibility, but you're always in control."
  },
  {
    question: "What if my school isn't using Outrank yet?",
    answer: "No problem! You can manually enter your grades. We're constantly adding new schools, and you can request yours to be integrated next."
  },
  {
    question: "Is there a mobile version?",
    answer: "Our website works great on phones and tablets. We're also building dedicated mobile apps that will launch soon with additional features like offline access."
  }
];

function Modal({ type, onClose, setActiveModal }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, [type]);

  const modalContent: Record<ModalType, React.ReactElement> = {
    features: (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Tools designed to support your academic journey, not add pressure</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={i} 
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8 hover:border-lime-400/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-14 h-14 bg-${feature.color}-500/10 rounded-xl flex items-center justify-center mb-6 text-${feature.color}-400`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-slate-800/50 to-lime-900/10 backdrop-blur border border-lime-500/20 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-6">Built With Care</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Honest predictions</p>
                  <p className="text-gray-400 text-sm">Based on real data, not inflated promises</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Personalized guidance</p>
                  <p className="text-gray-400 text-sm">Recommendations that adapt to your learning style</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Progress tracking</p>
                  <p className="text-gray-400 text-sm">See how far you&apos;ve come, not just where you&apos;re going</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Wellbeing focused</p>
                  <p className="text-gray-400 text-sm">Alerts when study patterns suggest you need a break</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    testimonials: (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Real Stories, Real Progress</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">From students across Singapore who found clarity and confidence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed text-sm sm:text-base">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-400">{testimonial.school}</p>
                  </div>
                  <div className="px-4 py-2 bg-lime-500/10 text-lime-400 rounded-full text-sm font-medium border border-lime-500/20">
                    {testimonial.improvement}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-gray-400">Join thousands of students finding their path forward</p>
          </div>
        </div>
      </div>
    ),
    'how-it-works': (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Simple. Private. Effective.</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Three steps to understanding your academic progress</p>
          </div>
          <div className="space-y-8 mb-12">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div 
                key={i} 
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8 flex gap-8 items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="flex-shrink-0 w-16 h-16 bg-lime-500/10 rounded-xl flex items-center justify-center border border-lime-500/20">
                  <span className="text-3xl font-bold text-lime-400">{step.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-base sm:text-lg">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-lime-500/10 to-emerald-500/10 border border-lime-500/20 rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-lg sm:text-xl text-gray-300 mb-6">Ready to start your journey?</p>
            <button className="px-10 py-4 bg-lime-400 text-slate-900 font-bold rounded-xl hover:bg-lime-300 transition-colors text-base sm:text-lg">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    ),
    schools: (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Schools We Support</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Working with institutions across Singapore to support every student&apos;s journey</p>
          </div>
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <School className="w-7 h-7 text-lime-400" />
                <h3 className="text-xl sm:text-2xl font-bold">Secondary Schools</h3>
                <span className="text-gray-500">({SCHOOLS.secondary.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {SCHOOLS.secondary.map((school, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-center hover:border-lime-400/50 transition-all"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <div className="font-bold text-lime-400 mb-2">{school.code}</div>
                    <div className="text-xs text-gray-400 leading-tight">{school.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-7 h-7 text-cyan-400" />
                <h3 className="text-xl sm:text-2xl font-bold">Junior Colleges</h3>
                <span className="text-gray-500">({SCHOOLS.jc.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {SCHOOLS.jc.map((school, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-center hover:border-cyan-400/50 transition-all"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <div className="font-bold text-cyan-400 mb-2">{school.code}</div>
                    <div className="text-xs text-gray-400 leading-tight">{school.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-7 h-7 text-violet-400" />
                <h3 className="text-xl sm:text-2xl font-bold">International Programs</h3>
                <span className="text-gray-500">({SCHOOLS.ib.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {SCHOOLS.ib.map((school, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-center hover:border-violet-400/50 transition-all"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <div className="font-bold text-violet-400 mb-2">{school.code}</div>
                    <div className="text-xs text-gray-400 leading-tight">{school.name}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center pt-12">
            <p className="text-gray-400 mb-4">Don&apos;t see your school listed?</p>
            <button className="text-lime-400 hover:text-lime-300 underline font-medium">Request to add your school</button>
          </div>
        </div>
      </div>
    ),
    about: (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Built by students who wished they had this tool</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-12">
            <p className="text-gray-300 mb-6 leading-relaxed text-base sm:text-lg">
              Outrank started in 2024 when a group of students realized something was broken. Too many of us were stressed, comparing ourselves to others, and had no idea if our hard work was actually paying off.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed text-base sm:text-lg">
              We wanted to create a tool that gives you honest feedback without the pressure—a place where you can track your progress, understand your strengths, and get support when you need it.
            </p>
            <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
              Today, thousands of students across Singapore use Outrank to navigate their academic journey with confidence. We&apos;re here to support you, not judge you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-lime-400 mb-2">12K+</div>
              <div className="text-gray-400">Active Students</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">40+</div>
              <div className="text-gray-400">Partner Schools</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-violet-400 mb-2">250K+</div>
              <div className="text-gray-400">Grades Tracked</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800/50 to-lime-900/10 backdrop-blur border border-lime-500/20 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-6">What We Believe</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Heart className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-base sm:text-lg mb-1">Education should empower, not overwhelm</div>
                  <div className="text-gray-400">We design tools that reduce stress, not add to it</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-base sm:text-lg mb-1">Your privacy matters</div>
                  <div className="text-gray-400">We never sell data and keep everything secure</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Users className="w-6 h-6 text-lime-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-base sm:text-lg mb-1">We&apos;re all in this together</div>
                  <div className="text-gray-400">Success isn&apos;t a competition—it&apos;s a shared journey</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    pricing: (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Fair Pricing</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Always free for students. Optional plans for parents and schools.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-gradient-to-br from-lime-500/10 to-emerald-500/10 border-2 border-lime-400/50 rounded-2xl p-6 sm:p-8 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-lime-400 text-slate-900 text-sm font-bold rounded-full">
                FOR STUDENTS
              </div>
              <div className="text-center mb-8 pt-4">
                <h3 className="text-xl sm:text-2xl font-bold mb-3">Student Plan</h3>
                <div className="text-5xl font-bold text-lime-400 mb-2">Free</div>
                <p className="text-gray-400">Always free, forever</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Clear grade tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Anonymous benchmarking</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Supportive community</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Smart suggestions</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Privacy protected</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Goal setting</span>
                </li>
              </ul>
              <button className="w-full py-4 bg-lime-400 text-slate-900 font-bold rounded-xl hover:bg-lime-300 transition-colors">
                Start Free
              </button>
            </motion.div>
            <motion.div 
              className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-3">Parent Access</h3>
                <div className="text-5xl font-bold text-cyan-400 mb-2">$4.99</div>
                <p className="text-gray-400">Per month</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Everything in Student</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Progress notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Detailed reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Goal setting tools</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Priority support</span>
                </li>
              </ul>
              <button className="w-full py-4 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-colors">
                Coming Soon
              </button>
            </motion.div>
            <motion.div 
              className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-3">School Plan</h3>
                <div className="text-5xl font-bold text-violet-400 mb-2">Custom</div>
                <p className="text-gray-400">Let&apos;s talk</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Bulk student accounts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Custom analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Admin dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Integration support</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Dedicated account manager</span>
                </li>
              </ul>
              <button className="w-full py-4 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-colors">
                Contact Us
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    ),
    privacy: (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h2>
            <p className="text-gray-400">Last updated: October 31, 2025</p>
          </div>
          <div className="space-y-8 text-gray-300">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">What We Collect</h3>
              <p className="mb-4 leading-relaxed text-sm sm:text-base">We only collect what&apos;s necessary to provide our service:</p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Your academic grades and assessment results</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">School name and grade level</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Usage data to improve the platform (anonymized)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Email address (optional, for account recovery)</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">How We Use Your Data</h3>
              <p className="mb-4 leading-relaxed text-sm sm:text-base">Your information helps us provide personalized insights:</p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Generate anonymous benchmarking within your cohort</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Provide personalized study recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Match you with compatible study groups</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Improve platform features (using aggregated data only)</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Data Security</h3>
              <p className="mb-4 leading-relaxed text-sm sm:text-base">We take protection seriously:</p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">All data encrypted with industry-standard protocols</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Full compliance with Singapore&apos;s PDPA</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Regular security audits and updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">We never sell your personal information</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Your Rights</h3>
              <p className="mb-4 leading-relaxed text-sm sm:text-base">You&apos;re in control of your data:</p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Request to view all your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Correct any inaccurate information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Delete your account and data anytime</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Export your data in a portable format</span>
                </li>
              </ul>
              <p className="text-sm mt-6 pt-6 border-t border-slate-700">Contact privacy@outrank.sg for any requests. We respond within 30 days.</p>
            </div>
          </div>
        </div>
      </div>
    ),
    terms: (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Terms of Service</h2>
            <p className="text-gray-400">Last updated: October 31, 2025</p>
          </div>
          <div className="space-y-8 text-gray-300">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Agreement</h3>
              <p className="leading-relaxed text-sm sm:text-base">By using Outrank, you agree to these terms. This is a binding agreement between you and Outrank Pte Ltd.</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Your Responsibilities</h3>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Provide accurate information about your grades</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Use the platform for personal educational purposes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Respect other users and community guidelines</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-lime-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm sm:text-base">Don&apos;t attempt to access others&#39; private data</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Our Service</h3>
              <p className="leading-relaxed mb-4 text-sm sm:text-base">We provide academic tracking and analytics tools. While we work hard to be accurate, predictions are estimates based on historical data and should be used as guidance, not guarantees.</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Account Management</h3>
              <p className="leading-relaxed text-sm sm:text-base">You can delete your account at any time through the settings page. We&apos;ll remove your data within 30 days. We may suspend accounts that violate these terms.</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Questions?</h3>
              <p className="leading-relaxed text-sm sm:text-base">Contact legal@outrank.sg for any questions about these terms.</p>
            </div>
          </div>
        </div>
      </div>
    ),
    contact: (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
            <p className="text-gray-400 text-base sm:text-lg">We&apos;re here to help. Usually respond within 24 hours.</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Mail className="w-6 h-6 text-lime-400" />
              <span className="text-xl font-semibold">hello@outrank.sg</span>
            </div>
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Thanks for reaching out! We\'ll get back to you soon.'); }}>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Your Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-lime-400 focus:outline-none transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
                <input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-lime-400 focus:outline-none transition-colors" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Message</label>
                <textarea 
                  placeholder="How can we help?" 
                  rows={5} 
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-lime-400 focus:outline-none transition-colors resize-none" 
                  required 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-lime-400 text-slate-900 font-bold rounded-xl hover:bg-lime-300 transition-colors">
                Send Message
              </button>
            </form>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center text-center">
              <Phone className="w-8 h-8 text-lime-400 mb-3" />
              <p className="font-semibold mb-1">Phone</p>
              <p className="text-sm text-gray-400">+65 9123 4567</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center text-center">
              <Building2 className="w-8 h-8 text-lime-400 mb-3" />
              <p className="font-semibold mb-1">Office</p>
              <p className="text-sm text-gray-400">NUS Enterprise, Singapore</p>
            </div>
          </div>
        </div>
      </div>
    ),
    instagram: (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Instagram className="w-20 h-20 text-pink-500 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Follow Us on Instagram</h2>
            <p className="text-gray-400 text-base sm:text-lg mb-8">Daily study tips, student stories, and updates from the Outrank community</p>
            <a 
              href="https://instagram.com/outranksg" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Instagram className="w-6 h-6" />
              @outranksg
            </a>
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mt-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  className="bg-slate-800 rounded-2xl aspect-square"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    ),
    twitter: (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8 py-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Twitter className="w-20 h-20 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Follow Us on X</h2>
            <p className="text-gray-400 text-base sm:text-lg mb-8">Real-time updates, education insights, and quick tips</p>
            <a 
              href="https://twitter.com/outranksg" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Twitter className="w-6 h-6" />
              @outranksg
            </a>
            <div className="space-y-4 max-w-md mx-auto mt-12">
              <motion.div 
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-gray-300 mb-3 text-sm sm:text-base">&quot;Outrank helped me see my progress clearly. Went from doubting myself to feeling confident about my studies.&quot;</p>
                <p className="text-sm text-gray-500">- @studentlife2025</p>
              </motion.div>
              <motion.div 
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-gray-300 mb-3 text-sm sm:text-base">&quot;Finally, a platform that treats students like humans, not just data points. Privacy-first approach is refreshing.&quot;</p>
                <p className="text-sm text-gray-500">- @sgteenstudent</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    ),
    faqs: (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Common Questions</h2>
            <p className="text-gray-400 text-base sm:text-lg">Everything you need to know about Outrank</p>
          </div>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <motion.div 
                key={i} 
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <button 
              onClick={() => setActiveModal('contact')} 
              className="text-lime-400 hover:text-lime-300 font-medium underline"
            >
              Get in touch with us
            </button>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen">
        <button
          onClick={onClose}
          className="fixed top-6 right-6 z-50 text-gray-400 hover:text-white transition-all p-3 rounded-full hover:bg-slate-800/50 backdrop-blur"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <div ref={modalRef} tabIndex={-1}>
          {modalContent[type]}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [studentCount, setStudentCount] = useState(12000);
  const [schoolCount, setSchoolCount] = useState(40);
  const [assessmentCount, setAssessmentCount] = useState(250000);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setIsMenuOpen(false);
  };

  const closeModal = () => setActiveModal(null);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { 
      document.body.style.overflow = 'unset';
    };
  }, [activeModal]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStudentCount(prev => prev + Math.floor(Math.random() * 20));
      setSchoolCount(prev => Math.min(prev + Math.floor(Math.random() * 1), 50));
      setAssessmentCount(prev => prev + Math.floor(Math.random() * 500));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (activeModal) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeModal]);

const activities = [
  "You improved from B to A in Math this term!",
  "Your study group hit the collective goal – great teamwork!",
  "Steady progress detected: Keep it up!",
  "Milestone unlocked: 10 consistent study days!",
  "New personalized study tip for Chemistry added.",
  "Study partner request accepted – session scheduled.",
  "Parent praised your recent improvement in English.",
  "You earned a badge for logging grades weekly.",
  "Your Biology quiz score jumped 12 points!",
  "Completed a full revision cycle for Physics.",
  "New goal set: Aim for top 20% in class rankings.",
  "Flashcard mastery level reached for History dates.",
  "Weekly reflection journal entry saved successfully.",
  "Connected with a new study buddy from your school.",
  "Achievement: Read 5 chapters ahead of schedule.",
  "Positive feedback from teacher on group project.",
  "Your motivation streak is now 21 days strong!",
  "Unlocked premium study playlist recommendation.",
  "Progress report shared with guardian – thumbs up!",
  "Mastered a tricky Economics concept today.",
  "Study session timer hit 2 hours uninterrupted."
];

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = '/onboarding';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AnimatePresence>
        {activeModal && <Modal type={activeModal} onClose={closeModal} setActiveModal={setActiveModal} />}
      </AnimatePresence>

      <motion.header 
        ref={headerRef} 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-800' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div 
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            Outrank
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-6">
            <motion.button onClick={() => openModal('features')} className="text-gray-400 hover:text-white transition-colors" whileHover={{ y: -2 }}>Features</motion.button>
            <motion.button onClick={() => openModal('schools')} className="text-gray-400 hover:text-white transition-colors" whileHover={{ y: -2 }}>Schools</motion.button>
            <motion.button onClick={() => openModal('how-it-works')} className="text-gray-400 hover:text-white transition-colors" whileHover={{ y: -2 }}>How It Works</motion.button>
            <motion.button onClick={() => openModal('about')} className="text-gray-400 hover:text-white transition-colors" whileHover={{ y: -2 }}>About</motion.button>
            <motion.button 
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-lime-400 text-slate-900 font-bold rounded-lg hover:bg-lime-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Launch App
            </motion.button>
          </nav>

          <motion.button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav 
              className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-col px-4 py-6 gap-3">
                <motion.button onClick={() => { openModal('features'); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white py-3 transition-colors text-left" whileHover={{ x: 4 }}>Features</motion.button>
                <motion.button onClick={() => { openModal('schools'); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white py-3 transition-colors text-left" whileHover={{ x: 4 }}>Schools</motion.button>
                <motion.button onClick={() => { openModal('how-it-works'); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white py-3 transition-colors text-left" whileHover={{ x: 4 }}>How It Works</motion.button>
                <motion.button onClick={() => { openModal('about'); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white py-3 transition-colors text-left" whileHover={{ x: 4 }}>About</motion.button>
                <motion.button 
                  onClick={handleGetStarted}
                  className="px-6 py-3 bg-lime-400 text-slate-900 font-bold rounded-lg hover:bg-lime-300 transition-colors mt-2"
                  whileHover={{ scale: 1.05 }}
                >
                  Launch App
                </motion.button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      <section className="min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8 pt-24 md:pt-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 via-transparent to-cyan-500/5" />
        <div className="max-w-6xl mx-auto text-center w-full relative z-10">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-full mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400 font-medium">Trusted by students across Singapore</span>
          </motion.div>

          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="block sm:inline">Your Academic Journey,</span>
            <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">Clearly Mapped</span>
          </motion.h1>

          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Track your grades, understand your progress, and find support when you need it. Anonymous, private, and built for students who want clarity without pressure.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button 
              onClick={handleGetStarted}
              className="px-10 py-4 bg-lime-400 text-slate-900 font-bold rounded-xl hover:bg-lime-300 transition-colors inline-flex items-center gap-3 shadow-lg shadow-lime-400/20"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button 
              onClick={() => openModal('how-it-works')}
              className="px-10 py-4 bg-slate-800/50 backdrop-blur border border-slate-700/50 text-white font-bold rounded-xl hover:bg-slate-700/50 transition-colors"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              See How It Works
            </motion.button>
          </motion.div>

          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-lime-400" />
              <span><span className="font-semibold text-white">{studentCount.toLocaleString()}</span> students</span>
            </div>
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-lime-400" />
              <span><span className="font-semibold text-white">{schoolCount}</span> schools</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-lime-400" />
              <span><span className="font-semibold text-white">{assessmentCount.toLocaleString()}</span> grades tracked</span>
            </div>
          </motion.div>

          <motion.p 
            className="text-sm text-gray-600 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Free forever for students • Privacy protected • Made in Singapore
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Built for Your Success</h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to understand and improve your academic performance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div 
                key={i}
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 sm:p-8 hover:border-lime-400/50 transition-all cursor-pointer group"
                onClick={() => openModal('features')}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className={`w-14 h-14 bg-${feature.color}-500/10 rounded-xl flex items-center justify-center mb-6 text-${feature.color}-400 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                <div className="flex items-center gap-2 text-sm text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Simple Three-Step Process</h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Getting started takes minutes. Making progress takes dedication. We&apos;re here for both.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-lime-500/10 to-emerald-500/10 rounded-2xl flex items-center justify-center border border-lime-500/20 mb-6">
                  <div className="text-lime-400">
                    {step.icon}
                  </div>
                </div>
                <div className="font-bold text-3xl text-lime-400 mb-2">Step {step.step}</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <button 
              onClick={() => openModal('how-it-works')}
              className="text-lime-400 hover:text-lime-300 font-medium inline-flex items-center gap-2 group"
            >
              <span>See detailed walkthrough</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Stories From Our Community</h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
              Real students sharing their honest experiences with Outrank
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {TESTIMONIALS.slice(0, 6).map((testimonial, i) => (
              <motion.div
                key={i}
                className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-amber-400/50 transition-all cursor-pointer"
                onClick={() => openModal('testimonials')}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed italic text-sm sm:text-base">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div>
                    <p className="font-semibold text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-400">{testimonial.school}</p>
                  </div>
                  <div className="px-3 py-1.5 bg-lime-500/10 text-lime-400 rounded-lg text-sm font-medium border border-lime-500/20">
                    {testimonial.improvement}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <button 
              onClick={() => openModal('testimonials')}
              className="text-lime-400 hover:text-lime-300 font-medium inline-flex items-center gap-2 group"
            >
              <span>Read more stories</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

<section className="py-24 px-4 md:px-6 lg:px-8 overflow-hidden">
  <div className="max-w-7xl mx-auto">
    <motion.h2 
      className="text-3xl sm:text-4xl md:text-5xl font-bold mb-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      Celebrating Progress Every Day
    </motion.h2>
    <div className="space-y-6">
      <motion.div className="overflow-hidden" whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
        <div className="flex animate-marquee whitespace-nowrap">
          {[...activities, ...activities].map((activity, i) => (
            <div key={i} className="flex-shrink-0 mx-4 px-6 py-4 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl min-w-max">
              <span className="text-gray-300 text-sm">{activity}</span>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div className="overflow-hidden" whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
        <div className="flex animate-marquee-reverse whitespace-nowrap">
          {[...activities, ...activities].map((activity, i) => (
            <div key={i} className="flex-shrink-0 mx-4 px-6 py-4 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl min-w-max">
              <span className="text-gray-300 text-sm">{activity}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
</section>

      <section className="py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-lime-500/10 via-transparent to-emerald-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join thousands of students who&apos;ve found clarity, confidence, and community with Outrank.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button 
                onClick={handleGetStarted}
                className="px-10 py-4 bg-lime-400 text-slate-900 font-bold rounded-xl hover:bg-lime-300 transition-colors shadow-lg shadow-lime-400/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Tracking Free
              </motion.button>
              <motion.button 
                onClick={() => openModal('about')}
                className="px-10 py-4 bg-slate-800/50 backdrop-blur border border-slate-700/50 text-white font-bold rounded-xl hover:bg-slate-700/50 transition-colors"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn Our Story
              </motion.button>
            </div>
            <p className="text-sm text-gray-500 mt-6">No credit card required • Set up in under 2 minutes</p>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 px-4 md:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <motion.div 
              className="md:col-span-1" 
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent mb-4">Outrank</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Supporting students across Singapore with honest, helpful academic insights. Built with care by students, for students.
              </p>
            </motion.div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><motion.button onClick={() => openModal('features')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>Features</motion.button></li>
                <li><motion.button onClick={() => openModal('schools')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>Schools</motion.button></li>
                <li><motion.button onClick={() => openModal('how-it-works')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>How It Works</motion.button></li>
                <li><motion.button onClick={() => openModal('pricing')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>Pricing</motion.button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><motion.button onClick={() => openModal('about')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>About</motion.button></li>
                <li><motion.button onClick={() => openModal('testimonials')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>Testimonials</motion.button></li>
                <li><motion.button onClick={() => openModal('privacy')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>Privacy</motion.button></li>
                <li><motion.button onClick={() => openModal('terms')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>Terms</motion.button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Connect</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><motion.button onClick={() => openModal('contact')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>Contact Us</motion.button></li>
                <li><motion.button onClick={() => openModal('instagram')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>Instagram</motion.button></li>
                <li><motion.button onClick={() => openModal('twitter')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>X (Twitter)</motion.button></li>
                <li><motion.button onClick={() => openModal('faqs')} className="hover:text-lime-400 transition-colors" whileHover={{ x: 2 }}>FAQs</motion.button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2025 Outrank Pte Ltd. Made with <Heart className="w-4 h-4 inline text-red-500" /> in Singapore</p>
            <div className="flex items-center gap-6">
              <button onClick={() => openModal('privacy')} className="text-gray-500 hover:text-lime-400 text-sm transition-colors">Privacy</button>
              <button onClick={() => openModal('terms')} className="text-gray-500 hover:text-lime-400 text-sm transition-colors">Terms</button>
              <button onClick={() => openModal('contact')} className="text-gray-500 hover:text-lime-400 text-sm transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>

<style jsx>{`
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee { animation: marquee linear infinite; }
  @keyframes marquee-reverse {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  .animate-marquee-reverse { animation: marquee-reverse linear infinite; }
  @media (max-width: 768px) {
    .animate-marquee, .animate-marquee-reverse { animation-duration: 10s; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`}</style>
    </div>
  );
}