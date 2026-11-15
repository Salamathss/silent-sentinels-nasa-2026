'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MISSIONS, MissionRelic, CelestialBody } from '@/data/missions';
import Header from '@/components/Header';
import SurfaceMap from '@/components/SurfaceMap';
import TimelineSlider from '@/components/TimelineSlider';
import MissionDossier from '@/components/MissionDossier';
import RelicCardGrid from '@/components/RelicCardGrid';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import LaunchIntro from '@/components/LaunchIntro';
import { sound } from '@/utils/audio';
import {
  RotateCcw,
  Compass,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const FILTER_CATEGORIES = [
  'ALL',
  'Lander',
  'Rover',
  'Helicopter',
  'Lunar Roving Vehicle',
];

export default function HomePage() {
  const [currentBody, setCurrentBody] = useState<CelestialBody>('Moon');
  const [activeYear, setActiveYear] = useState<number>(2026);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedMission, setSelectedMission] = useState<MissionRelic | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [showLaunchIntro, setShowLaunchIntro] = useState<boolean>(false);

  // Check sessionStorage once on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const hasSeen = sessionStorage.getItem('hasSeenLaunchIntro');
        if (!hasSeen) {
          setShowLaunchIntro(true);
        }
      } catch {
        // Ignore in private browsing
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLaunchIntroComplete = () => {
    setShowLaunchIntro(false);
    try {
      sessionStorage.setItem('hasSeenLaunchIntro', 'true');
    } catch {
      // Ignore
    }
  };

  const handleReplayLaunch = () => {
    setShowLaunchIntro(true);
  };

  // Guided Expedition Tour state
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStepIndex, setTourStepIndex] = useState<number>(0);

  // All 8 missions sorted chronologically for guided storytelling
  const chronologicalMissions = useMemo(() => {
    return [...MISSIONS].sort((a, b) => a.landingYear - b.landingYear);
  }, []);

  // Total missions strictly on the current planet
  const totalPlanetMissions = useMemo(() => {
    return MISSIONS.filter((m) => m.body === currentBody);
  }, [currentBody]);

  // Planet missions matching category filter (all years)
  const categoryMatchedPlanetMissions = useMemo(() => {
    return totalPlanetMissions.filter((m) => {
      if (categoryFilter.toUpperCase() === 'ALL') return true;
      return m.category.toLowerCase() === categoryFilter.toLowerCase();
    });
  }, [totalPlanetMissions, categoryFilter]);

  // Final visible missions on map and in catalog (Planet + Category + Timeline Scrubber)
  const displayMissions = useMemo(() => {
    return categoryMatchedPlanetMissions.filter((m) => m.landingYear <= activeYear);
  }, [categoryMatchedPlanetMissions, activeYear]);

  // Overall counts for Moon and Mars
  const moonMissions = useMemo(() => MISSIONS.filter((m) => m.body === 'Moon'), []);
  const marsMissions = useMemo(() => MISSIONS.filter((m) => m.body === 'Mars'), []);

  // Step through currently visible relics
  const handleNavigateRelic = (direction: 'prev' | 'next') => {
    if (isTourActive) {
      handleTourStep(direction);
      return;
    }
    const list = displayMissions.length > 0 ? displayMissions : categoryMatchedPlanetMissions;
    if (!selectedMission || list.length === 0) return;
    const currentIndex = list.findIndex((m) => m.id === selectedMission.id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= list.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = list.length - 1;
    setSelectedMission(list[nextIndex]);
    setIsDossierOpen(true);
  };

  const handleSelectMission = (mission: MissionRelic) => {
    setSelectedMission(mission);
    setCurrentBody(mission.body);
    setIsDossierOpen(true);
  };

  const handleBodyChange = (body: CelestialBody) => {
    setCurrentBody(body);
    // Keep right dossier closed by default on planet switch
    setSelectedMission(null);
    setIsDossierOpen(false);
  };

  const handleResetFilters = () => {
    sound.playClick(900);
    setCategoryFilter('ALL');
    setActiveYear(2026);
  };

  // Guided Expedition Tour controllers
  const handleStartTour = () => {
    sound.playBeaconLock();
    setIsTourActive(true);
    setTourStepIndex(0);
    const first = chronologicalMissions[0];
    setSelectedMission(first);
    setCurrentBody(first.body);
    setActiveYear(2026);
    setCategoryFilter('ALL');
    setIsDossierOpen(true);
  };

  const handleTourStep = (direction: 'next' | 'prev') => {
    sound.playClick(1200);
    const nextIdx =
      direction === 'next'
        ? (tourStepIndex + 1) % chronologicalMissions.length
        : (tourStepIndex - 1 + chronologicalMissions.length) % chronologicalMissions.length;
    setTourStepIndex(nextIdx);
    const target = chronologicalMissions[nextIdx];
    setSelectedMission(target);
    setCurrentBody(target.body);
    setIsDossierOpen(true);
  };

  const handleExitTour = () => {
    sound.playClick(900);
    setIsTourActive(false);
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#F5F5F7] flex flex-col relative overflow-x-hidden space-grid-pattern selection:bg-[#D6C7B2]/20 selection:text-[#F5F5F7]">
      {/* Cinematic Rocket Launch Intro Splash Overlay */}
      {showLaunchIntro && <LaunchIntro onComplete={handleLaunchIntroComplete} />}

      {/* Header with Title, Switcher, and Live Stats */}
      <Header
        currentBody={currentBody}
        onBodyChange={handleBodyChange}
        moonCount={moonMissions.length}
        marsCount={marsMissions.length}
        totalMissions={categoryMatchedPlanetMissions.length}
        activeFilterCount={displayMissions.length}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onReplayLaunch={handleReplayLaunch}
      />

      {/* Main Mission Control Layout */}
      <main className="flex-1 px-4 py-4 md:px-6 lg:px-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Guided Expedition Tour Sticky Floating HUD (When Active) */}
        {isTourActive && (
          <section className="sticky top-3 z-40 w-full rounded-xl border border-white/[0.12] bg-[#0F1013]/95 p-3.5 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#D6C7B2]">
                <Compass className="h-4 w-4 animate-spin text-[#D6C7B2]" style={{ animationDuration: '14s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#9A9AA2] font-semibold">
                    GUIDED EXPEDITION TOUR // STOP {tourStepIndex + 1} OF {chronologicalMissions.length}
                  </span>
                  <span className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.2 text-[9px] font-semibold text-[#D6C7B2]">
                    {chronologicalMissions[tourStepIndex].landingYear}
                  </span>
                  <span className="text-[10px] text-[#5A5A62] uppercase">
                    ({chronologicalMissions[tourStepIndex].body})
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#F5F5F7]">
                  {chronologicalMissions[tourStepIndex].name} &mdash;{' '}
                  <span className="text-[#9A9AA2] font-normal font-sans">
                    {chronologicalMissions[tourStepIndex].coordinates.landingSite}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTourStep('prev')}
                className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.05] transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>PREV</span>
              </button>
              <button
                onClick={() => handleTourStep('next')}
                className="flex items-center gap-1 rounded-md border border-[#D6C7B2]/40 bg-[#D6C7B2]/10 px-3.5 py-1.5 text-xs font-semibold text-[#F5F5F7] hover:bg-[#D6C7B2]/20 transition-colors shadow-sm"
              >
                <span>NEXT RELIC</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleExitTour}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.05] transition-colors ml-1"
                title="Exit Tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* Mission Statement Hero Banner */}
        <section className="relative rounded-2xl border border-white/[0.08] bg-[#0F1013] p-5 md:p-6 backdrop-blur-md shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="max-w-2xl">
              <div className="font-mono text-[10px] font-semibold text-[#5A5A62] tracking-[0.2em] uppercase mb-1.5">
                NASA SPACE APPS CHALLENGE 2026 // CELESTIAL HERITAGE ARCHIVE
              </div>
              <h2 className="text-2xl md:text-3xl font-normal text-[#F5F5F7] tracking-tight font-serif">
                Abandoned but Not Forgotten: Relics of the Moon &amp; Mars
              </h2>
              <p className="mt-1.5 text-xs md:text-sm text-[#9A9AA2] font-sans leading-relaxed">
                Interactive 3D aerospace museum documenting humanity&apos;s robotic sentinels across the Moon and Mars. Fly across real planetary coordinates, inspect archival photography, and re-establish simulated deep-space radio links.
              </p>

              {/* Start Guided Expedition Tour Action */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleStartTour}
                  className="flex items-center gap-2 rounded-lg border border-[#D6C7B2]/40 bg-[#15161A] hover:bg-[#1A1B20] text-[#F5F5F7] px-3.5 py-2 font-mono text-xs font-semibold tracking-wide transition-all shadow-md"
                >
                  <Compass className="h-3.5 w-3.5 text-[#D6C7B2]" />
                  <span>START GUIDED EXPEDITION TOUR (1967 &rarr; 2024)</span>
                </button>
              </div>
            </div>

            {/* Functional Category Filters */}
            <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#5A5A62] uppercase tracking-wider">
                  FILTER TYPE:
                </span>
                {categoryFilter !== 'ALL' && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 text-[10px] font-mono text-[#9A9AA2] hover:text-[#F5F5F7]"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>RESET</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                {FILTER_CATEGORIES.map((cat) => {
                  const isActive = categoryFilter.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        sound.playClick(1100);
                        setCategoryFilter(cat);
                      }}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                        isActive
                          ? 'border border-[#D6C7B2] bg-[#15161A] text-[#F5F5F7]'
                          : 'border border-white/[0.08] bg-white/[0.02] text-[#9A9AA2] hover:text-[#F5F5F7] hover:border-white/[0.15]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Map & Telemetry Dashboard */}
        <section className="grid grid-cols-1 gap-6">
          {/* Surface Map Viewport */}
          <div className="w-full">
            <SurfaceMap
              missions={displayMissions}
              selectedMission={selectedMission}
              onSelectMission={handleSelectMission}
              body={currentBody}
            />
          </div>

          {/* Chronological Timeline Scrubber */}
          <div className="w-full">
            <TimelineSlider
              currentYear={activeYear}
              onYearChange={setActiveYear}
              activeCount={displayMissions.length}
              totalCount={categoryMatchedPlanetMissions.length}
            />
          </div>
        </section>

        {/* Filtered Relic Catalog Grid */}
        <section className="w-full">
          <RelicCardGrid
            missions={displayMissions}
            selectedMission={selectedMission}
            onSelectMission={handleSelectMission}
            onResetFilters={handleResetFilters}
            activeFilterName={categoryFilter}
            currentPlanet={currentBody}
          />
        </section>
      </main>

      {/* Slide-Over Mission Dossier Panel */}
      {isDossierOpen && selectedMission && (
        <MissionDossier
          key={selectedMission.id}
          mission={selectedMission}
          onClose={() => setIsDossierOpen(false)}
          onNavigateRelic={handleNavigateRelic}
        />
      )}

      {/* Telemetry Analytics Dashboard Modal */}
      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        onSelectRelic={handleSelectMission}
      />

      {/* Authoritative NASA Open Data Sources & Archival Footer */}
      <footer className="mt-6 border-t border-white/[0.08] bg-[#0A0B0E] py-6 px-4 md:px-8 text-xs font-mono text-[#5A5A62]">
        <div className="max-w-[1600px] mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#9A9AA2] font-medium">
                <span className="text-[#F5F5F7] font-semibold tracking-wider">SILENT SENTINELS ARCHIVE</span>
                <span className="text-[#5A5A62]">•</span>
                <span className="text-[11px]">NASA SPACE APPS CHALLENGE 2026</span>
              </div>
              <p className="text-[#5A5A62] text-[11px]">
                Challenge Theme: &ldquo;Abandoned but not Forgotten: Storytelling about NASA&apos;s Discarded Equipment on the Moon and Mars&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#9A9AA2] font-mono">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D6C7B2]" />
              <span className="text-[#D6C7B2] font-semibold">8 RELICS PRESERVED IN SITU</span>
              <span className="text-[#5A5A62]">•</span>
              <span className="text-[#9A9AA2]">CELESTIAL HERITAGE SPECIFICATION</span>
            </div>
          </div>

          {/* Official NASA Data Sources Citations */}
          <div className="space-y-1.5">
            <span className="text-[10px] tracking-widest text-[#5A5A62] uppercase block">
              OFFICIAL NASA OPEN DATA &amp; ARCHIVAL REPOSITORIES
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#9A9AA2]">
              <span className="hover:text-[#F5F5F7] transition-colors">NASA Lunar Reconnaissance Orbiter (LRO)</span>
              <span className="text-[#5A5A62]">•</span>
              <span className="hover:text-[#F5F5F7] transition-colors">NASA Mars Reconnaissance Orbiter (MRO)</span>
              <span className="text-[#5A5A62]">•</span>
              <span className="hover:text-[#F5F5F7] transition-colors">NASA Mars Rover Photos Open API</span>
              <span className="text-[#5A5A62]">•</span>
              <span className="hover:text-[#F5F5F7] transition-colors">NASA Image &amp; Video Library (JPL / JSC)</span>
              <span className="text-[#5A5A62]">•</span>
              <span className="hover:text-[#F5F5F7] transition-colors">NASA Space Science Data Coordinated Archive (NSSDCA)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
