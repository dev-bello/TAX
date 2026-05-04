import React, { useState, useEffect } from 'react';
import { BookOpen, Award, Star, Clock, CheckCircle2, Lock, Play, TrendingUp, Lightbulb, Trophy } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "2 min"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'basics' | 'deductions' | 'compliance' | 'planning';
  xpReward: number;
  completed: boolean;
  locked: boolean;
  content: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface UserProgress {
  totalXP: number;
  level: number;
  streakDays: number;
  lessonsCompleted: number;
  badges: string[];
  lastActive: Date;
}

const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'What is Company Income Tax?',
    description: 'Learn the basics of CIT and how it applies to your business',
    duration: '3 min',
    difficulty: 'beginner',
    category: 'basics',
    xpReward: 50,
    completed: false,
    locked: false,
    content: 'Company Income Tax (CIT) is the main tax on business profits in Nigeria. Small companies (under ₦25M revenue) pay 0%, medium companies pay 20%, and large companies pay 30%.',
  },
  {
    id: '2',
    title: 'Understanding VAT',
    description: 'Everything you need to know about Value Added Tax',
    duration: '4 min',
    difficulty: 'beginner',
    category: 'basics',
    xpReward: 50,
    completed: false,
    locked: false,
    content: 'VAT is a 7.5% tax on goods and services. If your annual turnover exceeds ₦25M, you must register for VAT and remit it monthly.',
  },
  {
    id: '3',
    title: 'Common Tax Deductions',
    description: 'Discover expenses you can claim to reduce your tax bill',
    duration: '5 min',
    difficulty: 'intermediate',
    category: 'deductions',
    xpReward: 75,
    completed: false,
    locked: false,
    content: 'Business expenses like rent, salaries, utilities, and professional fees are deductible. Keep all receipts!',
  },
  {
    id: '4',
    title: 'NRS Filing Deadlines',
    description: 'Never miss a deadline with this comprehensive guide',
    duration: '4 min',
    difficulty: 'intermediate',
    category: 'compliance',
    xpReward: 75,
    completed: false,
    locked: false,
    content: 'VAT is due by the 21st of each month. Company tax returns are due 6 months after your financial year-end. File all returns through the NRS portal at www.nrs.gov.ng.',
  },
  {
    id: '5',
    title: 'Capital Allowances Explained',
    description: 'How to claim depreciation on your business assets',
    duration: '6 min',
    difficulty: 'advanced',
    category: 'deductions',
    xpReward: 100,
    completed: false,
    locked: true,
    content: 'Capital allowances let you deduct the cost of business assets over time. Most equipment qualifies for 25% annual allowance.',
  },
  {
    id: '6',
    title: 'Tax Planning Strategies',
    description: 'Advanced techniques to legally minimize your tax',
    duration: '8 min',
    difficulty: 'advanced',
    category: 'planning',
    xpReward: 100,
    completed: false,
    locked: true,
    content: 'Timing is everything. Consider when to make large purchases and how to structure your business for optimal tax efficiency.',
  },
];

const BADGES: Badge[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: <BookOpen size={32} />,
    unlocked: false,
  },
  {
    id: 'tax_novice',
    name: 'Tax Novice',
    description: 'Complete 3 lessons',
    icon: <Star size={32} />,
    unlocked: false,
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Learn 3 days in a row',
    icon: <TrendingUp size={32} />,
    unlocked: false,
  },
  {
    id: 'tax_expert',
    name: 'Tax Expert',
    description: 'Complete all lessons',
    icon: <Trophy size={32} />,
    unlocked: false,
  },
  {
    id: 'deduction_hunter',
    name: 'Deduction Hunter',
    description: 'Complete all deduction lessons',
    icon: <Lightbulb size={32} />,
    unlocked: false,
  },
];

export default function TaxLearningCenter() {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalXP: 0,
    level: 1,
    streakDays: 0,
    lessonsCompleted: 0,
    badges: [],
    lastActive: new Date(),
  });
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBadgeDetails, setShowBadgeDetails] = useState<string | null>(null);

  // Calculate level based on XP
  const calculateLevel = (xp: number) => Math.floor(xp / 200) + 1;
  const xpToNextLevel = (level: number) => level * 200;
  const currentLevelXP = userProgress.totalXP - ((userProgress.level - 1) * 200);
  const progressPercent = (currentLevelXP / 200) * 100;

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const completeLesson = (lessonId: string, xpEarned: number) => {
    setUserProgress(prev => {
      const newXP = prev.totalXP + xpEarned;
      const newLevel = calculateLevel(newXP);
      const newLessonsCompleted = prev.lessonsCompleted + 1;
      
      // Check for badges
      const newBadges = [...prev.badges];
      if (newLessonsCompleted === 1 && !newBadges.includes('first_steps')) {
        newBadges.push('first_steps');
      }
      if (newLessonsCompleted === 3 && !newBadges.includes('tax_novice')) {
        newBadges.push('tax_novice');
      }
      if (newLessonsCompleted === LESSONS.length && !newBadges.includes('tax_expert')) {
        newBadges.push('tax_expert');
      }

      return {
        ...prev,
        totalXP: newXP,
        level: newLevel,
        lessonsCompleted: newLessonsCompleted,
        badges: newBadges,
        lastActive: new Date(),
      };
    });
    setActiveLesson(null);
  };

  const filteredLessons = selectedCategory === 'all' 
    ? LESSONS 
    : LESSONS.filter(l => l.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Lessons', count: LESSONS.length },
    { id: 'basics', name: 'Basics', count: LESSONS.filter(l => l.category === 'basics').length },
    { id: 'deductions', name: 'Deductions', count: LESSONS.filter(l => l.category === 'deductions').length },
    { id: 'compliance', name: 'Compliance', count: LESSONS.filter(l => l.category === 'compliance').length },
    { id: 'planning', name: 'Planning', count: LESSONS.filter(l => l.category === 'planning').length },
  ];

  if (activeLesson) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setActiveLesson(null)}
            className="text-primary font-semibold flex items-center gap-1"
          >
            ← Back to Lessons
          </button>
          <span className="text-sm text-on-surface-variant">{activeLesson.duration} read</span>
        </div>

        <div className="mb-6">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            activeLesson.difficulty === 'beginner' ? 'bg-tertiary/10 text-tertiary' :
            activeLesson.difficulty === 'intermediate' ? 'bg-primary/10 text-primary' :
            'bg-error/10 text-error'
          }`}>
            {activeLesson.difficulty.toUpperCase()}
          </span>
          <h2 className="text-2xl font-bold text-on-surface mt-3">{activeLesson.title}</h2>
          <p className="text-on-surface-variant mt-2">{activeLesson.description}</p>
        </div>

        <div className="prose prose-sm max-w-none mb-8">
          <div className="bg-surface-container-low p-6 rounded-2xl">
            <p className="text-on-surface leading-relaxed text-lg">{activeLesson.content}</p>
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-bold text-on-surface">Key Takeaways:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-tertiary shrink-0 mt-0.5" />
                <span className="text-on-surface-variant">Understanding the fundamental concept</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-tertiary shrink-0 mt-0.5" />
                <span className="text-on-surface-variant">How it applies to your business</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-tertiary shrink-0 mt-0.5" />
                <span className="text-on-surface-variant">Actionable next steps</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => completeLesson(activeLesson.id, activeLesson.xpReward)}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} />
          Complete Lesson (+{activeLesson.xpReward} XP)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-primary-container/20 to-tertiary-container/20 p-8 rounded-3xl border border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
              <Award size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Level {userProgress.level}</h2>
              <p className="text-on-surface-variant">{userProgress.totalXP} XP earned</p>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-on-surface-variant">Progress to Level {userProgress.level + 1}</span>
              <span className="font-medium text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              {200 - currentLevelXP} XP needed for next level
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-tertiary">{userProgress.streakDays}</div>
              <div className="text-xs text-on-surface-variant">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userProgress.lessonsCompleted}</div>
              <div className="text-xs text-on-surface-variant">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-error">{userProgress.badges.length}</div>
              <div className="text-xs text-on-surface-variant">Badges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary text-white'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {cat.name}
            <span className={`ml-2 text-xs ${selectedCategory === cat.id ? 'text-white/70' : 'text-on-surface-variant'}`}>
              ({cat.count})
            </span>
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`p-5 rounded-2xl border transition-all ${
              lesson.locked
                ? 'bg-surface-container-low/50 border-outline-variant/20 opacity-70'
                : lesson.completed
                ? 'bg-tertiary-container/10 border-tertiary/30'
                : 'bg-surface-container-lowest border-outline-variant/20 hover:border-primary/30 cursor-pointer'
            }`}
            onClick={() => !lesson.locked && !lesson.completed && startLesson(lesson)}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                lesson.difficulty === 'beginner' ? 'bg-tertiary/10 text-tertiary' :
                lesson.difficulty === 'intermediate' ? 'bg-primary/10 text-primary' :
                'bg-error/10 text-error'
              }`}>
                {lesson.difficulty.toUpperCase()}
              </span>
              {lesson.locked ? (
                <Lock size={16} className="text-outline" />
              ) : lesson.completed ? (
                <CheckCircle2 size={16} className="text-tertiary" />
              ) : (
                <Play size={16} className="text-primary" />
              )}
            </div>

            <h3 className={`font-bold mb-2 ${lesson.locked ? 'text-on-surface-variant' : 'text-on-surface'}`}>
              {lesson.title}
            </h3>
            <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{lesson.description}</p>

            <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Clock size={14} />
                {lesson.duration}
              </div>
              <span className="text-sm font-bold text-primary">+{lesson.xpReward} XP</span>
            </div>
          </div>
        ))}
      </div>

      {/* Badges Section */}
      <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
        <h3 className="font-bold text-on-surface text-xl mb-6">Your Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {BADGES.map((badge) => {
            const isUnlocked = userProgress.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl text-center transition-all cursor-pointer ${
                  isUnlocked
                    ? 'bg-tertiary-container/20 border-2 border-tertiary'
                    : 'bg-surface-container-low border-2 border-dashed border-outline-variant/30'
                }`}
                onClick={() => setShowBadgeDetails(showBadgeDetails === badge.id ? null : badge.id)}
              >
                <div className={`mb-3 ${isUnlocked ? 'text-tertiary' : 'text-outline'}`}>
                  {badge.icon}
                </div>
                <h4 className={`font-bold text-sm ${isUnlocked ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {badge.name}
                </h4>
                {showBadgeDetails === badge.id && (
                  <p className="text-xs text-on-surface-variant mt-2">{badge.description}</p>
                )}
                {isUnlocked && (
                  <div className="mt-2">
                    <span className="text-xs bg-tertiary text-white px-2 py-0.5 rounded-full">UNLOCKED</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
