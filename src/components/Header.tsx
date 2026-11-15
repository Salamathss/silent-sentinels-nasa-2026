'use client';

import React, { useEffect, useState } from 'react';
import { CelestialBody } from '@/data/missions';
import { sound } from '@/utils/audio';
import {
  Radio,
  Volume2,
  VolumeX,
  Clock,
  BarChart3,
  Rocket,
} from 'lucide-react';

interface HeaderProps {
  currentBody: CelestialBody;
  onBodyChange: (body: CelestialBody) => void;
  moonCount: number;
  marsCount: number;
  totalMissions: number;
  activeFilterCount: number;
  onOpenAnalytics?: () => void;
  onReplayLaunch?: () => void;
}

export default function Header({
  currentBody,
  onBodyChange,
  moonCount,
  marsCount,
  totalMissions,
  activeFilterCount,
  onOpenAnalytics,
  onReplayLaunch,
}: HeaderProps) {
  const [utcTime, setUtcTime] = useState<string>('');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    sound.setEnabled(nextState);
    if (nextState) {
      sound.playClick(1000);
    }
  };

  const handleBodySwitch = (body: CelestialBody) => {
    if (body !== currentBody) {
      sound.playRadioSquelch(0.08);
      onBodyChange(body);
    }
  };

  return (
    <header className="relative z-30 border-b border-white/[0.08] bg-[#08080A]/95 backdrop-blur-md">
      <div className="mx-auto flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between lg:px-8 max-w-[1600px]">
        {/* Project Branding - Architectural Dark Luxury */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0F1013] text-[#D6C7B2]">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-serif tracking-wider text-[#F5F5F7] font-normal">
                SILENT SENTINELS
              </h1>
              <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[9px] font-mono tracking-widest text-[#9A9AA2] uppercase">
                SPACE APPS 2026
              </span>
            </div>
            <p className="text-xs text-[#9A9AA2] font-mono">
              Lunar &amp; Martian Relic Archive <span className="text-[#5A5A62]">{'//'}</span> NASA Historical Equipment
            </p>
          </div>
        </div>

        {/* Moon vs Mars Planetary Switcher (Zero Orange, Single Champagne Accent) */}
        <div className="flex items-center justify-center">
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#0F1013] p-1">
            {/* Moon Switch */}
            <button
              onClick={() => handleBodySwitch('Moon')}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-mono font-medium transition-all ${
                currentBody === 'Moon'
                  ? 'bg-white/[0.08] text-[#F5F5F7] border border-[#D6C7B2]/40 shadow-sm'
                  : 'text-[#9A9AA2] hover:text-[#F5F5F7] border border-transparent'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  currentBody === 'Moon' ? 'bg-[#D6C7B2]' : 'bg-[#5A5A62]'
                }`}
              />
              <span>MOON</span>
              <span className="text-[10px] text-[#5A5A62] font-normal">
                {moonCount}
              </span>
            </button>

            {/* Mars Switch */}
            <button
              onClick={() => handleBodySwitch('Mars')}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-mono font-medium transition-all ${
                currentBody === 'Mars'
                  ? 'bg-white/[0.08] text-[#F5F5F7] border border-[#D6C7B2]/40 shadow-sm'
                  : 'text-[#9A9AA2] hover:text-[#F5F5F7] border border-transparent'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  currentBody === 'Mars' ? 'bg-[#D6C7B2]' : 'bg-[#5A5A62]'
                }`}
              />
              <span>MARS</span>
              <span className="text-[10px] text-[#5A5A62] font-normal">
                {marsCount}
              </span>
            </button>
          </div>
        </div>

        {/* Telemetry Stats & Audio/UTC Controls */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 font-mono text-xs">
          {/* Quick Factual Metrics */}
          <div className="hidden lg:flex items-center divide-x divide-white/[0.08] text-[11px] text-[#9A9AA2]">
            <div className="pr-3">
              <span className="text-[#5A5A62]">VISIBLE: </span>
              <span className="text-[#F5F5F7] font-medium">{activeFilterCount}</span>
              <span className="text-[#5A5A62]">/{totalMissions}</span>
            </div>
            <div className="px-3">
              <span className="text-[#5A5A62]">STATUS: </span>
              <span className="text-[#9A9AA2] font-medium">IN SITU RELICS</span>
            </div>
            <div className="pl-3">
              <span className="text-[#5A5A62]">SPAN: </span>
              <span className="text-[#9A9AA2] font-medium">1967–2026</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Replay Cinematic Launch Intro */}
            {onReplayLaunch && (
              <button
                onClick={() => {
                  sound.playClick(1200);
                  onReplayLaunch();
                }}
                title="Replay Cinematic Launch Intro"
                className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#0F1013] px-2.5 py-1 text-[11px] text-[#9A9AA2] transition-colors hover:border-[#D6C7B2]/40 hover:text-[#F5F5F7]"
              >
                <Rocket className="h-3 w-3 text-[#D6C7B2]" />
                <span className="hidden md:inline">REPLAY LAUNCH</span>
              </button>
            )}

            {/* Telemetry Analytics Dashboard Trigger */}
            <button
              onClick={() => {
                sound.playClick(1100);
                onOpenAnalytics?.();
              }}
              title="Open Telemetry Analytics Dashboard"
              className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#0F1013] px-2.5 py-1 text-[11px] text-[#9A9AA2] transition-colors hover:border-[#D6C7B2]/40 hover:text-[#F5F5F7]"
            >
              <BarChart3 className="h-3 w-3 text-[#D6C7B2]" />
              <span className="hidden sm:inline">ANALYTICS</span>
            </button>

            {/* UTC Clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#9A9AA2] border border-white/[0.08] rounded-md px-2.5 py-1 bg-[#0F1013]">
              <Clock className="h-3 w-3 text-[#5A5A62]" />
              <span className="tabular-nums">{utcTime || 'UTC SYNC'}</span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              title={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
              className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#0F1013] px-2.5 py-1 text-[11px] text-[#9A9AA2] transition-colors hover:border-[#D6C7B2]/40 hover:text-[#F5F5F7]"
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="h-3 w-3 text-[#D6C7B2]" />
                  <span className="hidden sm:inline">AUDIO ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3 w-3 text-[#5A5A62]" />
                  <span className="hidden sm:inline">MUTED</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
