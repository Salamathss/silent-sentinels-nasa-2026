'use client';

import React, { useEffect, useState, useRef } from 'react';
import { sound } from '@/utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Rocket,
} from 'lucide-react';

interface TimelineSliderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  activeCount: number;
  totalCount: number;
}

const MILESTONE_YEARS = [
  { year: 1967, label: 'Surveyor 3', body: 'Moon' },
  { year: 1969, label: 'Apollo 11', body: 'Moon' },
  { year: 1971, label: 'Apollo 15 LRV', body: 'Moon' },
  { year: 1976, label: 'Viking 1', body: 'Mars' },
  { year: 2004, label: 'Spirit / Oppy', body: 'Mars' },
  { year: 2018, label: 'InSight', body: 'Mars' },
  { year: 2021, label: 'Ingenuity', body: 'Mars' },
  { year: 2024, label: 'Retirements', body: 'Mars' },
  { year: 2026, label: 'Space Apps', body: 'Present' },
];

export default function TimelineSlider({
  currentYear,
  onYearChange,
  activeCount,
  totalCount,
}: TimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = playbackSpeed === 1 ? 600 : 300;
      timerRef.current = setInterval(() => {
        onYearChange(
          currentYear < 2026
            ? currentYear + 1
            : 1967
        );
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentYear, playbackSpeed, onYearChange]);

  const togglePlay = () => {
    sound.playClick(isPlaying ? 800 : 1200);
    if (!isPlaying && currentYear >= 2026) {
      onYearChange(1967);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    sound.playClick(1000 + (val - 1967) * 10);
    onYearChange(val);
  };

  const jumpToYear = (year: number) => {
    sound.playClick(1400);
    onYearChange(year);
  };

  const resetTimeline = () => {
    sound.playClick(900);
    setIsPlaying(false);
    onYearChange(1967);
  };

  const showAllHistory = () => {
    sound.playClick(1500);
    setIsPlaying(false);
    onYearChange(2026);
  };

  const activeMilestone = MILESTONE_YEARS.find((m) => m.year === currentYear);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0F1013] p-5 shadow-2xl">
      {/* Timeline Controls Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-3.5 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] text-[#D6C7B2]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#F5F5F7]">
                CHRONOLOGICAL EXPEDITION SCRUBBER
              </span>
              <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-[#9A9AA2]">
                1967 — 2026
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#9A9AA2]">
              Filtering relics landed on or before{' '}
              <span className="text-[#F5F5F7] font-semibold">{currentYear}</span> ({activeCount} of {totalCount} active on map)
            </div>
          </div>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-mono font-medium transition-all ${
              isPlaying
                ? 'border border-[#D6C7B2] bg-[#D6C7B2]/20 text-[#D6C7B2]'
                : 'border border-white/[0.1] bg-white/[0.04] text-[#F5F5F7] hover:bg-white/[0.08]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>PAUSE TIMELINE</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>PLAY HISTORY</span>
              </>
            )}
          </button>

          <button
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : 1))}
            className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-xs font-mono text-[#9A9AA2] hover:border-white/[0.15] hover:text-[#F5F5F7] transition-colors"
            title="Toggle Playback Speed"
          >
            {playbackSpeed}x SPEED
          </button>

          <button
            onClick={resetTimeline}
            className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-1.5 text-[#9A9AA2] hover:border-white/[0.15] hover:text-[#F5F5F7] transition-colors"
            title="Reset to 1967"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={showAllHistory}
            className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-xs font-mono text-[#D6C7B2] hover:border-[#D6C7B2]/40 hover:bg-[#D6C7B2]/10 transition-colors"
            title="View All Relics (2026)"
          >
            ALL (2026)
          </button>
        </div>
      </div>

      {/* Interactive Range Slider */}
      <div className="relative px-2 pt-2 pb-5">
        {/* Selected Year Display Badge */}
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-mono text-xs text-[#5A5A62]">1967 (SURVEYOR 3)</span>
          <div className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#15161A] px-3.5 py-1 text-xs font-mono font-semibold text-[#F5F5F7] shadow-lg">
            <Rocket className="h-3.5 w-3.5 text-[#D6C7B2]" />
            <span>YEAR: {currentYear}</span>
            {activeMilestone && (
              <span className="ml-1 text-[#D6C7B2] font-normal">
                • {activeMilestone.label}
              </span>
            )}
          </div>
          <span className="font-mono text-xs text-[#5A5A62]">2026 (SPACE APPS)</span>
        </div>

        {/* Custom styled slider */}
        <div className="relative">
          <input
            type="range"
            min="1967"
            max="2026"
            value={currentYear}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer accent-[#D6C7B2] focus:outline-none"
          />

          {/* Single-tone progress fill */}
          <div
            className="absolute top-0 left-0 h-1.5 bg-[#D6C7B2] rounded-full pointer-events-none"
            style={{ width: `${((currentYear - 1967) / (2026 - 1967)) * 100}%` }}
          />
        </div>

        {/* Key Milestone Year Ticks - Exact linear percentage positioning */}
        <div className="relative mt-3.5 h-11 w-full">
          {MILESTONE_YEARS.map((m) => {
            const isReached = currentYear >= m.year;
            const isExact = currentYear === m.year;
            const percent = ((m.year - 1967) / (2026 - 1967)) * 100;

            return (
              <button
                key={m.year}
                onClick={() => jumpToYear(m.year)}
                style={{ left: `${percent}%` }}
                className={`group absolute -translate-x-1/2 flex flex-col items-center transition-all ${
                  isExact
                    ? 'scale-110 z-10'
                    : isReached
                    ? 'opacity-90 hover:opacity-100'
                    : 'opacity-40 hover:opacity-75'
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full border transition-all ${
                    isExact
                      ? 'border-[#D6C7B2] bg-[#D6C7B2] ring-2 ring-[#D6C7B2]/40 shadow-sm'
                      : isReached
                      ? 'border-[#D6C7B2]/60 bg-[#D6C7B2]'
                      : 'border-white/[0.1] bg-[#15161A]'
                  }`}
                />
                <span
                  className={`mt-1 font-mono text-[10px] ${
                    isExact
                      ? 'font-bold text-[#F5F5F7]'
                      : isReached
                      ? 'text-[#9A9AA2]'
                      : 'text-[#5A5A62]'
                  }`}
                >
                  {m.year}
                </span>
                <span
                  className={`hidden md:block text-[9px] font-mono whitespace-nowrap ${
                    isExact ? 'text-[#D6C7B2] font-medium' : 'text-[#5A5A62]'
                  }`}
                >
                  {m.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
