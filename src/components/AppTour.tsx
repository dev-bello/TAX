import React, { useState, useEffect, useCallback, createContext, useContext, useRef, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Navigation, Calculator, FileText, Calendar, Brain, TrendingUp, Sparkles } from 'lucide-react';

export interface TourStepDef {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon?: React.ReactNode;
}

// All possible tour steps across the app
const ALL_TOUR_STEPS: TourStepDef[] = [
  {
    id: 'welcome',
    targetSelector: '[data-tour="welcome"]',
    title: 'Welcome to Tax FYP!',
    content: 'Your tax management dashboard. Here you\'ll see everything at a glance — taxes owed, deadlines, and savings opportunities.',
    position: 'bottom',
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: 'tax-overview',
    targetSelector: '[data-tour="tax-overview"]',
    title: 'Your Tax Overview',
    content: 'These cards show your tax position. We calculate what you owe based on your profile and warn you about upcoming deadlines.',
    position: 'bottom',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: 'actionable-steps',
    targetSelector: '[data-tour="actionable-steps"]',
    title: 'Action Required',
    content: 'This is your to-do list. Pay taxes, file returns, or claim deductions — all with direct links to the NRS portal.',
    position: 'top',
    icon: <Calendar className="w-5 h-5" />
  },
  {
    id: 'savings-opportunity',
    targetSelector: '[data-tour="savings-opportunity"]',
    title: 'Save Money on Taxes',
    content: 'We scan for deductions you might have missed. Claim them here to reduce your tax bill.',
    position: 'top',
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    id: 'calculator',
    targetSelector: '[data-tour="calculator"]',
    title: 'Tax Calculator',
    content: 'Not sure how much tax you owe? Enter your numbers here. Hover over any field for simple explanations.',
    position: 'right',
    icon: <Calculator className="w-5 h-5" />
  },
  {
    id: 'smart-validation',
    targetSelector: '[data-tour="smart-validation"]',
    title: 'Smart Validation',
    content: 'We check your numbers as you type. If something looks off, we\'ll warn you immediately.',
    position: 'right',
    icon: <Brain className="w-5 h-5" />
  },
  {
    id: 'bank-upload',
    targetSelector: '[data-tour="bank-upload"]',
    title: 'Upload Bank Statements',
    content: 'Upload your bank statement and our AI will extract income and expenses automatically.',
    position: 'left',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'expenses',
    targetSelector: '[data-tour="expenses"]',
    title: 'Track Expenses',
    content: 'Upload receipts and we\'ll read them for you. We also match bank transactions to receipts.',
    position: 'right',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'ai-assistant',
    targetSelector: '[data-tour="ai-assistant"]',
    title: 'AI Tax Assistant',
    content: 'Stuck? Ask questions like "What is VAT?" or "How do I reduce my tax?" Our AI explains everything simply.',
    position: 'left',
    icon: <Brain className="w-5 h-5" />
  },
  {
    id: 'human-support',
    targetSelector: '[data-tour="human-support"]',
    title: 'Need a Human?',
    content: 'For complex situations, request a callback from an accountant or send them an email.',
    position: 'left',
    icon: <Navigation className="w-5 h-5" />
  },
];

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface TourContextType {
  isActive: boolean;
  startTour: () => void;
  endTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
};

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

interface TourProviderProps {
  children: React.ReactNode;
  isOnboarding?: boolean;
}

// In-memory tour tracking (resets on page refresh)
let hasSeenTour = false;

export function TourProvider({ children, isOnboarding = false }: TourProviderProps) {
  const [isActive, setIsActive] = useState(false);

  // Auto-start once after initial render (not during onboarding)
  useEffect(() => {
    if (isOnboarding) return;
    if (!hasSeenTour) {
      const t = setTimeout(() => setIsActive(true), 1200);
      return () => clearTimeout(t);
    }
  }, [isOnboarding]);

  const startTour = useCallback(() => {
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    hasSeenTour = true;
  }, []);

  return (
    <TourContext.Provider value={{ isActive, startTour, endTour }}>
      {children}
      {isActive && <TourOverlay onClose={endTour} />}
    </TourContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Overlay — dynamic steps, smooth spotlight, smart tooltip           */
/* ------------------------------------------------------------------ */

function TourOverlay({ onClose }: { onClose: () => void }) {
  const [availableSteps, setAvailableSteps] = useState<TourStepDef[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [flip, setFlip] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const currentStep = availableSteps[currentIdx] ?? null;

  /* ---- discover which steps are visible on THIS page ---- */
  useEffect(() => {
    const discovered = ALL_TOUR_STEPS.filter(s => {
      const el = document.querySelector(s.targetSelector);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    setAvailableSteps(discovered);
    setCurrentIdx(0);
  }, []);

  /* ---- smooth rect tracking via rAF ---- */
  useEffect(() => {
    if (!currentStep) return;

    const tick = () => {
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setTargetRect(prev => {
          if (!prev) return r;
          // Only update if moved more than 1px (reduces re-renders)
          const dx = Math.abs(prev.x - r.x);
          const dy = Math.abs(prev.y - r.y);
          const dw = Math.abs(prev.width - r.width);
          const dh = Math.abs(prev.height - r.height);
          if (dx > 1 || dy > 1 || dw > 1 || dh > 1) return r;
          return prev;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentStep]);

  /* ---- tooltip positioning ---- */
  useEffect(() => {
    if (!targetRect || !tooltipRef.current) return;

    const tip = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const M = 16; // margin

    const fits = {
      top: targetRect.top - tip.height - M >= M,
      bottom: targetRect.bottom + tip.height + M <= vh - M,
      left: targetRect.left - tip.width - M >= M,
      right: targetRect.right + tip.width + M <= vw - M,
    };

    let pos = currentStep!.position;
    let flipped: typeof flip = null;

    // Auto-flip if preferred position doesn't fit
    if (pos === 'bottom' && !fits.bottom) { pos = 'top'; flipped = 'bottom'; }
    else if (pos === 'top' && !fits.top) { pos = 'bottom'; flipped = 'top'; }
    else if (pos === 'right' && !fits.right) { pos = 'left'; flipped = 'right'; }
    else if (pos === 'left' && !fits.left) { pos = 'right'; flipped = 'left'; }

    let top = 0;
    let left = 0;

    switch (pos) {
      case 'top':
        top = targetRect.top - tip.height - M;
        left = targetRect.left + (targetRect.width - tip.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + M;
        left = targetRect.left + (targetRect.width - tip.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tip.height) / 2;
        left = targetRect.left - tip.width - M;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tip.height) / 2;
        left = targetRect.right + M;
        break;
    }

    // Clamp to viewport
    left = Math.max(M, Math.min(left, vw - tip.width - M));
    top = Math.max(M, Math.min(top, vh - tip.height - M));

    setTooltipPos({ top, left });
    setFlip(flipped);
  }, [targetRect, currentStep, currentIdx]);

  /* ---- scroll target into view when step changes ---- */
  useEffect(() => {
    if (!currentStep) return;
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [currentStep]);

  const next = useCallback(() => {
    if (currentIdx < availableSteps.length - 1) setCurrentIdx(i => i + 1);
    else onClose();
  }, [currentIdx, availableSteps.length, onClose]);

  const prev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  }, [currentIdx]);

  const goToStep = useCallback((idx: number) => {
    if (idx >= 0 && idx < availableSteps.length) setCurrentIdx(idx);
  }, [availableSteps.length]);

  if (availableSteps.length === 0) {
    // Nothing to tour on this page — silently close
    onClose();
    return null;
  }

  // Spotlight styles (GPU-accelerated via transform)
  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: targetRect.width + 8,
        height: targetRect.height + 8,
        transform: `translate3d(${targetRect.left - 4}px, ${targetRect.top - 4}px, 0)`,
        borderRadius: 12,
        border: '2px solid #0a6a48',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65), 0 0 20px rgba(10, 106, 72, 0.3)',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'transform 0.15s ease-out, width 0.15s ease-out, height 0.15s ease-out',
      }
    : { display: 'none' };

  return (
    <>
      {/* Backdrop click-to-close */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      {/* Spotlight hole */}
      <div style={spotlightStyle} />

      {/* Pulse ring around target */}
      {targetRect && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: 0,
            left: 0,
            width: targetRect.width + 24,
            height: targetRect.height + 24,
            transform: `translate3d(${targetRect.left - 12}px, ${targetRect.top - 12}px, 0)`,
            borderRadius: 16,
            border: '1px solid rgba(10, 106, 72, 0.3)',
            animation: 'tour-pulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-surface-container-lowest rounded-2xl shadow-2xl p-5 max-w-xs w-[90vw] animate-in fade-in zoom-in-95 duration-200"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        {/* Step dots */}
        <div className="flex gap-1.5 mb-4">
          {availableSteps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goToStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIdx
                  ? 'w-5 bg-primary'
                  : i < currentIdx
                  ? 'w-1.5 bg-primary/40'
                  : 'w-1.5 bg-outline-variant'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">{currentStep!.icon}</div>
          <h3 className="font-bold text-on-surface text-base">{currentStep!.title}</h3>
        </div>

        {/* Content */}
        <p className="text-sm text-on-surface-variant leading-relaxed mb-5">
          {currentStep!.content}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={currentIdx === 0}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentIdx === 0 ? 'opacity-0 pointer-events-none' : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="flex items-center gap-1 px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              {currentIdx === availableSteps.length - 1 ? 'Finish' : 'Next'}
              {currentIdx < availableSteps.length - 1 && <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        {/* Counter */}
        <p className="text-center text-[11px] text-on-surface-variant mt-3">
          {currentIdx + 1} of {availableSteps.length}
        </p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function resetTour() {
  hasSeenTour = false;
  window.location.reload();
}

export function isTourCompleted(): boolean {
  return hasSeenTour;
}
