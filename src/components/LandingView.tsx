import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Coins, 
  ArrowRight, 
  Lock, 
  ChevronDown, 
  CheckCircle2, 
  Layers, 
  TrendingUp,
  Cpu,
  Calendar,
  Globe,
  Award,
  Users
} from 'lucide-react';
import { AdPlacement, SponsorCarousel } from './AdPlacement';

interface LandingViewProps {
  onOpenAuth: (mode?: 'REGISTER' | 'LOGIN') => void;
}

const PARTICIPATION_GAINS = [
  {
    icon: <Sparkles className="w-6 h-6 text-amber-400" />,
    title: "Genesis Allocation & Early Positioning",
    tag: "Priority Status",
    tagColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    description: "Secure your early spot in the world's second Bitcoin project before the sovereign mainnet genesis block is minted on February 15th, 2027."
  },
  {
    icon: <Coins className="w-6 h-6 text-emerald-400" />,
    title: "Montian Eures Accumulation",
    tag: "Native Coin",
    tagColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    description: "Accumulate platform credits, point dividends, and ecosystem stakes that establish your holding position when Montian Eures officially comes live."
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
    title: "Network Referral Multipliers",
    tag: "Community Growth",
    tagColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    description: "Expand the decentralized community and receive direct participation bonuses plus milestone rewards for every verified member you onboard."
  },
  {
    icon: <Cpu className="w-6 h-6 text-purple-400" />,
    title: "Proprietary Blockchain Architecture",
    tag: "Independent Chain",
    tagColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    description: "Built on its own purpose-designed consensus ledger, delivering peer-to-peer digital scarcity without dependency on third-party host blockchains."
  }
];

const FAQS = [
  {
    question: "What is the Bellmont project?",
    answer: "Bellmont is an ongoing cryptocurrency project established as the world's second Bitcoin project. It operates on its own dedicated, sovereign blockchain engineered for true peer-to-peer transactional freedom, algorithmic scarcity, and robust decentralized security."
  },
  {
    question: "What is Montian Eures and when does it launch?",
    answer: "Montian Eures is the native home coin of the Bellmont blockchain. The official launch date for the Montian Eures mainnet and genesis distribution is scheduled for February 15th, 2027."
  },
  {
    question: "Why should I join and participate early?",
    answer: "Early participants gain priority genesis allocation, accumulation of pre-launch rewards, referral network multiplier bonuses, and guaranteed registered standing in the ecosystem leading up to the February 2027 blockchain launch."
  },
  {
    question: "Who can access the Bellmont platform?",
    answer: "Access to the platform is strictly restricted to registered members. To explore the platform, track your participation gains, and safeguard your account balance, you must register a free, verified player account."
  },
  {
    question: "How do I create an account and participate?",
    answer: "Click the Sign Up / Register button located on this page, choose your username, email, and 4-digit security PIN, and join the global Bellmont community immediately."
  }
];

export const LandingView: React.FC<LandingViewProps> = ({ onOpenAuth }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    sound.playClick();
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  const handleRegisterClick = () => {
    sound.playClick();
    onOpenAuth('REGISTER');
  };

  const handleSignInClick = () => {
    sound.playClick();
    onOpenAuth('LOGIN');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* ================= HEADER SECTION ================= */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Project Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 text-sm font-arcade">
                BM
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black tracking-tight text-base sm:text-lg text-white">Bellmont</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                  OFFICIAL
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">The 2nd Bitcoin Project</span>
            </div>
          </div>

          {/* End of Header: Sign In / Sign Up Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="header-btn-signin"
              type="button"
              onClick={handleSignInClick}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm"
            >
              Sign In
            </button>
            <button
              id="header-btn-signup"
              type="button"
              onClick={handleRegisterClick}
              className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT BODY ================= */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-14 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-600/15 via-cyan-500/15 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl w-full mx-auto space-y-12 sm:space-y-16 relative z-10">

          {/* ================= HERO & PROJECT ANNOUNCEMENT ================= */}
          <section className="text-center space-y-6 max-w-4xl mx-auto pt-2">
            {/* Blockchain Genesis Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs font-black text-emerald-300 shadow-xl backdrop-blur-md">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Proprietary Blockchain Mainnet Coming Live: <strong>15th February, 2027</strong></span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Bellmont:{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  The World’s Second Bitcoin Project
                </span>
              </h1>
              <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
                Bellmont is an ongoing cryptocurrency project launching on its own sovereign, independent blockchain with the home coin as <strong className="text-emerald-300">Montian Eures</strong>.
              </p>
            </div>

            {/* Primary Call to Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                id="hero-btn-join-now"
                type="button"
                onClick={handleRegisterClick}
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm sm:text-base transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <span>Join & Participate Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Access Notice Pill */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Platform access is exclusive to registered and verified members.</span>
            </div>
          </section>

          {/* ================= KEY PROJECT PILLARS ================= */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-2 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto sm:mx-0">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-base">Independent Blockchain</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Operating on its own decentralized consensus engine engineered from the ground up for maximum throughput and security.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-2 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto sm:mx-0">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-base">Montian Eures (Home Coin)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The native currency powering all gas, staking, and exchange operations across the ecosystem upon genesis release.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-2 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto sm:mx-0">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-white text-base">February 15, 2027</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The historic launch date marking the activation of the Montian Eures blockchain and network distribution.
              </p>
            </div>
          </section>

          {/* ================= INCITING TIPS ON PARTICIPATION GAINS ================= */}
          <section className="space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-black text-emerald-300 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Early Participant Advantages</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Gains & Rewards of Early Participation</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Why joining the Bellmont network now gives you unmatched advantages before the 2027 blockchain activation:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PARTICIPATION_GAINS.map((gain, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all backdrop-blur-md space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                      {gain.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${gain.tagColor}`}>
                      {gain.tag}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base">{gain.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{gain.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ================= FREQUENTLY ASKED QUESTIONS ================= */}
          <section className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">Project Clarity</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden transition-all shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-white text-sm sm:text-base flex items-center justify-between gap-3 cursor-pointer hover:text-emerald-300 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                        openFaqIndex === idx ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ================= BOTTOM CALL TO REGISTER BANNER ================= */}
          <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-2 relative z-10">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Be Part of the Bellmont Movement
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Register your account today to secure your standing and participate in the world’s second Bitcoin project.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleRegisterClick}
                className="w-full sm:w-auto flex-1 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Register / Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSignInClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Sign In</span>
              </button>
            </div>
          </section>

          {/* Landing Sponsor Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <AdPlacement
              zoneId={459382}
              variant="card"
              title="WPAdMngr Hyper Sponsor (Zone 459382)"
              subtitle="High-frequency monetization partner. Explore to claim priority registration perks."
              rewardLabel="HYPER #459382"
            />
            <AdPlacement
              zoneId={459383}
              variant="card"
              title="WPAdMngr Ultra Sponsor (Zone 459383)"
              subtitle="Ultra-tier gaming network partner. Direct crypto reward credits and validator boost."
              rewardLabel="ULTRA #459383"
            />
            <AdPlacement
              zoneId={459144}
              variant="card"
              title="WPAdMngr Prime Sponsor (Zone 459144)"
              subtitle="Official ecosystem sponsor partner. Explore to unlock VIP registration bonuses and gas perks."
              rewardLabel="PRIME #459144"
            />
            <AdPlacement
              zoneId={459143}
              variant="card"
              title="WPAdMngr Elite Sponsor (Zone 459143)"
              subtitle="Genesis validator partner channel. Direct reward payouts and instant credit accumulation."
              rewardLabel="ELITE #459143"
            />
          </div>

          <SponsorCarousel title="Ecosystem Sponsors & Partners" subtitle="Slide through verified sponsor networks supporting the Bellmont mainnet" />

        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026–2027 Bellmont Project. World's Second Bitcoin Project. Home Coin: Montian Eures (Live 15th Feb, 2027).</p>
      </footer>
    </div>
  );
};
