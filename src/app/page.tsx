"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowRight, Menu, X, CheckCircle, Shield, Mail, Instagram, Twitter, School, GraduationCap, Globe, BarChart3, Trophy, Sparkles, Star, Zap, Target, Building2, Phone, ChevronRight } from 'lucide-react';

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
    quote: "Outrank showed me exactly where I stood in H2 Math. Went from 65th to 89th percentile in one semester by focusing on the right topics.",
    author: "Rachel T.",
    school: "Raffles Institution",
    rating: 5,
    improvement: "+24%"
  },
  {
    quote: "The anonymous benchmarking removed all the stress. I could see my progress without feeling judged. Chemistry improved by 18 marks.",
    author: "Marcus L.",
    school: "Hwa Chong Institution",
    rating: 5,
    improvement: "+18 marks"
  },
  {
    quote: "As a parent, the insights were invaluable. We could see exactly where our son needed support and celebrated his wins together.",
    author: "Dr. Tan",
    school: "NUS High Parent",
    rating: 5,
    improvement: "15% avg"
  },
  {
    quote: "The grade predictions were spot-on. Helped me allocate study time properly for promos. Now in the top 10% of my cohort.",
    author: "Priya K.",
    school: "Victoria JC",
    rating: 5,
    improvement: "Top 10%"
  },
  {
    quote: "Study group matching connected me with peers who actually wanted to improve. We all moved up together.",
    author: "Wei Jie",
    school: "Nanyang JC",
    rating: 5,
    improvement: "+12%"
  },
  {
    quote: "Clean interface, solid analytics, zero fluff. Exactly what students need. My Economics ranking jumped from 70th to 92nd.",
    author: "Alicia S.",
    school: "Anglo-Chinese JC",
    rating: 5,
    improvement: "+22%"
  }
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Connect Your Grades",
    description: "Link your school portal or manually upload results. We support all major formats: O-Level, A-Level, IB, and IGCSE.",
    icon: <Zap className="w-8 h-8" />
  },
  {
    step: 2,
    title: "Get Instant Analytics",
    description: "See your percentile rankings, performance trends, and projected outcomes. Data updated in real-time from 120+ schools.",
    icon: <BarChart3 className="w-8 h-8" />
  },
  {
    step: 3,
    title: "Take Action",
    description: "Follow personalized recommendations, connect with study groups, and track improvement. Watch your rankings climb.",
    icon: <Trophy className="w-8 h-8" />
  }
];

const FEATURES = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Real-Time Dashboard",
    description: "Comprehensive grade tracking with predictive analytics. Sync seamlessly with SLS, SEAB, and school portals.",
    color: "lime"
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Percentile Rankings",
    description: "Anonymous benchmarking against your exact cohort. Know precisely where you stand in every subject.",
    color: "blue"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Study Communities",
    description: "Connect with verified peers for group study sessions. Share resources and learn collaboratively.",
    color: "purple"
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "AI Recommendations",
    description: "Machine learning models trained on 1.2M+ grades provide personalized study strategies.",
    color: "orange"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy First",
    description: "End-to-end encryption with PDPA compliance. Your data stays private and secure.",
    color: "emerald"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Goal Tracking",
    description: "Set targets, monitor progress, and celebrate achievements. Gamified learning keeps you motivated.",
    color: "cyan"
  }
];

const FAQS = [
  {
    question: "How accurate are the percentile rankings?",
    answer: "Our rankings are derived from anonymized data across 120+ schools, with 95% confidence intervals. Updated weekly to reflect the latest assessments."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We use end-to-end encryption and comply with PDPA standards. No personal data is shared without explicit consent, and you can export or delete your data anytime."
  },
  {
    question: "Which schools and curricula are supported?",
    answer: "We integrate with all major Singapore secondary schools, JCs, and IB programs. Supports O-Level, A-Level (H1/H2), IB Diploma, and IGCSE across all subjects."
  },
  {
    question: "Can parents or teachers access my data?",
    answer: "Students control access. Parents can opt-in for insights via a separate plan, but your profile remains private by default. Schools use aggregated data only."
  },
  {
    question: "What if my school isn't integrated yet?",
    answer: "Manual uploads are fully supported. Request integration for your school—over 80% of requests are fulfilled within a month."
  },
  {
    question: "Is there a mobile app?",
    answer: "Our platform is fully responsive on mobile. Native iOS and Android apps are in development, launching Q1 2026 with offline syncing."
  }
];

function Modal({ type, onClose, setActiveModal }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalRef.current?.focus();
  }, [type]);

  const colorClass = (color: string) => `text-${color}-400 border-${color}-400`;

  const modalContent: Record<ModalType, React.ReactElement> = {
    features: (
      <div className="p-6 md:p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Features</h2>
          <p className="text-gray-400 text-lg">Everything you need to excel academically</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((feature, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-lime-400 transition-all">
              <div className={`w-12 h-12 bg-${feature.color}-100 bg-opacity-10 rounded-lg flex items-center justify-center mb-4 ${colorClass(feature.color)}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Advanced Analytics Engine</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Predictive modeling for exam outcomes with 94% accuracy</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Subject-specific recommendations based on weakness analysis</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Historical trend analysis to identify improvement patterns</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-300">Burnout detection and study balance optimization</span>
            </li>
          </ul>
        </div>
      </div>
    ),
    testimonials: (
      <div className="p-6 md:p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Student Success Stories</h2>
          <p className="text-gray-400 text-lg">Real results from students across Singapore</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.school}</p>
                </div>
                <div className="px-3 py-1 bg-lime-400 bg-opacity-10 text-lime-400 rounded-full text-sm font-bold">
                  {testimonial.improvement}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center pt-4">
          <p className="text-gray-400">Join 65,000+ students who&apos;ve improved their grades with Outrank</p>
        </div>
      </div>
    ),
    'how-it-works': (
      <div className="p-6 md:p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Outrank Works</h2>
          <p className="text-gray-400 text-lg">Three simple steps to academic excellence</p>
        </div>
        <div className="space-y-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex gap-6 items-start">
              <div className="flex-shrink-0 w-14 h-14 bg-transparent bg-opacity-10 rounded-lg flex items-center justify-center text-lime-400">
                <span className="text-2xl font-bold">{step.step}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-lime-400 bg-opacity-5 border border-lime-400 border-opacity-30 rounded-lg p-6 text-center">
          <p className="text-gray-300 mb-4">Ready to start improving your grades?</p>
          <button className="px-8 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors">
            Get Started Free
          </button>
        </div>
      </div>
    ),
    schools: (
      <div className="p-6 md:p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Partner Schools</h2>
          <p className="text-gray-400 text-lg">Trusted by 120+ institutions across Singapore</p>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <School className="w-6 h-6 text-lime-400" /> 
              Secondary Schools ({SCHOOLS.secondary.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SCHOOLS.secondary.map((school, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center hover:border-lime-400 transition-all">
                  <div className="font-bold text-lime-400 mb-1">{school.code}</div>
                  <div className="text-xs text-gray-400">{school.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-400" /> 
              Junior Colleges ({SCHOOLS.jc.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SCHOOLS.jc.map((school, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center hover:border-blue-400 transition-all">
                  <div className="font-bold text-blue-400 mb-1">{school.code}</div>
                  <div className="text-xs text-gray-400">{school.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-purple-400" /> 
              IB Schools ({SCHOOLS.ib.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SCHOOLS.ib.map((school, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center hover:border-purple-400 transition-all">
                  <div className="font-bold text-purple-400 mb-1">{school.code}</div>
                  <div className="text-xs text-gray-400">{school.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center pt-4">
          <p className="text-gray-400">Don&apos;t see your school? <button className="text-lime-400 hover:underline">Request integration</button></p>
        </div>
      </div>
    ),
    about: (
      <div className="p-6 md:p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Outrank</h2>
          <p className="text-gray-400 text-lg">Built by students, for students</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <p className="text-gray-300 mb-4">
            Founded in 2024 by a team of HCI Alumni, Outrank emerged from a simple question: Why should academic progress be a mystery?
          </p>
          <p className="text-gray-300 mb-4">
            We&apos;ve built Singapore&apos;s most comprehensive academic analytics platform, now trusted by over 65,000 students across 120+ schools. Our mission is to democratize access to data-driven insights that were previously available only to a privileged few.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-lime-400 mb-2">1.2M+</div>
            <div className="text-gray-400">Grades Analyzed</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">120+</div>
            <div className="text-gray-400">Schools Integrated</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">65K+</div>
            <div className="text-gray-400">Active Students</div>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Our Values</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Transparency</div>
                <div className="text-gray-400 text-sm">Open about our methods, honest about limitations</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Privacy</div>
                <div className="text-gray-400 text-sm">Your data is yours. We never sell or share without consent</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">Excellence</div>
                <div className="text-gray-400 text-sm">Continuous improvement in product and support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    pricing: (
      <div className="p-6 md:p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-lg">Always free for students. Premium features for schools and parents.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border-2 border-lime-400 rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-lime-400 text-black text-xs font-bold rounded-full">
              MOST POPULAR
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Student</h3>
              <div className="text-4xl font-bold text-lime-400 mb-2">Free</div>
              <p className="text-gray-400">Forever</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
                <span className="text-gray-300">Unlimited grade tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
                <span className="text-gray-300">Full percentile access</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
                <span className="text-gray-300">Community features</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
                <span className="text-gray-300">AI recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-lime-400 flex-shrink-0" />
                <span className="text-gray-300">Mobile app access</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors">
              Start Free
            </button>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Parent</h3>
              <div className="text-4xl font-bold text-blue-400 mb-2">$4.99</div>
              <p className="text-gray-400">Per month</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300">All student features</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300">Progress notifications</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300">Goal setting tools</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300">Detailed reports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300">Priority support</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors">
              Coming Soon
            </button>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">School</h3>
              <div className="text-4xl font-bold text-purple-400 mb-2">Custom</div>
              <p className="text-gray-400">Contact us</p>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">Bulk student accounts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">Custom analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">Admin dashboard</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">API integration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300">Dedicated support</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    ),
    privacy: (
      <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
        <div>
          <h2 className="text-3xl font-bold mb-4">Privacy Policy</h2>
          <p className="text-gray-400 text-sm mb-4">Last updated: October 31, 2025</p>
        </div>
        <div className="space-y-6 text-gray-300">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Data We Collect</h3>
            <p className="mb-3">We collect only the minimum necessary data to provide our services:</p>
            <ul className="space-y-2 ml-4">
              <li>• Academic grades and assessment results</li>
              <li>• School affiliation and year level</li>
              <li>• Anonymized usage statistics</li>
              <li>• Account email (optional, for backup)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">How We Use Data</h3>
            <p className="mb-3">Your data powers personalized insights and benchmarking:</p>
            <ul className="space-y-2 ml-4">
              <li>• Generate percentile rankings and predictions</li>
              <li>• Provide AI-driven study recommendations</li>
              <li>• Facilitate anonymous community matching</li>
              <li>• Improve platform features (aggregated only)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Data Sharing and Security</h3>
            <p className="mb-3">We never sell your data. Sharing is limited to:</p>
            <ul className="space-y-2 ml-4">
              <li>• Opt-in parent/teacher access</li>
              <li>• Aggregated, anonymized reports for schools</li>
              <li>• Legal requirements (e.g., subpoenas, rare)</li>
            </ul>
            <p className="mb-3">Security measures include AES-256 encryption, regular audits, and SOC 2 compliance.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Your Rights</h3>
            <p className="mb-3">Under PDPA, you can:</p>
            <ul className="space-y-2 ml-4">
              <li>• Access, correct, or delete your data</li>
              <li>• Withdraw consent anytime</li>
              <li>• Request data portability</li>
              <li>• Opt out of analytics</li>
            </ul>
            <p className="text-sm">Contact privacy@outrank.sg for requests. We respond within 30 days.</p>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs text-gray-500">This policy may update; we&apos;ll notify you of material changes.</p>
          </div>
        </div>
      </div>
    ),
    terms: (
      <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
        <div>
          <h2 className="text-3xl font-bold mb-4">Terms of Service</h2>
          <p className="text-gray-400 text-sm mb-4">Last updated: October 31, 2025</p>
        </div>
        <div className="space-y-6 text-gray-300">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Acceptance</h3>
            <p className="mb-3">By using Outrank, you agree to these terms. This is a binding contract between you and Outrank Pte Ltd.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">User Responsibilities</h3>
            <p className="mb-3">You agree to:</p>
            <ul className="space-y-2 ml-4">
              <li>• Provide accurate academic data</li>
              <li>• Use the platform for personal, non-commercial purposes</li>
              <li>• Respect community guidelines (no harassment, accurate representations)</li>
              <li>• Not reverse-engineer or scrape content</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Our Services</h3>
            <p className="mb-3">We provide analytics tools &quot;as is.&quot; While we strive for accuracy, predictions are estimates based on historical data. No guarantees of academic outcomes.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Liability</h3>
            <p className="mb-3">To the fullest extent permitted by law, Outrank is not liable for indirect damages. Our total liability is capped at SGD 100.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Termination</h3>
            <p className="mb-3">We may suspend accounts for violations. You can delete your account anytime, with data removal within 30 days.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Governing Law</h3>
            <p className="mb-3">These terms are governed by Singapore law. Disputes resolved in Singapore courts.</p>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-xs text-gray-500">Questions? Contact legal@outrank.sg.</p>
          </div>
        </div>
      </div>
    ),
    contact: (
      <div className="p-6 md:p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-gray-400 text-lg mb-6">We&apos;re here to help—response within 24 hours</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-lime-400" />
            <span className="text-lg font-bold">hello@outrank.sg</span>
          </div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
            <input type="text" placeholder="Your Name" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-lime-400 focus:outline-none transition-colors text-sm" required />
            <input type="email" placeholder="Your Email" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-lime-400 focus:outline-none transition-colors text-sm" required />
            <textarea placeholder="Your Message" rows={4} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-lime-400 focus:outline-none transition-colors text-sm" required />
            <button type="submit" className="w-full py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors">
              Send Message
            </button>
          </form>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Phone className="w-6 h-6 text-lime-400 mb-2" />
            <p className="text-sm text-gray-400">+65 9123 4567</p>
          </div>
          <div className="flex flex-col items-center">
            <Building2 className="w-6 h-6 text-lime-400 mb-2" />
            <p className="text-sm text-gray-400">NUS Enterprise, Singapore</p>
          </div>
        </div>
      </div>
    ),
    instagram: (
      <div className="p-6 md:p-8 space-y-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Follow on Instagram</h2>
        <p className="text-gray-400 text-lg mb-6">Daily study tips, student spotlights, and promo prep guides</p>
        <a href="https://instagram.com/outranksg" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-6 py-3 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition-colors">
          <Instagram className="w-5 h-5" />
          @outranksg
        </a>
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-700 rounded-lg aspect-square" />
          ))}
        </div>
      </div>
    ),
    twitter: (
      <div className="p-6 md:p-8 space-y-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Follow on X (Twitter)</h2>
        <p className="text-gray-400 text-lg mb-6">Real-time updates, edtech discussions, and quick tips</p>
        <a href="https://twitter.com/outranksg" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
          <Twitter className="w-5 h-5" />
          @outranksg
        </a>
        <div className="space-y-3 max-w-sm mx-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left">
            <p className="text-gray-300 text-sm">&quot;Outrank&apos;s percentiles changed my study game—up 15% in one term! #SGEducation&quot;</p>
            <p className="text-xs text-gray-500 mt-2">- @hcstudent24</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-left">
            <p className="text-gray-300 text-sm">&quot;Privacy-focused and accurate. Finally, data I can trust for A-Levels.&quot;</p>
            <p className="text-xs text-gray-500 mt-2">- @vjcpeer</p>
          </div>
        </div>
      </div>
    ),
    faqs: (
      <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 text-white">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby={`${type}-title`}
    >
      <motion.div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden relative shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-all p-2 rounded-full hover:bg-slate-800"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-0 overflow-y-auto max-h-[90vh]">
          {modalContent[type] || <p className="text-center text-gray-400 py-10 text-sm">Content loading...</p>}
        </div>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const colorClass = (color: string) => `text-${color}-400 border-${color}-400`;
  const [studentCount, setStudentCount] = useState(65000);
  const [schoolCount, setSchoolCount] = useState(120);
  const [assessmentCount, setAssessmentCount] = useState(1200000);
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
      setStudentCount(prev => prev + Math.floor(Math.random() * 50));
      setSchoolCount(prev => Math.min(prev + Math.floor(Math.random() * 2), 150));
      setAssessmentCount(prev => prev + Math.floor(Math.random() * 1000));
    }, 3000);
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
    "RI Sec 4 cohort avg up 4.2% in Term 3",
    "HCI J2 student hits 95th percentile in H2 Math",
    "NUS High IB group celebrates 100% pass rate",
    "ACS(I) users log 500+ Chem assessments this week",
    "VJC promo predictions accurate to ±2%",
    "Cedar Girls' study group boosts GP by 8 points avg"
  ];

  const inclusiveActivities = [
    "First-time user from community school reaches 70th percentile",
    "Peer mentor helps 12 students improve Econs",
    "Burnout alert saves a J1 from overload",
    "Shared PYQs library hits 10K downloads",
    "Goal tracker: 85% completion across platform",
    "Anonymous Q&A resolves 200+ doubts daily"
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
            className="text-2xl md:text-3xl font-bold text-lime-400"
            whileHover={{ scale: 1.05 }}
          >
            Outrank
          </motion.div>
          
          <nav className="hidden md:flex items-center gap-8">
            <motion.button onClick={() => openModal('features')} className="text-gray-400 hover:text-white transition-all text-base" whileHover={{ x: 4 }}>Features</motion.button>
            <motion.button onClick={() => openModal('schools')} className="text-gray-400 hover:text-white transition-all text-base" whileHover={{ x: 4 }}>Schools</motion.button>
            <motion.button onClick={() => openModal('how-it-works')} className="text-gray-400 hover:text-white transition-all text-base" whileHover={{ x: 4 }}>How It Works</motion.button>
            <motion.button onClick={() => openModal('about')} className="text-gray-400 hover:text-white transition-all text-base" whileHover={{ x: 4 }}>About</motion.button>
            <motion.button onClick={() => openModal('testimonials')} className="text-gray-400 hover:text-white transition-all text-base" whileHover={{ x: 4 }}>Testimonials</motion.button>
            <motion.button 
              onClick={handleGetStarted}
              className="px-8 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors text-base justify-self-center
"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Launch App
            </motion.button>
          </nav>

          <motion.button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav 
              className="md:hidden bg-slate-900/95 border-t border-slate-800"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-col px-4 py-6 gap-4">
                <motion.button onClick={() => { openModal('features'); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white py-2 transition-colors text-base" whileHover={{ x: 4 }}>Features</motion.button>
                <motion.button onClick={() => { openModal('schools'); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white py-2 transition-colors text-base" whileHover={{ x: 4 }}>Schools</motion.button>
                <motion.button onClick={() => { openModal('how-it-works'); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white py-2 transition-colors text-base" whileHover={{ x: 4 }}>How It Works</motion.button>
                <motion.button onClick={() => { openModal('about'); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white py-2 transition-colors text-base" whileHover={{ x: 4 }}>About</motion.button>
                <motion.button onClick={() => { openModal('testimonials'); setIsMenuOpen(false); }} className="text-gray-400 hover:text-white py-2 transition-colors text-base" whileHover={{ x: 4 }}>Testimonials</motion.button>
                <motion.button 
                  onClick={handleGetStarted}
                  className="px-8 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors self-start"
                  whileHover={{ scale: 1.05 }}
                >
                  Launch App
                </motion.button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      <section className="min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8 pt-24 md:pt-28 relative">
        <div className="max-w-7xl mx-auto text-center w-full">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-ping" />
            <span className="text-sm text-gray-400 font-medium">Singapore&apos;s #1 Academic Platform</span>
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Unlock Your True
            <br />
            <span className="text-lime-400">Academic Potential</span>
          </motion.h1>

          <motion.p 
            className="text-xl lg:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Effortless grade tracking, AI-powered insights, and anonymous cohort rankings. Join 65K+ students from RI, HCI, and beyond who&apos;ve gained 12% average improvement.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 text-gray-400"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Users className="w-8 h-8 text-lime-400" />
            <span className="text-base">
              <span className="font-bold text-white">{studentCount.toLocaleString()}</span> students •{' '}
              <span className="font-bold text-white">{schoolCount}</span> schools •{' '}
              <span className="font-bold text-white">{assessmentCount.toLocaleString()}</span> assessments
            </span>
          </motion.div>

          <motion.button 
            onClick={handleGetStarted}
            className="px-12 py-4 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors inline-flex items-center gap-3 mx-auto mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.p 
            className="text-sm text-gray-500"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            No signup required • 100% free for students • Built & backed in Singapore
          </motion.p>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-lime-400">Engineered for Singapore Excellence</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Student-led innovation meets data science. Trusted by MOE schools for accurate, actionable academics.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.slice(0, 3).map((feature, i) => (
              <motion.div 
                key={i}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-lime-400 transition-all cursor-pointer"
                onClick={() => openModal('features')}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`w-12 h-12 bg-${feature.color}-100 bg-opacity-10 rounded-lg flex items-center justify-center mb-4 ${colorClass(feature.color)}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <ChevronRight className="w-4 h-4" />
                  <span>Learn more</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6 lg:px-8 bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-lime-400">From Score to Strategy in 3 Steps</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Proven workflow trusted by top IP schools. No fluff—just results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto bg-lime-400 bg-opacity-10 rounded-lg flex items-center justify-center border border-lime-400 border-opacity-30">
                  {step.icon}
                </div>
                <div className="font-bold text-2xl text-lime-400">{step.step}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-300 text-base max-w-md mx-auto">{step.description}</p>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-yellow-400">Real Impact, Real Voices</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Hear from students, parents, and educators who&apos;ve transformed their academic journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.slice(0, 6).map((testimonial, i) => (
              <motion.div
                key={i}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-yellow-400 transition-all cursor-pointer"
                onClick={() => openModal('testimonials')}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-lg">👨‍🎓</span>
                  </div>
                  <div>
                    <p className="font-bold text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-400">{testimonial.school}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 italic">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <div className="px-3 py-1 bg-lime-400 bg-opacity-10 text-lime-400 rounded-full text-xs font-bold">
                  {testimonial.improvement}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6 lg:px-8 bg-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-16 text-center text-lime-400"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Live Progress Across Singapore
          </motion.h2>
          <div className="space-y-8">
            <motion.div className="overflow-hidden h-16" whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
              <div className="flex animate-marquee whitespace-nowrap">
                {[...activities, ...activities].map((activity, i) => (
                  <div key={i} className="flex-shrink-0 mx-6 px-8 py-4 bg-slate-700 border border-slate-600 rounded-xl min-w-max">
                    <span className="text-base text-gray-300">{activity}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div className="overflow-hidden h-16" whileInView={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex animate-marquee-reverse whitespace-nowrap">
                {[...inclusiveActivities, ...inclusiveActivities].map((activity, i) => (
                  <div key={i} className="flex-shrink-0 mx-6 px-8 py-4 bg-slate-700 border border-slate-600 rounded-xl min-w-max">
                    <span className="text-base text-gray-300">{activity}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-lime-400">Ready to Outrank?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Start tracking your progress today—free, secure, and built for Singapore students.</p>
            <motion.button 
              onClick={handleGetStarted}
              className="px-12 py-4 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Get Started Free
            </motion.button>
          </motion.div>
        </div>
      </section>

      <footer className="py-16 px-4 md:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <motion.div 
              onClick={() => openModal('about')} 
              className="cursor-pointer md:col-span-1" 
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-3xl font-bold text-lime-400 mb-4">Outrank</div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Empowering Singapore students with transparent, data-driven academic excellence. Backed by NUS Enterprise.
              </p>
            </motion.div>
            <div className="md:col-span-1">
              <h4 className="text-lg font-bold mb-6 text-white">Product</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><motion.button onClick={() => openModal('features')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>Features</motion.button></li>
                <li><motion.button onClick={() => openModal('schools')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>Schools</motion.button></li>
                <li><motion.button onClick={() => openModal('how-it-works')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>How It Works</motion.button></li>
                <li><motion.button onClick={() => openModal('pricing')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>Pricing</motion.button></li>
              </ul>
            </div>
            <div className="md:col-span-1">
              <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><motion.button onClick={() => openModal('about')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>About</motion.button></li>
                <li><motion.button onClick={() => openModal('testimonials')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>Testimonials</motion.button></li>
                <li><motion.button onClick={() => openModal('privacy')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>Privacy</motion.button></li>
                <li><motion.button onClick={() => openModal('terms')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>Terms</motion.button></li>
              </ul>
            </div>
            <div className="md:col-span-1">
              <h4 className="text-lg font-bold mb-6 text-white">Connect</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><motion.button onClick={() => openModal('contact')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>Contact</motion.button></li>
                <li><motion.button onClick={() => openModal('instagram')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>Instagram</motion.button></li>
                <li><motion.button onClick={() => openModal('twitter')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>X (Twitter)</motion.button></li>
                <li><motion.button onClick={() => openModal('faqs')} className="hover:text-white transition-colors" whileHover={{ x: 4 }}>FAQs</motion.button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-gray-500 text-xs">
            © 2025 Outrank Pte Ltd. All rights reserved. Licensed under Singapore EdTech Initiative. Built with ❤️ in SG.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .animate-marquee-reverse { animation: marquee-reverse 25s linear infinite; }
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