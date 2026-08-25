import React, { useState, useEffect } from 'react';
import { 
  AppView, 
  PlayerStats, 
  UserProfile, 
  LeaderboardEntry, 
  WalletTransaction 
} from './types';
import { 
  GAME_LEVELS, 
  CHARACTERS, 
  SKINS, 
  SEED_LEADERBOARDS, 
  INITIAL_PLAYER_STATS 
} from './data/gameData';
import { HeaderNavbar } from './components/HeaderNavbar';
import { LoginPage } from './components/LoginPage';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { EndlessRunnerGame } from './components/games/EndlessRunnerGame';
import { MemoryMatchGame } from './components/games/MemoryMatchGame';
import { TicTacToeGame } from './components/games/TicTacToeGame';
import { CatchNumbersGame } from './components/games/CatchNumbersGame';
import { SpellingChallengeGame } from './components/games/SpellingChallengeGame';
import { EggScratchGame } from './components/games/EggScratchGame';
import { LuckyWheelGame } from './components/games/LuckyWheelGame';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CharacterShopModal } from './components/CharacterShopModal';
import { WithdrawModal } from './components/WithdrawModal';
import { RewardsHub } from './components/RewardsHub';
import { HistoryView } from './components/HistoryView';
import { ProfileView } from './components/ProfileView';
import { WatchView } from './components/WatchView';
import { AuthModal } from './components/AuthModal';
import { sound } from './utils/audio';

const STORAGE_KEY = 'LUCKYPLAY_RUNNER_STATS_V2';
const USER_KEY = 'LUCKYPLAY_USER_PROFILE_V2';
const AUTH_KEY = 'LUCKYPLAY_AUTHENTICATED_V2';
const LEADERBOARD_KEY = 'LUCKYPLAY_LEADERBOARDS_V2';
const TRANSACTIONS_KEY = 'LUCKYPLAY_TRANSACTIONS_V2';

const DEFAULT_USER: UserProfile = {
  id: 'guest-runner-88',
  username: 'RunnerOne',
  email: 'runner@bellmont.io',
  pin: '1234',
  isGuest: false,
  avatar: '👑',
  createdAt: '2026-08-24',
  level: 1,
  gamesPlayedToday: 0,
  winStreak: 0,
  spinLockedUntil: null
};

export default function App() {
  // User Profile State (null if unauthenticated)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
    const saved = localStorage.getItem(USER_KEY);
    if (isAuth && saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  // Player Stats State
  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PLAYER_STATS;
      }
    }
    return INITIAL_PLAYER_STATS;
  });

  // Leaderboard Entries
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_LEADERBOARDS;
      }
    }
    return SEED_LEADERBOARDS;
  });

  // Wallet Transactions
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem(TRANSACTIONS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          {
            id: 1,
            description: '🎉 Welcome Starter Credit',
            amount: 10.00,
            type: 'bonus',
            date: 'Initial'
          }
        ];
      }
    }
    return [
      {
        id: 1,
        description: '🎉 Welcome Starter Credit',
        amount: 10.00,
        type: 'bonus',
        date: 'Initial'
      }
    ];
  });

  // Navigation & Modals State
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(sound.enabled);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboards));
  }, [leaderboards]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Handler: Generic Game Win Cashout
  const handleGameWin = (amount: number, description: string) => {
    setStats((prev) => ({
      ...prev,
      balance: +(prev.balance + amount).toFixed(2),
      totalCashEarned: +(prev.totalCashEarned + amount).toFixed(2),
      totalWins: prev.totalWins + 1
    }));

    setUser((prev) => ({
      ...prev,
      gamesPlayedToday: prev.gamesPlayedToday + 1,
      winStreak: prev.winStreak + 1
    }));

    const newTx: WalletTransaction = {
      id: Date.now(),
      description,
      amount,
      type: 'win',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Handler: Game Loss / Obstacle Penalty
  const handleGameLossPenalty = (penalty: number, description: string) => {
    setStats((prev) => ({
      ...prev,
      balance: Math.max(0, +(prev.balance - penalty).toFixed(2)),
      totalPenaltyPaid: +(prev.totalPenaltyPaid + penalty).toFixed(2),
      totalLosses: prev.totalLosses + 1
    }));

    setUser((prev) => ({
      ...prev,
      gamesPlayedToday: prev.gamesPlayedToday + 1,
      winStreak: 0
    }));

    const newTx: WalletTransaction = {
      id: Date.now(),
      description,
      amount: penalty,
      type: 'loss',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Handler: Daily $1.00 Claim
  const handleClaimDaily = () => {
    const claimAmount = 1.00;
    setStats((prev) => ({
      ...prev,
      balance: +(prev.balance + claimAmount).toFixed(2),
      streak: prev.streak + 1,
      lastDailyClaimTime: Date.now()
    }));

    const newTx: WalletTransaction = {
      id: Date.now(),
      description: `🎁 Daily $1.00 Streak Claim (Day ${stats.streak + 1})`,
      amount: claimAmount,
      type: 'bonus',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Handler: Crypto Withdrawal Submit
  const handleWithdrawCrypto = (amount: number, token: string, address: string) => {
    setStats((prev) => ({
      ...prev,
      balance: Math.max(0, +(prev.balance - amount).toFixed(2))
    }));

    const fakeTxHash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const newTx: WalletTransaction = {
      id: Date.now(),
      description: `💸 Crypto Withdrawal to ${token}`,
      amount,
      type: 'withdraw',
      token,
      address,
      status: 'completed',
      txHash: fakeTxHash,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Handler: Sign In / Registration
  const handleUserLogin = (newUser: UserProfile, bonusAdded?: number) => {
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(AUTH_KEY, 'true');
    setShowAuthModal(false);

    if (bonusAdded && bonusAdded > 0) {
      setStats((prev) => ({
        ...prev,
        balance: +(prev.balance + bonusAdded).toFixed(2),
        totalCashEarned: +(prev.totalCashEarned + bonusAdded).toFixed(2)
      }));

      const bonusTx: WalletTransaction = {
        id: Date.now(),
        description: `🎁 Welcome Promo Bonus Code (+$${bonusAdded.toFixed(2)})`,
        amount: bonusAdded,
        type: 'bonus',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setTransactions((prev) => [bonusTx, ...prev]);
    }

    setCurrentView('DASHBOARD');
  };

  // Handler: Sign Out (returns player to Login / Sign-up page)
  const handleSignOut = () => {
    sound.playClick();
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_KEY);
    setCurrentView('DASHBOARD');
  };

  // MANDATORY AUTHENTICATION GATE:
  // If user is not logged in / registered, strictly render the LoginPage
  if (!user) {
    return <LoginPage onLogin={handleUserLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Universal Navbar */}
      <HeaderNavbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        balance={stats.balance}
        streak={stats.streak}
        user={user}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        onOpenWithdraw={() => setShowWithdrawModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Main App Content Router */}
      <main className="flex-1 pb-24 sm:pb-28">
        {currentView === 'LANDING' && (
          <LandingView
            onStartGuest={() => setCurrentView('DASHBOARD')}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenLeaderboard={() => setShowLeaderboardModal(true)}
          />
        )}

        {currentView === 'DASHBOARD' && (
          <DashboardView
            user={user}
            stats={stats}
            setStats={setStats}
            setCurrentView={setCurrentView}
            onOpenWithdraw={() => setShowWithdrawModal(true)}
            onClaimDaily={handleClaimDaily}
          />
        )}

        {/* 🏃 Endless Runner Arena */}
        {currentView === 'GAME_RUNNER' && (
          <EndlessRunnerGame
            stats={stats}
            setStats={setStats}
            leaderboards={leaderboards}
            setLeaderboards={setLeaderboards}
            onWin={handleGameWin}
            onLossPenalty={handleGameLossPenalty}
            onBack={() => setCurrentView('DASHBOARD')}
          />
        )}

        {/* 🧠 Memory Match Challenge */}
        {currentView === 'GAME_MEMORY' && (
          <MemoryMatchGame
            onWin={handleGameWin}
            onBack={() => setCurrentView('DASHBOARD')}
            userBalance={stats.balance}
          />
        )}

        {/* ❌⭕ Tic Tac Toe AI Arena */}
        {currentView === 'GAME_TICTACTOE' && (
          <TicTacToeGame
            onWin={handleGameWin}
            onBack={() => setCurrentView('DASHBOARD')}
            userBalance={stats.balance}
          />
        )}

        {/* 🔢 Catch Numbers (3s Reflex) */}
        {currentView === 'GAME_NUMBERS' && (
          <CatchNumbersGame
            onWin={handleGameWin}
            onBack={() => setCurrentView('DASHBOARD')}
            userBalance={stats.balance}
          />
        )}

        {/* 🔤 Spelling Challenge (3s Rush) */}
        {currentView === 'GAME_SPELLING' && (
          <SpellingChallengeGame
            onWin={handleGameWin}
            onBack={() => setCurrentView('DASHBOARD')}
            userBalance={stats.balance}
          />
        )}

        {/* 🥚 Egg Scratch Matrix (1-Hour Marathon) */}
        {currentView === 'GAME_SCRATCH' && (
          <EggScratchGame
            onWin={handleGameWin}
            onBack={() => setCurrentView('DASHBOARD')}
            userBalance={stats.balance}
          />
        )}

        {/* 🎡 Lucky Wheel Spin */}
        {currentView === 'GAME_SPIN' && (
          <LuckyWheelGame
            onWin={handleGameWin}
            onBack={() => setCurrentView('DASHBOARD')}
            userBalance={stats.balance}
          />
        )}

        {/* 🎁 Rewards & Daily Hub */}
        {currentView === 'REWARDS' && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <RewardsHub
              stats={stats}
              transactions={transactions}
              onClaimDaily={handleClaimDaily}
              onOpenWithdraw={() => setShowWithdrawModal(true)}
              onOpenShop={() => setShowShopModal(true)}
              onOpenLeaderboard={() => setShowLeaderboardModal(true)}
            />
          </div>
        )}

        {/* 📜 Ledger & Transaction History */}
        {currentView === 'HISTORY' && (
          <HistoryView
            transactions={transactions}
            onBack={() => setCurrentView('DASHBOARD')}
            userBalance={stats.balance}
          />
        )}

        {/* 👤 Player Profile */}
        {currentView === 'PROFILE' && (
          <ProfileView
            user={user}
            stats={stats}
            setStats={setStats}
            onBack={() => setCurrentView('DASHBOARD')}
            onSignOut={handleSignOut}
          />
        )}

        {/* 🏆 Leaderboard Full Page */}
        {currentView === 'LEADERBOARD' && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <LeaderboardModal
              leaderboards={leaderboards}
              currentLevelId={1}
              onClose={() => setCurrentView('DASHBOARD')}
            />
          </div>
        )}

        {/* 📺 Watch Blank Page with Embedded Link */}
        {currentView === 'WATCH' && (
          <WatchView
            onBack={() => setCurrentView('DASHBOARD')}
          />
        )}
      </main>

      {/* Global Modals */}
      {showAuthModal && (
        <AuthModal
          onLogin={handleUserLogin}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          stats={stats}
          onWithdraw={handleWithdrawCrypto}
          onClose={() => setShowWithdrawModal(false)}
        />
      )}

      {showLeaderboardModal && (
        <LeaderboardModal
          leaderboards={leaderboards}
          currentLevelId={1}
          onClose={() => setShowLeaderboardModal(false)}
        />
      )}

      {showShopModal && (
        <CharacterShopModal
          stats={stats}
          setStats={setStats}
          onClose={() => setShowShopModal(false)}
        />
      )}
    </div>
  );
}
