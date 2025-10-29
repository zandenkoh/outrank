"use client"

import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Users, ArrowRight, Menu, X, XCircle, CheckCircle, BookOpen, Shield, Mail, Instagram, Twitter, School, GraduationCap, Globe } from 'lucide-react';

type ModalType = 'features' | 'schools' | 'about' | 'pricing' | 'privacy' | 'terms' | 'contact' | 'instagram' | 'twitter' | 'faqs';

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
    { code: 'NUSH', name: 'NUS High School of Math and Science' },
    { code: 'SJI', name: "St. Joseph&apos;s Institution" },
    { code: 'SCGS', name: "Singapore Chinese Girls&apos; School" },
    { code: 'MGS', name: "Methodist Girls&apos; School" },
    { code: 'CHIJ-SN', name: 'CHIJ St. Nicholas Girls School' },
    { code: 'DMSS', name: 'Dunman High School' },
    { code: 'VS', name: 'Victoria School' },
    { code: 'NYGH', name: 'Nanyang Girls High School' },
    { code: 'RGS', name: "Raffles Girls&apos; School" },
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
    { code: 'CHIJ-SJC', name: "CHIJ St. Joseph&apos;s Convent" },
    { code: 'CHIJ-TP', name: 'CHIJ Toa Payoh' },
    { code: 'CHIJ-KC', name: 'CHIJ Kellock' },
    { code: 'SNGS', name: "Singapore Nanyang Girls&apos; School" },
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
    { code: 'SASS-2', name: "St. Andrew&apos;s Secondary School" },
    { code: 'SACSS', name: "St. Anthony&apos;s Canossian Secondary School" },
    { code: 'SGSS-2', name: "St. Gabriel&apos;s Secondary School" },
    { code: 'SHSS', name: "St. Hilda&apos;s Secondary School" },
    { code: 'SMGS', name: "St. Margaret&apos;s Secondary School" },
    { code: 'SPSS-2', name: "St. Patrick&apos;s School" },
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
    { code: 'SAJC', name: "St. Andrew&apos;s Junior College" },
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

function Modal({ type, onClose, setActiveModal }: ModalProps) {
  const modalContent: Record<ModalType, React.ReactElement> = {
    features: (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8 flex items-center gap-2 md:gap-3 lg:gap-4">
          <TrendingUp className="text-lime-400 size-6 md:size-7 lg:size-8 xl:size-12" />
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 lg:p-8 hover:border-lime-400/30 transition-all">
            <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 md:mb-3 lg:mb-4">Dashboard</h3>
            <p className="text-gray-300 mb-3 md:mb-4 lg:mb-6 text-sm md:text-base lg:text-lg">Interactive overview of your academic journey.</p>
            <ul className="space-y-1.5 md:space-y-2 lg:space-y-3 text-xs md:text-sm lg:text-base text-gray-400">
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Real-time grade syncing from school portals</li>
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Trend predictions and study recommendations</li>
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Customizable widgets for subjects and goals</li>
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Dark mode and accessibility features</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 lg:p-8 hover:border-purple-400/30 transition-all">
            <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 md:mb-3 lg:mb-4">Rankings & Insights</h3>
            <p className="text-gray-300 mb-3 md:mb-4 lg:mb-6 text-sm md:text-base lg:text-lg">Benchmark your progress anonymously.</p>
            <ul className="space-y-1.5 md:space-y-2 lg:space-y-3 text-xs md:text-sm lg:text-base text-gray-400">
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Percentile rankings by subject and cohort</li>
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Comparative analytics with peers</li>
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Growth tracking with visual reports</li>
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Exportable progress certificates</li>
            </ul>
          </div>
          <div className="md:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 lg:p-8 hover:border-cyan-400/30 transition-all">
            <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 md:mb-3 lg:mb-4">Collaboration Hub</h3>
            <p className="text-gray-300 mb-3 md:mb-4 lg:mb-6 text-sm md:text-base lg:text-lg">Connect and learn together.</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm lg:text-base text-gray-400">
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Study groups and peer mentoring</li>
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Shared resource library</li>
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Live Q&A sessions</li>
              <li className="flex items-start gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 mt-0.5 md:mt-1 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 flex-shrink-0" /> Gamified challenges</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    schools: (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8 flex items-center gap-2 md:gap-3 lg:gap-4 justify-center">
          <Users className="text-cyan-400 size-6 md:size-7 lg:size-8 xl:size-12" />
          Our Schools
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-300 text-center mb-6 md:mb-8 lg:mb-12">Connect with students from these prestigious institutions across Singapore.</p>
        <div className="space-y-6 md:space-y-8 lg:space-y-12">
          <div>
            <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 md:mb-4 lg:mb-6 flex items-center gap-1.5 md:gap-2 lg:gap-2"><School className="size-5 md:size-6 lg:size-7 xl:size-8" /> Secondary Schools ({SCHOOLS.secondary.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
              {SCHOOLS.secondary.map((school, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 text-center hover:bg-lime-400/10 transition-all text-xs md:text-sm">
                  <div className="font-bold mb-0.5 md:mb-1">{school.code}</div>
                  <div className="text-gray-300 text-xs md:text-sm line-clamp-2">{school.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 md:mb-4 lg:mb-6 flex items-center gap-1.5 md:gap-2 lg:gap-2"><GraduationCap className="size-5 md:size-6 lg:size-7 xl:size-8" /> Junior Colleges ({SCHOOLS.jc.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
              {SCHOOLS.jc.map((school, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 text-center hover:bg-emerald-400/10 transition-all text-xs md:text-sm">
                  <div className="font-bold mb-0.5 md:mb-1">{school.code}</div>
                  <div className="text-gray-300 text-xs md:text-sm line-clamp-2">{school.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 md:mb-4 lg:mb-6 flex items-center gap-1.5 md:gap-2 lg:gap-2"><Globe className="size-5 md:size-6 lg:size-7 xl:size-8" /> IB Programmes ({SCHOOLS.ib.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
              {SCHOOLS.ib.map((school, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 text-center hover:bg-cyan-400/10 transition-all text-xs md:text-sm">
                  <div className="font-bold mb-0.5 md:mb-1">{school.code}</div>
                  <div className="text-gray-300 text-xs md:text-sm line-clamp-2">{school.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-center mt-6 md:mt-8 lg:mt-12 text-xs md:text-sm lg:text-base">More schools joining soon. <button onClick={onClose} className="text-lime-400 hover:underline">Join your school</button></p>
      </div>
    ),
    about: (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8">About Outrank</h2>
        <div className="bg-gradient-to-br from-lime-400/10 to-emerald-400/10 border border-lime-400/20 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 lg:p-8">
          <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-3 md:mb-4 lg:mb-6">Founded in 2024, Outrank is revolutionizing academic tracking for Singapore students.</p>
          <p className="text-gray-300 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg">Our mission: Empower every learner with transparent, motivating insights to unlock their full potential.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6 lg:mb-8">
            <div className="space-y-1.5 md:space-y-2">
              <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-lime-400">1M+</div>
              <p className="text-gray-400 text-xs md:text-sm lg:text-base">Grades Tracked</p>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-emerald-400">100+</div>
              <p className="text-gray-400 text-xs md:text-sm lg:text-base">Schools</p>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <div className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-cyan-400">50K+</div>
              <p className="text-gray-400 text-xs md:text-sm lg:text-base">Active Users</p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          <div className="bg-slate-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6">
            <h3 className="text-base md:text-lg lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">Our Team</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm lg:text-base text-gray-400">
              <li>• Student developers</li>
              <li>• Peer educators and data enthusiasts</li>
              <li>• Community-driven ambassadors</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6">
            <h3 className="text-base md:text-lg lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">Vision</h3>
            <p className="text-xs md:text-sm lg:text-base text-gray-400">A world where academic success is accessible to all, driven by community and data.</p>
          </div>
        </div>
      </div>
    ),
    pricing: (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8">Pricing</h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 lg:mb-12">Outrank is completely free for all students.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-lime-400/30 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 lg:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-lime-400/5 to-emerald-400/5 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 md:mb-3 lg:mb-4 relative z-10">Free Forever</h3>
            <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-lime-400 mb-2 md:mb-3 lg:mb-6 relative z-10">$0</p>
            <ul className="space-y-2 md:space-y-3 lg:space-y-4 text-left text-xs md:text-sm lg:text-base text-gray-300 mb-4 md:mb-6 lg:mb-8 relative z-10">
              <li className="flex items-center gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" /> Unlimited grade tracking</li>
              <li className="flex items-center gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" /> Full percentile rankings</li>
              <li className="flex items-center gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" /> Community forums & collaboration</li>
              <li className="flex items-center gap-1.5 md:gap-2 lg:gap-3"><CheckCircle className="text-green-400 w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" /> Unlimited exports & insights</li>
            </ul>
            <button className="w-full px-3 md:px-4 lg:px-6 py-2.5 md:py-3 lg:py-4 bg-lime-400 text-black font-bold rounded-lg md:rounded-xl hover:bg-lime-300 transition-all relative z-10 text-xs md:text-sm lg:text-base">Get Started Free</button>
          </div>
        </div>
      </div>
    ),
    privacy: (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8">Privacy Policy</h2>
        <div className="bg-slate-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6">
          <h3 className="text-base md:text-lg lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">Your Data, Our Commitment</h3>
          <p className="text-xs md:text-sm lg:text-base text-gray-300">We prioritize your privacy with end-to-end encryption and anonymization.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          <div className="bg-slate-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6">
            <h3 className="text-sm md:text-base lg:text-xl font-bold mb-2 md:mb-3 lg:mb-4">What We Collect</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm lg:text-base text-gray-400">
              <li>• Grades (anonymized)</li>
              <li>• School & subjects</li>
              <li>• Usage patterns (aggregated)</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6">
            <h3 className="text-sm md:text-base lg:text-xl font-bold mb-2 md:mb-3 lg:mb-4">How We Protect It</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm lg:text-base text-gray-400">
              <li>• No personal data shared</li>
              <li>• GDPR & PDPA compliant</li>
              <li>• Delete anytime</li>
            </ul>
          </div>
        </div>
        <p className="text-gray-500 mt-4 md:mt-6 lg:mt-8 text-xs md:text-sm lg:text-base">Updated: October 29, 2025</p>
      </div>
    ),
    terms: (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8">Terms of Service</h2>
        <div className="bg-slate-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6">
          <h3 className="text-base md:text-lg lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">Fair Use</h3>
          <p className="text-xs md:text-sm lg:text-base text-gray-300">Use for personal growth only. Accurate input required.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          <div className="bg-slate-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6">
            <h3 className="text-sm md:text-base lg:text-xl font-bold mb-2 md:mb-3 lg:mb-4">Responsibilities</h3>
            <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm lg:text-base text-gray-400">
              <li>• Own your data</li>
              <li>• Respect peers</li>
              <li>• No commercial use</li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6">
            <h3 className="text-sm md:text-base lg:text-xl font-bold mb-2 md:mb-3 lg:mb-4">Liability</h3>
            <p className="text-xs md:text-sm lg:text-base text-gray-400">Services provided as-is. We improve continuously.</p>
          </div>
        </div>
        <p className="text-gray-500 mt-4 md:mt-6 lg:mt-8 text-xs md:text-sm lg:text-base">Updated: October 29, 2025</p>
      </div>
    ),
    contact: (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8 text-center">Get in Touch</h2>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 lg:p-8">
          <div className="flex items-center justify-center gap-2 md:gap-3 lg:gap-4 mb-4 md:mb-6 lg:mb-8">
            <Mail className="text-lime-400 size-5 md:size-6 lg:size-7 xl:size-8" />
            <span className="text-base md:text-lg lg:text-2xl font-bold">hello@outrank.sg</span>
          </div>
          <form className="space-y-3 md:space-y-4">
            <input type="text" placeholder="Your Name" className="w-full p-2.5 md:p-3 lg:p-4 bg-slate-700 border border-white/10 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:border-lime-400 focus:outline-none transition-colors text-xs md:text-sm lg:text-base" />
            <input type="email" placeholder="Your Email" className="w-full p-2.5 md:p-3 lg:p-4 bg-slate-700 border border-white/10 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:border-lime-400 focus:outline-none transition-colors text-xs md:text-sm lg:text-base" />
            <textarea placeholder="Your Message" rows={3} className="w-full p-2.5 md:p-3 lg:p-4 bg-slate-700 border border-white/10 rounded-lg md:rounded-xl text-white placeholder-gray-400 focus:border-lime-400 focus:outline-none transition-colors text-xs md:text-sm lg:text-base" />
            <button type="submit" className="w-full px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 bg-lime-400 text-black font-bold rounded-lg md:rounded-xl hover:bg-lime-300 transition-all text-xs md:text-sm lg:text-base">Send Message</button>
          </form>
        </div>
        <p className="text-gray-400 text-center text-xs md:text-sm lg:text-base">Response within 24 hours. We&apos;re here to help!</p>
      </div>
    ),
    instagram: (
      <div className="p-4 md:p-6 lg:p-8 text-center space-y-4 md:space-y-6 lg:space-y-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8">Instagram</h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-300">Follow for tips, stories, and motivation!</p>
        <a href="https://instagram.com/outranksg" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 md:gap-2 lg:gap-3 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white font-bold rounded-lg md:rounded-xl hover:scale-105 transition-all shadow-lg text-xs md:text-sm lg:text-base">
          <Instagram className="size-4 md:size-5 lg:size-6 xl:size-7" />
          Follow @outranksg
        </a>
        <div className="grid grid-cols-3 gap-1 md:gap-2 lg:gap-4 max-w-sm md:max-w-md lg:max-w-lg mx-auto">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg md:rounded-xl aspect-square animate-pulse"></div>
          ))}
        </div>
      </div>
    ),
    twitter: (
      <div className="p-4 md:p-6 lg:p-8 text-center space-y-4 md:space-y-6 lg:space-y-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8">Twitter</h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-300">Join the conversation on education!</p>
        <a href="https://twitter.com/outranksg" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 md:gap-2 lg:gap-3 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 bg-gradient-to-r from-blue-500 to-sky-500 text-white font-bold rounded-lg md:rounded-xl hover:scale-105 transition-all shadow-lg text-xs md:text-sm lg:text-base">
          <Twitter className="size-4 md:size-5 lg:size-6 xl:size-7" />
          Follow @outranksg
        </a>
        <div className="space-y-2 md:space-y-3 lg:space-y-4 max-w-xs md:max-w-sm lg:max-w-md mx-auto">
          <div className="bg-slate-800/50 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 text-left text-xs md:text-sm lg:text-base">
            <p className="text-gray-300">&quot;Outrank changed how I study! 🚀 #AcademicWins&quot;</p>
            <p className="text-gray-500 text-xs md:text-sm mt-1.5 lg:mt-2">- @studentSG</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 text-left text-xs md:text-sm lg:text-base">
            <p className="text-gray-300">&quot;Finally see my real progress. Game-changer.&quot;</p>
            <p className="text-gray-500 text-xs md:text-sm mt-1.5 lg:mt-2">- @jcwarrior</p>
          </div>
        </div>
      </div>
    ),
    faqs: (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 md:mb-6 lg:mb-8">FAQs</h2>
        <div className="space-y-3 md:space-y-4 lg:space-y-6">
          {[
            { q: "How do rankings work?", a: "Anonymized data from verified users. Updated daily for accuracy." },
            { q: "Is data secure?", a: (
              <>
                Yes, encrypted and compliant with PDPA. See{' '}
                <button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onClose();
                    setTimeout(() => setActiveModal('privacy'), 100);
                  }}
                  className="text-lime-400 hover:underline"
                >
                  Privacy
                </button>
                .
              </>
            ) },
            { q: "Supported subjects?", a: "All A-Level, IB, and O-Level: Math, Sci, Humanities, and more." },
            { q: "Can I switch schools?", a: "Easily update in settings. Your data migrates seamlessly." },
            { q: "Is it really free?", a: "Yes, completely free forever. No hidden fees or upgrades." },
            { q: "App available?", a: "Web-first, iOS/Android apps coming Q1 2026." }
          ].map((faq, i) => (
            <div key={i} className="bg-slate-800/50 border border-white/10 rounded-lg md:rounded-2xl p-3 md:p-4 lg:p-6 hover:border-lime-400/30 transition-all">
              <h3 className="text-sm md:text-base lg:text-xl font-bold mb-1.5 md:mb-2 lg:mb-3">{faq.q}</h3>
              <p className="text-xs md:text-sm lg:text-base text-gray-300">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={onClose}>
      <div 
        className="bg-gradient-to-b from-slate-900 via-slate-800 to-black border border-white/20 rounded-none md:rounded-2xl lg:rounded-3xl w-full h-full overflow-y-auto relative shadow-2xl max-w-4xl mx-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 md:top-4 right-3 md:right-4 z-10 text-gray-400 hover:text-white transition-all p-1.5 md:p-2 rounded-full hover:bg-white/10"
        >
          <X className="size-5 md:size-6" />
        </button>
        <div className="p-4 md:p-6 lg:p-8 pb-16 md:pb-20 lg:pb-20">
          {modalContent[type] || <p className="text-center text-gray-400 py-10 md:py-20 text-xs md:text-sm lg:text-base">Content coming soon...</p>}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [studentCount, setStudentCount] = useState(1247);
  const [schoolCount, setSchoolCount] = useState(18);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setIsMenuOpen(false);
  };

  const closeModal = () => setActiveModal(null);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    }
    return () => { 
      document.body.style.overflow = 'unset';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
    };
  }, [activeModal]);

  // Animate counter
  useEffect(() => {
    const interval = setInterval(() => {
      setStudentCount(prev => prev + Math.floor(Math.random() * 3));
      setSchoolCount(prev => Math.min(prev + Math.floor(Math.random() * 1), Object.values(SCHOOLS).reduce((a, k) => a + k.length, 0)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close modal on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    if (activeModal) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeModal]);

  // Activities
  const activities = [
    "Student from RI just reached 90th percentile",
    "HCI students average 84.2 in Math",
    "23 students from VJC joined today",
    "NUSH student improved Chemistry by 12 points",
    "ACS(I) cohort leading in Physics",
    "45 new grades logged in the last hour"
  ];

  const inclusiveActivities = [
    "Student overcame math challenges to gain 8 points",
    "Study group of 6 celebrated shared progress in Biology",
    "New user from community school set inspiring goals",
    "Peer mentoring session boosted English scores by 5%",
    "First-time user tracked goals and hit 75% completion",
    "Collaborative project shared insights across classes"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white overflow-x-hidden">
      {activeModal && <Modal type={activeModal} onClose={closeModal} setActiveModal={setActiveModal} />}

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-5 flex items-center justify-between">
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Outrank
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <button onClick={() => openModal('features')} className="text-gray-300 hover:text-white transition-all hover:scale-105 text-sm lg:text-base">Features</button>
            <button onClick={() => openModal('schools')} className="text-gray-300 hover:text-white transition-all hover:scale-105 text-sm lg:text-base">Schools</button>
            <button onClick={() => openModal('about')} className="text-gray-300 hover:text-white transition-all hover:scale-105 text-sm lg:text-base">About</button>
            <button onClick={() => openModal('pricing')} className="text-gray-300 hover:text-white transition-all hover:scale-105 text-sm lg:text-base">Pricing</button>
            <button onClick={() => openModal('faqs')} className="text-gray-300 hover:text-white transition-all hover:scale-105 text-sm lg:text-base">FAQs</button>
            <button 
              onClick={() => window.location.href = '/onboarding'}
              className="px-6 md:px-8 lg:px-10 py-2 md:py-3 lg:py-4 bg-gradient-to-r from-lime-400 to-emerald-400 text-black font-bold rounded-full hover:from-lime-300 hover:to-emerald-300 transition-all hover:scale-105 shadow-lg text-sm lg:text-base"
            >
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 md:p-2.5 lg:p-3 rounded-full hover:bg-white/10 transition-colors"
          >
            {isMenuOpen ? <X size={24} className="md:size-28 lg:size-32" /> : <Menu size={24} className="md:size-28 lg:size-32" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
            <nav className="flex flex-col px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 gap-3 md:gap-4 lg:gap-5">
              <button onClick={() => openModal('features')} className="text-gray-300 hover:text-white py-2 md:py-3 transition-colors text-sm lg:text-base">Features</button>
              <button onClick={() => openModal('schools')} className="text-gray-300 hover:text-white py-2 md:py-3 transition-colors text-sm lg:text-base">Schools</button>
              <button onClick={() => openModal('about')} className="text-gray-300 hover:text-white py-2 md:py-3 transition-colors text-sm lg:text-base">About</button>
              <button onClick={() => openModal('pricing')} className="text-gray-300 hover:text-white py-2 md:py-3 transition-colors text-sm lg:text-base">Pricing</button>
              <button onClick={() => openModal('faqs')} className="text-gray-300 hover:text-white py-2 md:py-3 transition-colors text-sm lg:text-base">FAQs</button>
              <button 
                onClick={() => window.location.href = '/onboarding'}
                className="px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-gradient-to-r from-lime-400 to-emerald-400 text-black font-bold rounded-full hover:from-lime-300 hover:to-emerald-300 transition-all text-center text-sm lg:text-base mt-3"
              >
                Get Started
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8 pt-20 md:pt-24 lg:pt-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-lime-400/5 via-emerald-400/5 to-cyan-400/5 animate-pulse opacity-30"></div>
        <div className="max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 md:gap-3 lg:gap-4 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 bg-white/10 border border-white/20 rounded-full mb-6 md:mb-8 lg:mb-10 backdrop-blur-sm animate-bounce">
            <div className="w-2 h-2 md:w-3 md:h-3 lg:w-4 lg:h-4 bg-lime-400 rounded-full animate-ping"></div>
            <span className="text-sm md:text-base lg:text-lg text-gray-300 font-medium">Live in Singapore • 1M+ Grades Tracked</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black mb-6 md:mb-8 lg:mb-10 leading-tight animate-fade-in-up">
            Know where you
            <br />
            <span className="bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              truly rank
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-300 mb-6 md:mb-8 lg:mb-12 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto animate-fade-in-up animation-delay-200">
            Effortless grade tracking, cohort comparisons, and real-time insights to fuel your growth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 lg:gap-6 mb-8 md:mb-10 lg:mb-14 text-gray-300 animate-fade-in-up animation-delay-400">
            <Users size={24} className="md:size-28 lg:size-32 xl:size-36 text-lime-400" />
            <span className="text-base md:text-lg lg:text-xl">
              <span className="font-black text-white">{studentCount.toLocaleString()}</span> students from{' '}
              <span className="font-black text-white">{schoolCount}</span> schools
            </span>
          </div>

          <button 
            onClick={() => window.location.href = '/onboarding'}
            className="group relative px-8 md:px-10 lg:px-12 xl:px-16 py-4 md:py-5 lg:py-6 bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 text-black text-base md:text-lg lg:text-xl font-black rounded-full hover:scale-105 transition-all shadow-2xl shadow-lime-500/25 animate-fade-in-up animation-delay-600 inline-flex items-center gap-3 md:gap-4 lg:gap-5 overflow-hidden w-full sm:w-auto justify-center"
          >
            <span>Launch App</span>
            <ArrowRight size={24} className="md:size-28 lg:size-32 xl:size-36 group-hover:translate-x-2 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>

          <p className="text-sm md:text-base lg:text-lg text-gray-500 mt-4 md:mt-6 lg:mt-8 animate-fade-in-up animation-delay-800">No card needed • Completely free • Built by students</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 lg:py-24 xl:py-32 px-4 md:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-14 lg:mb-18 xl:mb-20">
            <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black mb-4 md:mb-6 lg:mb-8 bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Built for Excellence
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-300">Student-built tools. Community-powered motivation. Seamless everywhere.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            <div 
              className="group bg-gradient-to-br from-slate-900/50 to-slate-950/50 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 xl:p-10 hover:border-lime-400/40 transition-all hover:scale-105 cursor-pointer backdrop-blur-sm" 
              onClick={() => openModal('features')}
            >
              <div className="w-16 h-16 md:w-20 lg:w-24 xl:w-28 flex items-center justify-center mb-4 md:mb-6 lg:mb-8 group-hover:bg-lime-400/20 transition-all rounded-xl md:rounded-2xl">
                <TrendingUp size={28} className="md:size-32 lg:size-36 xl:size-40 text-lime-400" />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 md:mb-4 lg:mb-6">Smart Dashboard</h3>
              <p className="text-gray-300 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg xl:text-xl">
                Visualize trends, set goals, and get suggestions in one glance.
              </p>
              <div className="bg-black/30 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-white/5">
                <div className="flex items-baseline gap-2 md:gap-3 lg:gap-4 mb-3 md:mb-4 lg:mb-6">
                  <span className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black">84.7</span>
                  <span className="text-lime-400 text-sm md:text-base lg:text-lg">↑ 3.2</span>
                </div>
                <div className="h-10 md:h-12 lg:h-14 xl:h-16 flex items-end gap-1 md:gap-2 lg:gap-3">
                  {[70, 75, 80, 82, 85, 84].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-lime-400 to-emerald-400 rounded-t opacity-80" style={{height: `${h - 60}%`}}></div>
                  ))}
                </div>
              </div>
            </div>

            <div 
              className="group bg-gradient-to-br from-slate-900/50 to-slate-950/50 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 xl:p-10 hover:border-purple-400/40 transition-all hover:scale-105 cursor-pointer backdrop-blur-sm relative" 
              onClick={() => openModal('features')}
            >
              <div className="w-16 h-16 md:w-20 lg:w-24 xl:w-28 flex items-center justify-center mb-4 md:mb-6 lg:mb-8 group-hover:bg-purple-400/20 transition-all rounded-xl md:rounded-2xl">
                <Award size={28} className="md:size-32 lg:size-36 xl:size-40 text-purple-400" />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 md:mb-4 lg:mb-6">Percentile Power</h3>
              <p className="text-gray-300 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg xl:text-xl">
                See your exact standing and climb the ranks with confidence.
              </p>
              <div className="bg-black/30 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-white/5 text-center">
                <div className="mb-4 md:mb-6 lg:mb-8">
                  <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    82nd
                  </div>
                  <div className="text-sm md:text-base lg:text-lg text-gray-400">Percentile</div>
                </div>
                <div className="h-2 md:h-3 lg:h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[82%] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div 
              className="group bg-gradient-to-br from-slate-900/50 to-slate-950/50 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 xl:p-10 hover:border-cyan-400/40 transition-all hover:scale-105 cursor-pointer backdrop-blur-sm" 
              onClick={() => openModal('schools')}
            >
              <div className="w-16 h-16 md:w-20 lg:w-24 xl:w-28 flex items-center justify-center mb-4 md:mb-6 lg:mb-8 group-hover:bg-cyan-400/20 transition-all rounded-xl md:rounded-2xl">
                <Users size={28} className="md:size-32 lg:size-36 xl:size-40 text-cyan-400" />
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 md:mb-4 lg:mb-6">School Sync</h3>
              <p className="text-gray-300 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg xl:text-xl">
                Join your school&apos;s network and benchmark against familiar faces.
              </p>
              <div className="bg-black/30 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 border border-white/5 space-y-2 md:space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between text-base md:text-lg lg:text-xl font-bold text-cyan-400">
                  <span>Your School</span>
                  <span>Active</span>
                </div>
                <div className="h-2 md:h-3 lg:h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                </div>
                <p className="text-sm md:text-base lg:text-lg text-gray-400">Connect with {Object.values(SCHOOLS).reduce((a, k) => a + k.length, 0)}+ institutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="schools" className="py-16 md:py-20 lg:py-24 xl:py-32 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-slate-950/50 to-black/50 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto mb-10 md:mb-14 lg:mb-18 text-center">
          <h2 
            className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black mb-4 md:mb-6 lg:mb-8 cursor-pointer hover:underline transition-all" 
            onClick={() => openModal('schools')}
          >
            Thriving Communities
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-300">Real stories, real progress from Singapore&apos;s best.</p>
        </div>

        <div className="space-y-8 md:space-y-10 lg:space-y-12 xl:space-y-16">
          {/* Ticker 1: Fast left */}
          <div className="relative overflow-hidden h-16 md:h-18 lg:h-20 xl:h-24">
            <div className="flex animate-fast-scroll whitespace-nowrap">
              {[...activities, ...activities, ...activities, ...activities].map((activity, i) => (
                <div key={i} className="flex-shrink-0 mx-3 md:mx-4 lg:mx-6 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl backdrop-blur-md min-w-max">
                  <span className="text-base md:text-lg lg:text-xl text-gray-300">{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticker 2: Slow right */}
          <div className="relative overflow-hidden h-16 md:h-18 lg:h-20 xl:h-24">
            <div className="flex animate-slow-right whitespace-nowrap">
              {[...activities, ...activities, ...activities, ...activities].map((activity, i) => (
                <div key={i} className="flex-shrink-0 mx-3 md:mx-4 lg:mx-6 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl backdrop-blur-md min-w-max">
                  <span className="text-base md:text-lg lg:text-xl text-gray-300">{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticker 3: Medium left inclusive */}
          <div className="relative overflow-hidden h-16 md:h-18 lg:h-20 xl:h-24">
            <div className="flex animate-medium-scroll whitespace-nowrap">
              {[...inclusiveActivities, ...inclusiveActivities, ...inclusiveActivities].map((activity, i) => (
                <div key={i} className="flex-shrink-0 mx-3 md:mx-4 lg:mx-6 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl backdrop-blur-md min-w-max">
                  <span className="text-base md:text-lg lg:text-xl text-gray-300">{activity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticker 4: Slow right inclusive */}
          <div className="relative overflow-hidden h-16 md:h-18 lg:h-20 xl:h-24">
            <div className="flex animate-slow-right whitespace-nowrap">
              {[...inclusiveActivities, ...inclusiveActivities, ...inclusiveActivities].map((activity, i) => (
                <div key={i} className="flex-shrink-0 mx-3 md:mx-4 lg:mx-6 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl lg:rounded-3xl backdrop-blur-md min-w-max">
                  <span className="text-base md:text-lg lg:text-xl text-gray-300">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-12 md:py-16 lg:py-20 xl:py-24 px-4 md:px-6 lg:px-8 bg-black/50 border-t border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12 mb-10 md:mb-14 lg:mb-18">
            <div onClick={() => openModal('about')} className="cursor-pointer md:col-span-1">
              <div className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent mb-3 md:mb-4 lg:mb-6">
                Outrank
              </div>
              <p className="text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed">
                Transforming academics through insight, community, and innovation. Made in Singapore, for the world.
              </p>
            </div>
            <div className="md:col-span-1">
              <h4 className="text-base md:text-lg lg:text-xl font-bold mb-4 md:mb-6 lg:mb-8 text-white">Product</h4>
              <ul className="space-y-2 md:space-y-3 lg:space-y-4 text-gray-400 text-sm md:text-base lg:text-lg">
                <li><button onClick={() => openModal('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => openModal('schools')} className="hover:text-white transition-colors">Schools</button></li>
                <li><button onClick={() => openModal('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
              </ul>
            </div>
            <div className="md:col-span-1">
              <h4 className="text-base md:text-lg lg:text-xl font-bold mb-4 md:mb-6 lg:mb-8 text-white">Company</h4>
              <ul className="space-y-2 md:space-y-3 lg:space-y-4 text-gray-400 text-sm md:text-base lg:text-lg">
                <li><button onClick={() => openModal('about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => openModal('privacy')} className="hover:text-white transition-colors">Privacy</button></li>
                <li><button onClick={() => openModal('terms')} className="hover:text-white transition-colors">Terms</button></li>
              </ul>
            </div>
            <div className="md:col-span-1">
              <h4 className="text-base md:text-lg lg:text-xl font-bold mb-4 md:mb-6 lg:mb-8 text-white">Connect</h4>
              <ul className="space-y-2 md:space-y-3 lg:space-y-4 text-gray-400 text-sm md:text-base lg:text-lg">
                <li><button onClick={() => openModal('contact')} className="hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => openModal('instagram')} className="hover:text-white transition-colors">Instagram</button></li>
                <li><button onClick={() => openModal('twitter')} className="hover:text-white transition-colors">Twitter</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 md:pt-10 lg:pt-12 border-t border-white/10 text-center text-gray-500 text-sm md:text-base lg:text-lg">
            © 2025 Outrank. All rights reserved. Built with ❤️ and code in Singapore.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        @keyframes fast-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-75%); }
        }
        @keyframes medium-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes slow-right {
          0% { transform: translateX(-75%); }
          100% { transform: translateX(0); }
        }
        .animate-fast-scroll { animation: fast-scroll 15s linear infinite; }
        .animate-medium-scroll { animation: medium-scroll 25s linear infinite; }
        .animate-slow-right { animation: slow-right 30s linear infinite; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}