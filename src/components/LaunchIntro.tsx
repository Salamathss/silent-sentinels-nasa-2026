'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { sound } from '@/utils/audio';
import { FastForward } from 'lucide-react';

interface LaunchIntroProps {
  onComplete: () => void;
}

export default function LaunchIntro({ onComplete }: LaunchIntroProps) {
  const [phase, setPhase] = useState<'launch' | 'reveal'>('launch');
  const [rocketStep, setRocketStep] = useState<'ignition' | 'climb' | 'orbit'>('ignition');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const completedRef = useRef<boolean>(false);

  const finishIntro = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  }, [onComplete]);

  useEffect(() => {
    // Escape or Spacebar instantly skips
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        finishIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Initial audio cue
    sound.playClick(800);

    // Timeline:
    // 0ms: Ignition at base
    // 350ms: Climb acceleration
    const tClimb = setTimeout(() => {
      setRocketStep('climb');
      sound.playBeaconLock();
    }, 350);

    // 1100ms: Orbit transit (rocket clears top)
    const tOrbit = setTimeout(() => {
      setRocketStep('orbit');
      sound.playClick(1200);
    }, 1100);

    // 1500ms: Brand Title Reveal in center
    const tReveal = setTimeout(() => {
      setPhase('reveal');
      sound.playQuindarIntro();
    }, 1500);

    // 2900ms: Begin smooth fade out to dashboard
    const tFinish = setTimeout(() => {
      finishIntro();
    }, 2900);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(tClimb);
      clearTimeout(tOrbit);
      clearTimeout(tReveal);
      clearTimeout(tFinish);
    };
  }, [finishIntro]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#08080A] text-[#F5F5F7] select-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Architectural Grid & Concentric Orbital Guides */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="introGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            <circle cx="60" cy="60" r="0.9" fill="rgba(255,255,255,0.15)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#introGrid)" />

        {/* Concentric Trajectory Rings */}
        <g stroke="rgba(214, 199, 178, 0.12)" strokeWidth="0.8" fill="none">
          <circle cx="50%" cy="50%" r="160" strokeDasharray="3 6" />
          <circle cx="50%" cy="50%" r="300" strokeDasharray="4 8" />
          <circle cx="50%" cy="50%" r="460" strokeDasharray="6 12" />
        </g>

        {/* Center Vertical Trajectory Axis */}
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(214, 199, 178, 0.18)" strokeWidth="0.8" strokeDasharray="4 6" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="4 6" />
      </svg>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between p-6 sm:p-8 border-b border-white/[0.08]">
        <div className="flex items-center gap-3 font-mono">
          <div className="h-2 w-2 rounded-full bg-[#D6C7B2] animate-ping" />
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] text-[#F5F5F7] uppercase">
              NASA DEEP SPACE NETWORK // MISSION TRAJECTORY
            </div>
            <div className="text-[10px] text-[#5A5A62]">
              RELIC TELEMETRY SEQUENCE // TRANSIT TO MOON &amp; MARS
            </div>
          </div>
        </div>

        <button
          onClick={finishIntro}
          className="flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#D6C7B2]/40 px-3.5 py-1 text-[11px] font-mono text-[#9A9AA2] hover:text-[#F5F5F7] transition-all"
        >
          <span>SKIP INTRO</span>
          <FastForward className="h-3 w-3 text-[#D6C7B2]" />
          <span className="text-[9px] text-[#5A5A62] hidden sm:inline">[ESC]</span>
        </button>
      </div>

      {/* Center Stage: Two Sequential Experiences (Launch Ascent -> Brand Title Reveal) */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-4xl px-6 text-center">
        {phase === 'launch' ? (
          /* SEQUENCE 1: Rocket Ascending Vertically Along Telemetry Trajectory */
          <div className="relative flex flex-col items-center justify-center h-80 w-full animate-in fade-in duration-300">
            {/* Center Trajectory Beam */}
            <div className="absolute top-0 bottom-0 w-px bg-gradient-to-t from-transparent via-[#D6C7B2]/30 to-transparent h-full pointer-events-none" />

            {/* Ascending Rocket Container */}
            <div
              className={`transition-all duration-700 ease-out flex flex-col items-center ${
                rocketStep === 'ignition'
                  ? 'translate-y-24 opacity-80'
                  : rocketStep === 'climb'
                  ? '-translate-y-6 opacity-100'
                  : '-translate-y-56 opacity-0'
              }`}
            >
              {/* Minimalist Vector Rocket */}
              <svg
                width="48"
                height="96"
                viewBox="0 0 44 88"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_20px_rgba(214,199,178,0.4)]"
              >
                {/* Nosecone */}
                <path
                  d="M 22 2 C 20 12 15 24 15 36 L 29 36 C 29 24 24 12 22 2 Z"
                  fill="#F5F5F7"
                  stroke="#D6C7B2"
                  strokeWidth="1"
                />
                {/* Core Fuselage */}
                <rect x="15" y="36" width="14" height="34" fill="#0F1013" stroke="#F5F5F7" strokeWidth="1" />
                {/* Avionics Ring */}
                <line x1="15" y1="46" x2="29" y2="46" stroke="#D6C7B2" strokeWidth="1.2" />
                {/* Outrigger Fins */}
                <path d="M 15 54 L 7 70 L 15 70 Z" fill="#15161A" stroke="#D6C7B2" strokeWidth="1" />
                <path d="M 29 54 L 37 70 L 29 70 Z" fill="#15161A" stroke="#D6C7B2" strokeWidth="1" />
                {/* Engine Nozzle */}
                <polygon points="17,70 27,70 30,76 14,76" fill="#D6C7B2" stroke="#F5F5F7" strokeWidth="0.8" />
              </svg>

              {/* Champagne-Gold Exhaust Plume */}
              <div className="flex flex-col items-center -mt-0.5">
                <div className="w-3 h-12 bg-gradient-to-b from-[#D6C7B2] via-[#F5F5F7]/80 to-transparent rounded-full blur-[1px] animate-pulse" />
                <div className="w-1.5 h-28 bg-gradient-to-b from-[#D6C7B2]/80 to-transparent rounded-full -mt-5 opacity-75" />
              </div>
            </div>

            {/* Launch Telemetry Status Readout */}
            <div className="absolute bottom-2 font-mono text-center space-y-1">
              <div className="text-xl sm:text-2xl font-serif text-[#F5F5F7] tracking-wider">
                {rocketStep === 'ignition' && 'T - 00:00 IGNITION'}
                {rocketStep === 'climb' && 'T + 00:02 LIFTOFF'}
                {rocketStep === 'orbit' && 'TRANSLUNAR INJECTION'}
              </div>
              <div className="text-[10px] text-[#D6C7B2] tracking-widest uppercase">
                {rocketStep === 'ignition' && 'MAIN ENGINES ARMED // VECTOR CLIMB INITIATED'}
                {rocketStep === 'climb' && 'POSITIVE ASCENT // ASCENDING TRAJECTORY 28,000 KM/H'}
                {rocketStep === 'orbit' && 'TRANSIT CONFIRMED // TARGETING LUNAR & MARTIAN RELICS'}
              </div>
            </div>
          </div>
        ) : (
          /* SEQUENCE 2: Cinematic Brand Title Reveal */
          <div className="flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95 duration-700">
            {/* Top Eyebrow */}
            <div className="font-mono text-[10px] sm:text-xs font-semibold text-[#5A5A62] tracking-[0.25em] uppercase">
              NASA SPACE APPS CHALLENGE 2026 // CELESTIAL HERITAGE SPECIFICATION
            </div>

            {/* Monumental Serif Title */}
            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-normal text-[#F5F5F7] tracking-tight leading-none">
              SILENT SENTINELS
            </h1>

            {/* Elegant Champagne Divider */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#D6C7B2] to-transparent" />

            {/* Thematic Subtitle */}
            <p className="font-sans text-xs sm:text-sm md:text-base text-[#D6C7B2] tracking-wider uppercase max-w-xl font-light">
              Abandoned but Not Forgotten &mdash; Lunar &amp; Martian Relic Archive
            </p>

            {/* Micro Carrier Status Badge */}
            <div className="pt-2 font-mono text-[10px] text-[#9A9AA2] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2] animate-pulse" />
              <span>ORBITAL REPOSITORY ONLINE // DEEP SPACE CARRIER LOCKED</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="relative z-10 w-full max-w-5xl border-t border-white/[0.08] p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">SYSTEM</span>
          <span className="text-sm font-semibold text-[#F5F5F7]">DSN-GOLDSTONE</span>
        </div>
        <div>
          <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">RELICS</span>
          <span className="text-sm font-semibold text-[#F5F5F7]">8 CATALOGED</span>
        </div>
        <div>
          <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">DESTINATIONS</span>
          <span className="text-sm font-semibold text-[#D6C7B2]">MOON &amp; MARS</span>
        </div>
        <div>
          <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">STATUS</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2] animate-pulse" />
            <span className="text-xs font-semibold text-[#F5F5F7]">
              {phase === 'reveal' ? 'SYNCHRONIZED' : 'IN TRANSIT'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
