"use client"

import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Users, ArrowRight, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [studentCount, setStudentCount] = useState(1247);
  const [schoolCount, setSchoolCount] = useState(18);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Animate counter on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setStudentCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scrolling activity ticker data
  const activities = [
    "Student from RI just reached 90th percentile",
    "HCI students average 84.2 in Math",
    "23 students from VJC joined today",
    "NUSH student improved Chemistry by 12 points",
    "ACS(I) cohort leading in Physics",
    "45 new grades logged in the last hour"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white overflow-x-hidden">
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">
            Outrank
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#schools" className="text-gray-300 hover:text-white transition-colors">Schools</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
            <button 
              onClick={() => window.location.href = '/onboarding'}
              className="px-6 py-2.5 bg-lime-400 text-black font-semibold rounded-full hover:bg-lime-300 transition-all hover:scale-105"
            >
              Get Started
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
            <nav className="flex flex-col px-6 py-4 gap-4">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors py-2">Features</a>
              <a href="#schools" className="text-gray-300 hover:text-white transition-colors py-2">Schools</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors py-2">About</a>
              <button 
                onClick={() => window.location.href = '/onboarding'}
                className="px-6 py-3 bg-lime-400 text-black font-semibold rounded-full hover:bg-lime-300 transition-all text-center"
              >
                Get Started
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 animate-pulse">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Live now in Singapore</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Know where you
            <br />
            <span className="bg-gradient-to-r from-lime-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              really stand
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Track grades. Compare with your cohort. See your real rank.
          </p>

          {/* Live Counter */}
          <div className="flex items-center justify-center gap-3 mb-12 text-gray-300">
            <Users size={20} className="text-lime-400" />
            <span className="text-lg">
              <span className="font-bold text-white">{studentCount.toLocaleString()}</span> students across{' '}
              <span className="font-bold text-white">{schoolCount}</span> schools
            </span>
          </div>

          {/* CTA Button */}
          <button 
            onClick={() => window.location.href = '/onboarding'}
            className="group px-10 py-5 bg-lime-400 text-black text-lg font-bold rounded-full hover:bg-lime-300 transition-all hover:scale-105 inline-flex items-center gap-3 shadow-2xl shadow-lime-400/20"
          >
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-sm text-gray-500 mt-4">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Feature Preview Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-black to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need</h2>
            <p className="text-xl text-gray-400">Three powerful views. One simple app.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 hover:border-lime-400/50 transition-all hover:scale-105">
              <div className="w-16 h-16 bg-lime-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-lime-400/20 transition-colors">
                <TrendingUp size={32} className="text-lime-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Your Dashboard</h3>
              <p className="text-gray-400 mb-6">
                See your overall average, trends, and how you're performing in each subject at a glance.
              </p>
              <div className="bg-black/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">83.2</span>
                  <span className="text-lime-400 text-sm">↑ 2.1</span>
                </div>
                <div className="h-12 flex items-end gap-1">
                  {[65, 70, 75, 80, 85, 83].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-lime-400 to-emerald-400 rounded-t" style={{height: `${h}%`}}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 hover:border-purple-400/50 transition-all hover:scale-105">
              <div className="w-16 h-16 bg-purple-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-400/20 transition-colors">
                <Award size={32} className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Your Rank</h3>
              <p className="text-gray-400 mb-6">
                Discover your percentile ranking and see how you compare with students across Singapore.
              </p>
              <div className="bg-black/50 rounded-xl p-4 border border-white/5">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    78th
                  </div>
                  <div className="text-sm text-gray-400">Percentile</div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 hover:border-cyan-400/50 transition-all hover:scale-105">
              <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-400/20 transition-colors">
                <Users size={32} className="text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">School Comparison</h3>
              <p className="text-gray-400 mb-6">
                See where your school ranks and compete with other schools across Singapore.
              </p>
              <div className="bg-black/50 rounded-xl p-4 border border-white/5 space-y-2">
                {[
                  {name: 'RI', score: 87.2, rank: 1},
                  {name: 'HCI', score: 86.8, rank: 2},
                  {name: 'Your School', score: 85.3, rank: 4, highlight: true}
                ].map((school, i) => (
                  <div key={i} className={`flex items-center justify-between text-sm ${school.highlight ? 'text-cyan-400' : 'text-gray-400'}`}>
                    <span>#{school.rank} {school.name}</span>
                    <span className="font-bold">{school.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="schools" className="py-24 px-6 bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Join students from top schools</h2>
          <p className="text-xl text-gray-400">Real-time activity from across Singapore</p>
        </div>

        {/* Scrolling Ticker */}
        <div className="relative">
          <div className="flex animate-scroll">
            {[...activities, ...activities].map((activity, i) => (
              <div key={i} className="flex-shrink-0 mx-4 px-6 py-4 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                <span className="text-gray-300">{activity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex animate-slow-scroll mt-8">
            {[...activities, ...activities].map((activity, i) => (
              <div key={i} className="flex-shrink-0 mx-4 px-6 py-4 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                <span className="text-gray-300">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-16 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                Outrank
              </div>
              <p className="text-gray-400 text-sm">
                Empowering students to reach their academic potential through data-driven insights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#schools" className="hover:text-white transition-colors">Schools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            © 2025 Outrank. All rights reserved. Made with ❤️ in Singapore.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes slow-scroll {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll {
          animation: scroll 5s linear infinite;
        }
        .animate-slow-scroll {
          animation: slow-scroll 10s linear infinite;
        }
      `}</style>
    </div>
  );
}