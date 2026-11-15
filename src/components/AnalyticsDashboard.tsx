'use client';

import React, { useMemo } from 'react';
import { MISSIONS, MissionRelic } from '@/data/missions';
import { sound } from '@/utils/audio';
import {
  X,
  BarChart3,
  Timer,
  Navigation,
  Globe,
  Weight,
  Layers,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRelic: (mission: MissionRelic) => void;
}

export default function AnalyticsDashboard({
  isOpen,
  onClose,
  onSelectRelic,
}: AnalyticsDashboardProps) {
  // Aggregate statistics
  const stats = useMemo(() => {
    const totalRelics = MISSIONS.length;
    const moonCount = MISSIONS.filter((m) => m.body === 'Moon').length;
    const marsCount = MISSIONS.filter((m) => m.body === 'Mars').length;

    // Cumulative distance across all mobile relics
    const totalKm = MISSIONS.reduce((acc, m) => {
      const match = m.distanceTraveled.match(/([\d.]+)\s*km/i);
      return acc + (match ? parseFloat(match[1]) : 0);
    }, 0);

    // Approximate total landed mass on lunar & martian surfaces (kg)
    const massMap: Record<string, number> = {
      'apollo-11-eagle': 2034,
      'apollo-15-lrv': 210,
      'surveyor-3': 302,
      'opportunity': 185,
      'spirit': 185,
      'insight': 358,
      'ingenuity': 1.8,
      'viking-1': 657,
    };

    const totalMassKg = Object.values(massMap).reduce((acc, val) => acc + val, 0);

    // Sorted by longevity multiplier (numeric)
    const sortedByLifespan = [...MISSIONS].sort((a, b) => {
      const getMult = (m: MissionRelic) => {
        const match = m.lifespanMultiplier.match(/([\d.]+)x/i);
        return match ? parseFloat(match[1]) : 1;
      };
      return getMult(b) - getMult(a);
    });

    // Mobile relics sorted by distance
    const mobileRelics = [...MISSIONS]
      .filter((m) => !m.distanceTraveled.toLowerCase().includes('stationary'))
      .sort((a, b) => {
        const getKm = (m: MissionRelic) => {
          const match = m.distanceTraveled.match(/([\d.]+)\s*km/i);
          return match ? parseFloat(match[1]) : 0;
        };
        return getKm(b) - getKm(a);
      });

    return {
      totalRelics,
      moonCount,
      marsCount,
      totalKm: totalKm.toFixed(2),
      totalMassKg: totalMassKg.toLocaleString(),
      sortedByLifespan,
      mobileRelics,
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/[0.08] bg-[#0F1013] shadow-2xl overflow-hidden font-sans text-[#F5F5F7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 bg-white/[0.01]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#D6C7B2]">
              <BarChart3 className="h-4 w-4 text-[#D6C7B2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-normal text-[#F5F5F7] tracking-tight">
                  Telemetry Analytics &amp; Fleet Overview
                </h3>
                <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.2 font-mono text-[9px] text-[#9A9AA2]">
                  NASA PDS SYNTHESIS
                </span>
              </div>
              <p className="font-mono text-xs text-[#9A9AA2]">
                Planetary survival multipliers, traverse odometry, and in-situ mass distribution.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick(700);
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.05] transition-colors"
            title="Close Analytics"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Analytics Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top KPI Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
            <div className="rounded-xl border border-white/[0.08] bg-[#15161A]/70 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-[#5A5A62] text-[10px] uppercase tracking-wider">
                <span>CATALOGED RELICS</span>
                <Globe className="h-3.5 w-3.5 text-[#9A9AA2]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#F5F5F7]">
                {stats.totalRelics}{' '}
                <span className="text-xs text-[#5A5A62] font-normal">
                  ({stats.moonCount} Moon, {stats.marsCount} Mars)
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#15161A]/70 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-[#5A5A62] text-[10px] uppercase tracking-wider">
                <span>TOTAL ODOMETER</span>
                <Navigation className="h-3.5 w-3.5 text-[#D6C7B2]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#F5F5F7]">
                {stats.totalKm}{' '}
                <span className="text-xs text-[#5A5A62] font-normal">km traveled</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#15161A]/70 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-[#5A5A62] text-[10px] uppercase tracking-wider">
                <span>SURFACE MASS LEFT</span>
                <Weight className="h-3.5 w-3.5 text-[#9A9AA2]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#F5F5F7]">
                ~{stats.totalMassKg}{' '}
                <span className="text-xs text-[#5A5A62] font-normal">kg in situ</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#15161A]/70 p-3.5 space-y-1">
              <div className="flex items-center justify-between text-[#5A5A62] text-[10px] uppercase tracking-wider">
                <span>PEAK MULTIPLIER</span>
                <Timer className="h-3.5 w-3.5 text-[#D6C7B2]" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#D6C7B2]">
                56.8&times;{' '}
                <span className="text-xs text-[#9A9AA2] font-normal">Opportunity</span>
              </div>
            </div>
          </div>

          {/* Section 1: Mission Longevity Multiplier Comparison */}
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.01] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/[0.08] pb-2.5">
              <div>
                <h4 className="font-serif text-base font-normal text-[#F5F5F7]">
                  Operational Lifespan vs. Design Warranty
                </h4>
                <p className="text-xs text-[#9A9AA2] font-sans mt-0.5">
                  How many times longer each robotic sentinel survived beyond NASA&apos;s initial design warranty.
                </p>
              </div>
              <span className="font-mono text-[9px] text-[#5A5A62] uppercase tracking-wider">
                [BASELINE = 1.0X WARRANTY]
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {stats.sortedByLifespan.map((relic) => {
                const multMatch = relic.lifespanMultiplier.match(/([\d.]+)x/i);
                const multVal = multMatch ? parseFloat(multMatch[1]) : 1;
                const isMoon = relic.body === 'Moon';
                const barWidth = Math.min(100, Math.max(8, (multVal / 56.8) * 100));

                return (
                  <div
                    key={relic.id}
                    onClick={() => {
                      sound.playBeaconLock();
                      onSelectRelic(relic);
                      onClose();
                    }}
                    className="group cursor-pointer space-y-1 rounded-lg p-2 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isMoon ? 'bg-[#F5F5F7]' : 'bg-[#D6C7B2]'
                          }`}
                        />
                        <span className="font-medium text-[#F5F5F7] group-hover:text-white transition-colors">
                          {relic.name}
                        </span>
                        <span className="text-[10px] text-[#5A5A62]">
                          ({relic.landingYear} • {relic.body})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[#9A9AA2] text-[11px] hidden sm:inline">
                          Designed: {relic.plannedDuration} &rarr; Achieved:{' '}
                          {relic.actualDuration.split(';')[0]}
                        </span>
                        <span className="font-semibold text-xs text-[#D6C7B2]">
                          {relic.lifespanMultiplier}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-[#D6C7B2]"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Off-World Odometer Comparison */}
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.01] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/[0.08] pb-2.5">
              <div>
                <h4 className="font-serif text-base font-normal text-[#F5F5F7]">
                  Off-World Odometer Ranking (Kilometers Traveled)
                </h4>
                <p className="text-xs text-[#9A9AA2] font-sans mt-0.5">
                  Surface wheel drive and aerial traverse distance on another celestial body.
                </p>
              </div>
              <span className="font-mono text-[9px] text-[#5A5A62] uppercase tracking-wider">
                [MOBILE SENTINELS]
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {stats.mobileRelics.map((relic) => {
                const match = relic.distanceTraveled.match(/([\d.]+)\s*km/i);
                const kmVal = match ? parseFloat(match[1]) : 0;
                const barWidth = Math.min(100, Math.max(5, (kmVal / 45.16) * 100));
                const isMoon = relic.body === 'Moon';

                return (
                  <div
                    key={relic.id}
                    onClick={() => {
                      sound.playBeaconLock();
                      onSelectRelic(relic);
                      onClose();
                    }}
                    className="group cursor-pointer space-y-1 rounded-lg p-2 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isMoon ? 'bg-[#F5F5F7]' : 'bg-[#D6C7B2]'
                          }`}
                        />
                        <span className="font-medium text-[#F5F5F7] group-hover:text-white transition-colors">
                          {relic.name}
                        </span>
                        <span className="text-[10px] text-[#5A5A62] uppercase">
                          [{relic.category}]
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[#F5F5F7] font-semibold">{kmVal.toFixed(2)} km</span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-[#D6C7B2]"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: In Situ Historical Preservation Note */}
          <div className="rounded-xl border border-white/[0.08] bg-[#15161A]/50 p-4 text-xs font-mono space-y-1.5">
            <div className="flex items-center gap-2 text-[#D6C7B2] font-semibold uppercase text-[10px] tracking-wider">
              <Layers className="h-3.5 w-3.5 text-[#D6C7B2]" />
              <span>PLANETARY ARCHAEOLOGY &amp; HISTORICAL PRESERVATION</span>
            </div>
            <p className="text-[#9A9AA2] leading-relaxed font-sans text-xs">
              Every decommissioned component left by NASA on the lunar regolith and Martian sands remains in situ in extreme vacuum or ultra-thin atmosphere, protected from rain and water erosion. They are monuments to human curiosity, serving as permanent archaeological sites under NASA&apos;s lunar heritage preservation guidelines.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] px-5 py-3 bg-[#0B0C0E] flex items-center justify-between text-xs font-mono text-[#5A5A62]">
          <span>Click any spacecraft row to target coordinates on the 3D globe</span>
          <button
            onClick={() => {
              sound.playClick(900);
              onClose();
            }}
            className="rounded border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
