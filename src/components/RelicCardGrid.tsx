'use client';

import React from 'react';
import { MissionRelic } from '@/data/missions';
import { sound } from '@/utils/audio';
import { ArrowUpRight, Radio, RotateCcw } from 'lucide-react';

interface RelicCardGridProps {
  missions: MissionRelic[];
  selectedMission: MissionRelic | null;
  onSelectMission: (mission: MissionRelic) => void;
  onResetFilters?: () => void;
  activeFilterName?: string;
  currentPlanet?: string;
}

export default function RelicCardGrid({
  missions,
  selectedMission,
  onSelectMission,
  onResetFilters,
  activeFilterName = 'ALL',
  currentPlanet = 'Moon',
}: RelicCardGridProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0F1013] p-5 md:p-6 shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-3.5 mb-5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2] animate-pulse" />
          <h3 className="font-serif text-base font-normal text-[#F5F5F7] tracking-wider">
            {currentPlanet.toUpperCase()} DISCARDED SENTINELS ARCHIVE
          </h3>
          <span className="font-mono text-[11px] text-[#9A9AA2] bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.06]">
            {missions.length} Visible
          </span>
        </div>

        <p className="font-mono text-[11px] text-[#5A5A62]">
          Select any spacecraft to engage telemetry &amp; deep space AI radio
        </p>
      </div>

      {/* Empty State if filter yields 0 relics */}
      {missions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 font-mono">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.02] text-[#9A9AA2] border border-white/[0.08]">
            <Radio className="h-5 w-5" />
          </div>
          <div className="text-xs text-[#9A9AA2]">
            No {activeFilterName !== 'ALL' ? `"${activeFilterName}"` : ''} relics found in this sector for the selected timeline year.
          </div>
          {onResetFilters && (
            <button
              onClick={() => {
                sound.playClick(1000);
                onResetFilters();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#D6C7B2]/40 bg-[#D6C7B2]/10 px-3.5 py-1.5 text-xs text-[#D6C7B2] hover:bg-[#D6C7B2]/20 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>RESET FILTER TO ALL RELICS</span>
            </button>
          )}
        </div>
      ) : (
        /* Dark Luxury Relic Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {missions.map((mission) => {
            const isSelected = selectedMission?.id === mission.id;

            return (
              <div
                key={mission.id}
                onClick={() => {
                  sound.playBeaconLock();
                  onSelectMission(mission);
                }}
                className={`group relative cursor-pointer flex flex-col justify-between rounded-xl border p-4.5 transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'border-[#D6C7B2] bg-[#181920] shadow-xl ring-1 ring-[#D6C7B2]/40 scale-[1.015]'
                    : 'border-white/[0.08] bg-[#121318] hover:bg-[#15161A] hover:border-white/[0.18]'
                }`}
              >
                <div>
                  {/* Top Eyebrow */}
                  <div className="flex items-center justify-between font-mono text-[10px] mb-2.5">
                    <span className="font-semibold uppercase tracking-wider text-[#5A5A62]">
                      {mission.body} • {mission.category}
                    </span>

                    <span className="flex items-center gap-1.5 font-medium text-[#9A9AA2]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2]" />
                      <span>{mission.status}</span>
                    </span>
                  </div>

                  {/* Title & Callsign */}
                  <h4 className="text-base font-serif font-normal text-[#F5F5F7] group-hover:text-[#D6C7B2] transition-colors line-clamp-1">
                    {mission.name}
                  </h4>
                  <p className="text-[11px] font-mono text-[#9A9AA2] mt-0.5 line-clamp-1">
                    {mission.coordinates.landingSite}
                  </p>

                  {/* Final Transmission Quote */}
                  <p className="mt-3 text-xs font-serif italic text-[#9A9AA2] line-clamp-2 pl-3 border-l border-[#D6C7B2]/40 leading-relaxed">
                    &ldquo;{mission.lastTransmission.quote}&rdquo;
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-[#9A9AA2]">
                  <div className="space-x-1.5">
                    <span className="text-[#5A5A62]">LANDED:</span>
                    <span className="text-[#F5F5F7] font-medium">{mission.landingYear}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#D6C7B2] group-hover:translate-x-0.5 transition-transform text-[11px] font-medium">
                    <span>DOSSIER</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
