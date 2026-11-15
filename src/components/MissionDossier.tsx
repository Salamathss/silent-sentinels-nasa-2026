'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from 'react';
import { MissionRelic, ArchivalImage } from '@/data/missions';
import { sound } from '@/utils/audio';
import { getSpacecraftBlueprintSvg } from '@/utils/blueprintSvg';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Volume2,
  MapPin,
  RefreshCw,
  BookOpen,
  Activity,
  Maximize2,
  ArrowLeft,
} from 'lucide-react';

interface MissionDossierProps {
  mission: MissionRelic;
  onClose: () => void;
  onNavigateRelic: (direction: 'prev' | 'next') => void;
}

type TabType = 'overview' | 'blackbox' | 'comms' | 'gallery';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  simulated?: boolean;
}

let globalMessageSeq = 0;
function createMessageId(prefix: string) {
  globalMessageSeq += 1;
  return `${prefix}-${globalMessageSeq}`;
}

function formatLifespanConcise(duration: string): string {
  if (duration.includes('5,111')) return '5,111 Sols (14.4 yrs)';
  if (duration.includes('2,210')) return '2,210 Sols (6.1 yrs)';
  if (duration.includes('1,445')) return '1,445 Sols (4.0 yrs)';
  if (duration.includes('1,004')) return '1,004 Sols (72 flts)';
  if (duration.includes('2,307')) return '2,307 Sols (6.3 yrs)';
  if (duration.includes('21 hours')) return '21 hrs 36 min';
  if (duration.includes('66 hours')) return '66 hrs 55 min';
  if (duration.includes('14 days') || duration.includes('14 Earth days')) return '14 Earth days';
  return duration.split(';')[0].replace('Martian Sols', 'Sols').trim();
}

function computeSiteConditions(mission: MissionRelic) {
  const isLunar = mission.body === 'Moon';
  const dayOfYear = 319;
  const au = 0.52 + 0.38 * Math.sin(((dayOfYear + 40) / 365.25) * Math.PI);
  const km = au * 149597870.7;
  const lightSec = km / 299792.458;
  const mins = Math.floor(lightSec / 60);
  const secs = Math.round(lightSec % 60);

  const lightDelayStr = isLunar ? '1.28 s' : `${mins}m ${secs}s`;
  const distanceStr = isLunar
    ? '384,400 km (0.00257 AU)'
    : `${(km / 1_000_000).toFixed(1)}M km (${au.toFixed(2)} AU)`;

  let tempRange = isLunar
    ? '-130°C to +120°C (-202°F to +248°F)'
    : '-90°C to +15°C (-130°F to +59°F)';
  if (mission.id === 'apollo-15-lrv') {
    tempRange = '-140°C to +115°C (-220°F to +239°F)';
  } else if (mission.id === 'viking-1') {
    tempRange = '-85°C to -25°C (-121°F to -13°F)';
  } else if (mission.id === 'ingenuity') {
    tempRange = '-90°C to -10°C (-130°F to +14°F)';
  }

  const atmosphere = isLunar
    ? 'Hard vacuum (< 10⁻¹² bar) • High UV solar flux • Regolith electrostatic abrasion'
    : 'Thin CO₂ (~6.1 mbar) • Optical Tau: 0.55 • Low dust storm risk';

  const heritageStatus = isLunar
    ? 'NASA 2.0 km Plume Exhaust Exclusion Zone (Apollo Landing Site Preservation Act)'
    : 'COSPAR Planetary Protection Cat. IV (Decommissioned In Situ)';

  return {
    lightDelayStr,
    distanceStr,
    tempRange,
    atmosphere,
    heritageStatus,
  };
}

export default function MissionDossier({
  mission,
  onClose,
  onNavigateRelic,
}: MissionDossierProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Story chapters state
  const [selectedAct, setSelectedAct] = useState<'actI' | 'actII' | 'actIII'>('actI');
  const [isNarratingChapter, setIsNarratingChapter] = useState<boolean>(false);

  // Gallery state
  const [galleryPhotos, setGalleryPhotos] = useState<ArchivalImage[]>(() => mission.archivalImages);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ArchivalImage | null>(null);

  // Black box playback state
  const [isPlayingBlackbox, setIsPlayingBlackbox] = useState<boolean>(false);
  const [blackboxText, setBlackboxText] = useState<string>(() => mission.lastTransmission.quote);

  // Comms AI Radio state
  const [commsMode, setCommsMode] = useState<'spacecraft' | 'historian'>('spacecraft');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: createMessageId(`init-${mission.id}`),
      role: 'assistant',
      content: `Deep space carrier locked. I am resting in the vacuum of ${mission.coordinates.landingSite} on ${mission.body}. My science records and mission memories are open—what would you like to ask me?`,
      timestamp: 'DSN CARRIER LOCK',
      simulated: false,
    },
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [isCommsLoading, setIsCommsLoading] = useState<boolean>(false);
  const [simulateLatency, setSimulateLatency] = useState<boolean>(false);
  const [transmissionStatus, setTransmissionStatus] = useState<string>('');

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Deterministic live site conditions
  const siteConditions = computeSiteConditions(mission);

  // Stop voice narration on relic change or unmount
  useEffect(() => {
    return () => {
      sound.stopNarration();
    };
  }, [mission.id]);

  // Esc key listener: closes photo lightbox, or exits fullscreen, or closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhoto) {
          setSelectedPhoto(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selectedPhoto, onClose]);

  // Auto-scroll chat smoothly to the latest message whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'comms' || isFullscreen) {
      scrollToBottom();
      const timer = setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [chatMessages, activeTab, isCommsLoading, isFullscreen]);

  // Black box playback simulation with authentic Quindar tones & narration
  const handlePlayBlackbox = () => {
    if (isPlayingBlackbox) {
      sound.stopNarration();
      setIsPlayingBlackbox(false);
      setBlackboxText(mission.lastTransmission.quote);
      return;
    }

    sound.stopNarration();
    setIsNarratingChapter(false);
    setIsPlayingBlackbox(true);

    const fullQuote = mission.lastTransmission.quote;
    setBlackboxText('');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullQuote.length) {
        setBlackboxText((prev) => prev + fullQuote.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 28);

    sound.narrate(
      mission.lastTransmission.quote,
      () => {},
      () => {
        setIsPlayingBlackbox(false);
        setBlackboxText(mission.lastTransmission.quote);
        clearInterval(interval);
      }
    );
  };

  // Toggle chapter narration with authentic NASA Quindar tones
  const handleToggleChapterNarration = () => {
    if (isNarratingChapter) {
      sound.stopNarration();
      setIsNarratingChapter(false);
    } else {
      sound.stopNarration();
      setIsPlayingBlackbox(false);
      sound.narrate(
        currentChapter.narrative,
        () => setIsNarratingChapter(true),
        () => setIsNarratingChapter(false)
      );
    }
  };

  // Fetch live NASA Mars Rover Photos
  const fetchRoverPhotos = async () => {
    if (!mission.roverApiName) return;
    setIsLoadingPhotos(true);
    sound.playClick(1000);

    try {
      const res = await fetch(`/api/rover-photos?rover=${mission.roverApiName}`);
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        setGalleryPhotos(data.photos);
      }
    } catch {
      // fallback to static images
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // Persona switch in Comms Tab
  const handleCommsModeChange = (newMode: 'spacecraft' | 'historian') => {
    sound.playRadioSquelch(0.08);
    setCommsMode(newMode);

    const initialContent =
      newMode === 'spacecraft'
        ? `Carrier restored. I am ${mission.name} (${mission.callsign}), resting in the regolith of ${mission.coordinates.landingSite}. Ask me about our landing, discoveries, or what it feels like to rest beneath the alien stars.`
        : `NASA Flight Operations and Planetary Data System standing by. I have full telemetry logs and engineering records for ${mission.name} (${mission.callsign}). Query any subsystem, anomaly, or scientific finding.`;

    setChatMessages([
      {
        id: createMessageId(`mode-${newMode}`),
        role: 'assistant',
        content: initialContent,
        timestamp: newMode === 'spacecraft' ? 'DSN CARRIER LOCK' : 'NASA PDS ARCHIVE',
        simulated: false,
      },
    ]);
  };

  // Send message in Deep Space Comms tab
  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || userInput;
    if (!textToSend.trim() || isCommsLoading) return;

    sound.playRadioSquelch(0.12);
    setUserInput('');

    const userMsg: ChatMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: textToSend,
      timestamp: 'UPLINK UTC',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsCommsLoading(true);

    if (simulateLatency) {
      setTransmissionStatus(`Uplinking to DSN 70m dish... Transmitting signal to ${mission.body} (${mission.radioDelayLabel})...`);
      await new Promise((resolve) => setTimeout(resolve, Math.min(2500, mission.radioDelaySeconds * 80)));
      setTransmissionStatus(`Downlink traveling back from ${mission.coordinates.landingSite}...`);
    } else {
      setTransmissionStatus(`Uplinking via Deep Space Network carrier (${mission.specs.frequencyBand})...`);
    }

    try {
      const res = await fetch('/api/comms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: mission.id,
          userMessage: textToSend,
          mode: commsMode,
          history: chatMessages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      sound.playClick(1300);
      setTransmissionStatus('');

      const assistantMsg: ChatMessage = {
        id: createMessageId('ai'),
        role: 'assistant',
        content: data.reply || 'No telemetry packet returned.',
        timestamp: 'DOWNLINK UTC',
        simulated: data.simulated,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setTransmissionStatus('Deep space uplink timed out or carrier interrupted.');
      const errorMsg: ChatMessage = {
        id: createMessageId('err'),
        role: 'assistant',
        content: `Carrier signal weakened by cosmic dust or solar interference. Telemetry link to ${mission.callsign} remains on standby.`,
        timestamp: 'DOWNLINK ERROR',
        simulated: true,
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsCommsLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    sound.stopNarration();
    setIsNarratingChapter(false);
    setIsPlayingBlackbox(false);
    sound.playClick(1100);
    setActiveTab(tab);
    if (tab === 'gallery' && mission.roverApiName && galleryPhotos.length <= 3) {
      fetchRoverPhotos();
    }
  };

  const heroImage = galleryPhotos[0]?.url || mission.archivalImages[0]?.url;
  const currentChapter = mission.storyChapters[selectedAct];

  /* ========================================================
     REUSABLE AI RADIO COMMS CONSOLE
     Used in both Drawer Comms Tab and Fullscreen Right Column
     ======================================================== */
  const renderCommsConsole = (isFull: boolean) => (
    <div className={`flex flex-col h-full overflow-hidden bg-[#08080A] rounded-xl border border-white/[0.08] ${isFull ? 'shadow-2xl' : 'flex-1'}`}>
      {/* Persona Switcher Strip */}
      <div className="p-3 border-b border-white/[0.06] bg-[#0F1013]">
        <div className="flex items-center gap-1.5 p-1 bg-[#15161A] rounded-lg border border-white/[0.08]">
          <button
            type="button"
            onClick={() => handleCommsModeChange('spacecraft')}
            className={`flex-1 py-1.5 px-3 rounded-md text-[11px] font-mono font-medium transition-all ${
              commsMode === 'spacecraft'
                ? 'bg-white/[0.08] text-[#F5F5F7] border border-[#D6C7B2]/30 shadow-sm'
                : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
            }`}
          >
            SPACECRAFT VOICE
          </button>
          <button
            type="button"
            onClick={() => handleCommsModeChange('historian')}
            className={`flex-1 py-1.5 px-3 rounded-md text-[11px] font-mono font-medium transition-all ${
              commsMode === 'historian'
                ? 'bg-white/[0.08] text-[#F5F5F7] border border-[#D6C7B2]/30 shadow-sm'
                : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
            }`}
          >
            FLIGHT HISTORIAN
          </button>
        </div>
      </div>

      {/* DSN Telemetry Info Strip */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] bg-[#0F1013]/60 px-5 py-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2] animate-pulse" />
          <span className="text-[#F5F5F7] font-medium text-[11px]">
            {commsMode === 'spacecraft' ? mission.callsign.toUpperCase() : 'NASA PDS ARCHIVE'}
          </span>
          <span className="text-[#5A5A62]">|</span>
          <span className="text-[#9A9AA2] text-[10px]">{mission.specs.frequencyBand}</span>
        </div>

        <label className="flex items-center gap-1.5 text-[10px] text-[#9A9AA2] cursor-pointer">
          <input
            type="checkbox"
            checked={simulateLatency}
            onChange={(e) => setSimulateLatency(e.target.checked)}
            className="rounded border-white/20 bg-[#15161A] text-[#D6C7B2] focus:ring-0"
          />
          <span>Light Delay ({mission.radioDelayLabel})</span>
        </label>
      </div>

      {/* Scrollable Chat Transcript Window with messagesEndRef */}
      <div
        ref={chatScrollRef}
        className={`flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth ${
          isFull ? 'min-h-[420px] max-h-[580px]' : 'min-h-[340px]'
        }`}
      >
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#5A5A62] mb-1 px-1">
              <span>
                {msg.role === 'user'
                  ? 'EARTH // MISSION CONTROL'
                  : commsMode === 'spacecraft'
                  ? mission.callsign.toUpperCase()
                  : 'NASA FLIGHT HISTORIAN'}
              </span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] p-3.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#1B1C22] text-[#F5F5F7] border border-white/[0.12] rounded-xl rounded-tr-sm font-sans'
                  : 'bg-[#121318] text-[#F5F5F7] border border-white/[0.08] border-l-2 border-l-[#D6C7B2] rounded-xl rounded-tl-sm font-sans'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isCommsLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#121318] px-3.5 py-2 text-xs font-mono text-[#9A9AA2]">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D6C7B2]" />
              <span>{transmissionStatus || 'Synthesizing deep-space downlink...'}</span>
            </div>
          </div>
        )}

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Quick Starter Question Chips */}
      <div className="border-t border-white/[0.06] bg-[#0F1013]/60 px-4 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[10px] font-mono text-[#5A5A62] uppercase px-1">Prompt:</span>
          {mission.starterQuestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isCommsLoading}
              className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-[11px] font-mono text-[#9A9AA2] hover:text-[#F5F5F7] hover:border-[#D6C7B2]/40 transition-colors disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Input Bar */}
      <div className="sticky bottom-0 border-t border-white/[0.08] bg-[#0F1013]/98 backdrop-blur-xl p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={
              commsMode === 'spacecraft'
                ? `Send transmission to ${mission.callsign}...`
                : `Query flight systems engineer about ${mission.name}...`
            }
            disabled={isCommsLoading}
            className="flex-1 rounded-lg border border-white/[0.1] bg-[#15161A] px-3.5 py-2 text-xs text-[#F5F5F7] placeholder-[#5A5A62] focus:border-[#D6C7B2] focus:outline-none font-sans"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isCommsLoading}
            className="flex items-center justify-center rounded-lg border border-[#D6C7B2]/40 bg-[#D6C7B2]/15 text-[#D6C7B2] hover:bg-[#D6C7B2]/25 px-3.5 py-2 text-xs font-mono font-medium transition-all disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );

  /* ========================================================
     MODE A: EXPANDED FULLSCREEN MUSEUM VIEW
     Wide 2-Column Editorial Layout over #08080A
     ======================================================== */
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#08080A] text-[#F5F5F7] overflow-y-auto animate-in fade-in duration-200">
        {/* Sticky Fullscreen Top Navigation Bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#08080A]/95 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sound.playClick(900);
                setIsFullscreen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-[#D6C7B2]/40 bg-[#15161A] hover:bg-[#1A1B20] text-[#F5F5F7] px-4 py-2 font-mono text-xs font-semibold tracking-wide transition-all shadow-md group"
            >
              <ArrowLeft className="h-4 w-4 text-[#D6C7B2] group-hover:-translate-x-0.5 transition-transform" />
              <span>&larr; BACK TO 3D GLOBE</span>
              <span className="text-[10px] text-[#5A5A62] font-normal">[ESC]</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-[#9A9AA2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2]" />
              <span className="font-semibold text-[#F5F5F7]">{mission.name}</span>
              <span className="text-[#5A5A62]">&bull;</span>
              <span>{mission.coordinates.landingSite}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#0F1013] p-1">
              <button
                onClick={() => onNavigateRelic('prev')}
                className="p-1.5 text-[#9A9AA2] hover:text-[#F5F5F7] rounded"
                title="Previous Relic"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-[11px] text-[#9A9AA2]">{mission.landingYear}</span>
              <button
                onClick={() => onNavigateRelic('next')}
                className="p-1.5 text-[#9A9AA2] hover:text-[#F5F5F7] rounded"
                title="Next Relic"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => {
                sound.playClick(700);
                onClose();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#0F1013] px-3 py-2 text-[#9A9AA2] hover:text-[#F5F5F7]"
              title="Close Dossier"
            >
              <X className="h-4 w-4" />
              <span className="hidden md:inline text-[11px]">CLOSE</span>
            </button>
          </div>
        </div>

        {/* 2-Column Editorial Museum Body */}
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Hero, Narrative, Chapters & Specs (~60%) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Mission Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-[#D6C7B2] uppercase border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 rounded-full">
                    {mission.body.toUpperCase()} &bull; {mission.category.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#9A9AA2]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2]" />
                    <span>{mission.status}</span>
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F5F5F7] tracking-tight font-normal leading-tight">
                  {mission.name}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#9A9AA2] font-mono">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#D6C7B2]" />
                    <span>{mission.coordinates.landingSite}</span>
                  </span>
                  <span className="text-[#5A5A62]">•</span>
                  <span>{mission.coordinates.formatted}</span>
                  <span className="text-[#5A5A62]">•</span>
                  <span>Distance: {siteConditions.distanceStr}</span>
                </div>
              </div>

              {/* 4-Column Key Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-white/[0.08] bg-[#0F1013] rounded-xl p-4 font-mono">
                <div>
                  <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">LANDED</span>
                  <span className="text-base font-semibold text-[#F5F5F7] mt-0.5 block">{mission.landingYear}</span>
                </div>
                <div>
                  <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">ACTIVE LIFESPAN</span>
                  <span className="text-sm font-medium text-[#F5F5F7] mt-0.5 block">{formatLifespanConcise(mission.actualDuration)}</span>
                </div>
                <div>
                  <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">ODOMETER</span>
                  <span className="text-sm font-medium text-[#F5F5F7] mt-0.5 block">{mission.distanceTraveled}</span>
                </div>
                <div>
                  <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">WARRANTY MULTIPLIER</span>
                  <span className="text-sm font-semibold text-[#D6C7B2] mt-0.5 block">{mission.lifespanMultiplier}</span>
                </div>
              </div>

              {/* Hero Archival NASA Imagery */}
              {heroImage && (
                <div className="rounded-xl border border-white/[0.08] bg-black/60 overflow-hidden space-y-2">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={heroImage}
                      alt={mission.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getSpacecraftBlueprintSvg(mission);
                      }}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-[#9A9AA2] gap-1">
                    <span>{galleryPhotos[0]?.caption || mission.archivalImages[0]?.caption}</span>
                    <span className="text-[#5A5A62] shrink-0">{galleryPhotos[0]?.dateOrSol || mission.landingDate}</span>
                  </div>
                </div>
              )}

              {/* 3-Act Storytelling Chapters */}
              <div className="space-y-4 rounded-xl border border-white/[0.08] bg-[#0F1013] p-6">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F5F5F7] font-semibold uppercase tracking-wider">
                    <BookOpen className="h-4 w-4 text-[#D6C7B2]" />
                    <span>3-ACT MISSION NARRATIVE</span>
                  </div>

                  {/* Quindar Audio Narration Toggle */}
                  <button
                    onClick={handleToggleChapterNarration}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-mono font-medium transition-all ${
                      isNarratingChapter
                        ? 'border border-[#D6C7B2] bg-[#D6C7B2]/20 text-[#D6C7B2]'
                        : 'border border-white/[0.1] bg-white/[0.03] text-[#F5F5F7] hover:bg-white/[0.06]'
                    }`}
                  >
                    <Volume2 className="h-3.5 w-3.5 text-[#D6C7B2]" />
                    <span>{isNarratingChapter ? 'STOP AUDIO LOG' : 'LISTEN TO AUDIO LOG'}</span>
                  </button>
                </div>

                {/* Act Selectors */}
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {(['actI', 'actII', 'actIII'] as const).map((actKey) => {
                    const chapter = mission.storyChapters[actKey];
                    const isActive = selectedAct === actKey;
                    return (
                      <button
                        key={actKey}
                        onClick={() => {
                          sound.stopNarration();
                          setIsNarratingChapter(false);
                          setSelectedAct(actKey);
                        }}
                        className={`rounded-lg p-2.5 text-left border transition-all ${
                          isActive
                            ? 'border-[#D6C7B2] bg-[#15161A] text-[#F5F5F7] shadow-sm'
                            : 'border-white/[0.06] bg-white/[0.01] text-[#9A9AA2] hover:text-[#F5F5F7]'
                        }`}
                      >
                        <div className="text-[10px] text-[#5A5A62] uppercase">{actKey.replace('act', 'Act ')}</div>
                        <div className="truncate font-semibold text-xs mt-0.5">{chapter.title.split(':')[0]}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Chapter Narrative Body */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-serif text-xl text-[#F5F5F7] font-normal">{currentChapter.title}</h3>
                  <p className="text-sm font-sans text-[#D6C7B2]/90 leading-relaxed">{currentChapter.narrative}</p>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4 rounded-xl border border-white/[0.08] bg-[#0F1013] p-6">
                <span className="text-xs font-mono tracking-widest text-[#5A5A62] uppercase block">
                  AEROSPACE HARDWARE ARCHITECTURE
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1"><span className="text-[#5A5A62]">LAUNCH DATE</span><span className="text-[#F5F5F7]">{mission.specs.launchDate}</span></div>
                    <div className="flex justify-between py-1"><span className="text-[#5A5A62]">LAUNCH VEHICLE</span><span className="text-[#F5F5F7]">{mission.specs.launchVehicle}</span></div>
                    <div className="flex justify-between py-1"><span className="text-[#5A5A62]">POWER SOURCE</span><span className="text-[#F5F5F7]">{mission.specs.powerSource}</span></div>
                  </div>
                  <div className="space-y-2.5 sm:pl-4 pt-2 sm:pt-0">
                    <div className="flex justify-between py-1"><span className="text-[#5A5A62]">FREQUENCY BAND</span><span className="text-[#F5F5F7]">{mission.specs.frequencyBand}</span></div>
                    <div className="flex justify-between py-1"><span className="text-[#5A5A62]">OPERATING AGENCY</span><span className="text-[#F5F5F7]">{mission.specs.operator}</span></div>
                    <div className="flex justify-between py-1"><span className="text-[#5A5A62]">ONE-WAY LIGHT TIME</span><span className="text-[#D6C7B2] font-semibold">{mission.radioDelayLabel}</span></div>
                  </div>
                </div>

                <div className="pt-3">
                  <span className="text-[10px] font-mono text-[#5A5A62] uppercase tracking-wider block mb-2">SCIENTIFIC INSTRUMENTS PAYLOAD</span>
                  <div className="flex flex-wrap gap-1.5">
                    {mission.specs.instruments.map((inst, idx) => (
                      <span key={idx} className="rounded border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-xs font-mono text-[#9A9AA2]">{inst}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Archival Surface Photo Gallery Grid */}
              <div className="space-y-4 rounded-xl border border-white/[0.08] bg-[#0F1013] p-6">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs font-mono">
                  <span className="text-[#F5F5F7] font-semibold uppercase">ARCHIVAL SURFACE PHOTOGRAPHY ({galleryPhotos.length})</span>
                  {mission.roverApiName && (
                    <button onClick={fetchRoverPhotos} disabled={isLoadingPhotos} className="flex items-center gap-1 text-[11px] text-[#9A9AA2] hover:text-[#F5F5F7]">
                      <RefreshCw className={`h-3 w-3 ${isLoadingPhotos ? 'animate-spin' : ''}`} />
                      <span>REFRESH API</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-white/[0.08] bg-black/40 aspect-video transition-all hover:border-[#D6C7B2]/40"
                    >
                      <img
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getSpacecraftBlueprintSvg(mission);
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-[10px] font-mono text-white">
                        <span className="truncate font-semibold">{photo.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Dedicated Interactive Comms & Black Box Console (~40%) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              {/* Black Box Final Transmission Card */}
              <div className="rounded-xl border border-white/[0.08] bg-[#0F1013] p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.08] pb-2.5">
                  <span className="text-[#F5F5F7] font-medium tracking-wider">FINAL RECORDED TRANSMISSION</span>
                  <span className="text-[#5A5A62] text-[10px]">{mission.lastTransmission.channel}</span>
                </div>

                <div className="py-2">
                  <p className="text-lg font-serif italic text-[#F5F5F7] leading-relaxed tracking-wide pl-4 border-l-2 border-[#D6C7B2]">
                    &ldquo;{blackboxText}&rdquo;
                    {isPlayingBlackbox && <span className="inline-block w-1.5 h-4 bg-[#D6C7B2] ml-1.5 animate-pulse" />}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[#9A9AA2] border-t border-white/[0.06] pt-3">
                  <span>{mission.lastTransmission.date}</span>
                  <button
                    onClick={handlePlayBlackbox}
                    className="flex items-center gap-1.5 text-xs text-[#D6C7B2] hover:underline"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{isPlayingBlackbox ? 'STOP AUDIO' : 'PLAY AUDIO (QUINDAR)'}</span>
                  </button>
                </div>
              </div>

              {/* Dedicated Interactive AI Radio Comms Window */}
              {renderCommsConsole(true)}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-3xl w-full rounded-xl border border-white/[0.08] bg-[#0F1013] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-1.5 text-[#9A9AA2] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getSpacecraftBlueprintSvg(mission);
                }}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="p-4 space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between text-[#F5F5F7] font-medium">
                  <span>{selectedPhoto.title}</span>
                  <span className="text-[#9A9AA2]">{selectedPhoto.dateOrSol}</span>
                </div>
                <p className="text-[#9A9AA2] font-sans text-xs">{selectedPhoto.caption}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ========================================================
     MODE B: SLIDE-OVER RIGHT DRAWER (COMPACT MUSEUM DOSSIER)
     ======================================================== */
  return (
    <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-[680px] bg-[#0F1013]/98 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl overflow-hidden transition-all duration-300">
      {/* Top Editorial Eyebrow & Stepper */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.06] bg-[#0F1013]">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] font-semibold tracking-widest text-[#D6C7B2] uppercase border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 rounded-full">
            {mission.body.toUpperCase()} &bull; {mission.category.toUpperCase()}
          </span>

          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#9A9AA2]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2]" />
            <span>{mission.status}</span>
          </span>
        </div>

        {/* Action Controls: Expand to Fullscreen, Stepper & Close */}
        <div className="flex items-center gap-1.5">
          {/* EXPAND FULL VIEW TRIGGER */}
          <button
            onClick={() => {
              sound.playClick(1100);
              setIsFullscreen(true);
            }}
            className="flex items-center gap-1.5 rounded border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-mono text-[#9A9AA2] hover:text-[#F5F5F7] hover:border-[#D6C7B2]/40 transition-colors mr-1"
            title="Expand to Fullscreen Museum View"
          >
            <Maximize2 className="h-3 w-3 text-[#D6C7B2]" />
            <span className="hidden sm:inline">EXPAND FULL VIEW</span>
          </button>

          <button
            onClick={() => {
              sound.playClick(900);
              sound.stopNarration();
              onNavigateRelic('prev');
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors"
            title="Previous Relic"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              sound.playClick(900);
              sound.stopNarration();
              onNavigateRelic('next');
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors"
            title="Next Relic"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={() => {
              sound.playClick(700);
              sound.stopNarration();
              onClose();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#9A9AA2] hover:text-[#F5F5F7] hover:bg-white/[0.06] transition-colors"
            title="Close Dossier"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editorial Title & Landing Site Subtitle */}
      <div className="px-6 pt-4 pb-3">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#F5F5F7] tracking-tight font-normal">
          {mission.name}
        </h2>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#9A9AA2] font-mono">
          <MapPin className="h-3 w-3 text-[#5A5A62] shrink-0" />
          <span className="truncate">{mission.coordinates.landingSite}</span>
          <span className="text-[#5A5A62]">•</span>
          <span className="text-[#5A5A62]">{mission.coordinates.formatted}</span>
        </div>
      </div>

      {/* Cinematic Hero Archival Photo Strip */}
      {heroImage && (
        <div className="relative w-full h-36 sm:h-40 bg-black/60 overflow-hidden border-y border-white/[0.06]">
          <img
            src={heroImage}
            alt={mission.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getSpacecraftBlueprintSvg(mission);
            }}
            className="w-full h-full object-cover object-center opacity-85 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1013] via-[#0F1013]/30 to-transparent" />
          <div className="absolute bottom-2.5 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-[#9A9AA2] backdrop-blur-xs">
            <span className="truncate max-w-[300px]">
              {galleryPhotos[0]?.caption || mission.archivalImages[0]?.caption || 'NASA Archival Photography'}
            </span>
            <span className="text-[#5A5A62] shrink-0">
              {galleryPhotos[0]?.dateOrSol || mission.landingDate}
            </span>
          </div>
        </div>
      )}

      {/* Typographic Key-Metrics Strip (Divided Columns, Architectural) */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.08] border-b border-white/[0.08] bg-white/[0.015] px-6 py-3.5 font-mono text-center">
        <div>
          <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">
            LANDED
          </span>
          <span className="text-xs sm:text-sm font-medium text-[#F5F5F7] mt-0.5 block">
            {mission.landingYear}
          </span>
        </div>
        <div className="px-2">
          <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">
            ACTIVE LIFESPAN
          </span>
          <span className="text-xs sm:text-sm font-medium text-[#F5F5F7] mt-0.5 block" title={mission.actualDuration}>
            {formatLifespanConcise(mission.actualDuration)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] tracking-widest text-[#5A5A62] uppercase">
            ODOMETER
          </span>
          <span className="text-xs sm:text-sm font-medium text-[#F5F5F7] mt-0.5 block">
            {mission.distanceTraveled}
          </span>
        </div>
      </div>

      {/* Clean Underline-Style Tab Bar */}
      <div className="flex items-center justify-around border-b border-white/[0.08] bg-[#0F1013] px-4 font-mono text-xs">
        {(['overview', 'blackbox', 'comms', 'gallery'] as const).map((tab) => {
          const labels: Record<TabType, string> = {
            overview: 'OVERVIEW',
            blackbox: 'BLACK BOX',
            comms: 'AI RADIO',
            gallery: `GALLERY (${galleryPhotos.length})`,
          };
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`relative py-3.5 px-2 font-medium tracking-wider transition-colors ${
                isActive ? 'text-[#F5F5F7]' : 'text-[#9A9AA2] hover:text-[#F5F5F7]'
              }`}
            >
              <span>{labels[tab]}</span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#D6C7B2]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Area */}
      {activeTab === 'comms' ? (
        renderCommsConsole(false)
      ) : (
        /* Regular Scrollable Content Area for Overview, Black Box, and Gallery */
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ========================================================
              TAB 1: OVERVIEW & 3-ACT STORY
              ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Summary (Museum-Grade Scannable Block) */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-[#5A5A62] uppercase block">
                  EXECUTIVE SUMMARY
                </span>
                <p className="text-xs sm:text-sm text-[#F5F5F7] font-sans leading-relaxed">
                  {mission.summary}
                </p>
              </div>

              {/* 3-Act Mission Narrative Interactive Chapter Selector */}
              <div className="space-y-3.5 rounded-xl border border-white/[0.08] bg-[#15161A]/50 p-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F5F5F7] font-semibold uppercase tracking-wider">
                    <BookOpen className="h-3.5 w-3.5 text-[#D6C7B2]" />
                    <span>3-ACT MISSION NARRATIVE</span>
                  </div>

                  {/* Quindar Audio Narration Trigger */}
                  <button
                    onClick={handleToggleChapterNarration}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-mono font-medium transition-all ${
                      isNarratingChapter
                        ? 'border border-[#D6C7B2] bg-[#D6C7B2]/20 text-[#D6C7B2]'
                        : 'border border-white/[0.1] bg-white/[0.03] text-[#F5F5F7] hover:bg-white/[0.06]'
                    }`}
                  >
                    <Volume2 className="h-3 w-3 text-[#D6C7B2]" />
                    <span>{isNarratingChapter ? 'STOP AUDIO' : 'LISTEN TO LOG'}</span>
                  </button>
                </div>

                {/* Act Tabs */}
                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                  {(['actI', 'actII', 'actIII'] as const).map((actKey) => {
                    const chapter = mission.storyChapters[actKey];
                    const isActive = selectedAct === actKey;

                    return (
                      <button
                        key={actKey}
                        onClick={() => {
                          sound.stopNarration();
                          setIsNarratingChapter(false);
                          sound.playClick(1000);
                          setSelectedAct(actKey);
                        }}
                        className={`rounded-md p-2 text-left border transition-all ${
                          isActive
                            ? 'border-[#D6C7B2] bg-[#15161A] text-[#F5F5F7] shadow-sm'
                            : 'border-white/[0.06] bg-white/[0.01] text-[#9A9AA2] hover:text-[#F5F5F7]'
                        }`}
                      >
                        <div className="text-[9px] text-[#5A5A62] uppercase tracking-wider">
                          {actKey === 'actI' ? 'ACT I' : actKey === 'actII' ? 'ACT II' : 'ACT III'}
                        </div>
                        <div className="truncate font-semibold text-[11px] mt-0.5">
                          {chapter.title.split(':')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Chapter Content */}
                <div className="space-y-2 pt-1 font-sans">
                  <h4 className="font-serif text-base text-[#F5F5F7] font-normal">
                    {currentChapter.title}
                  </h4>
                  <p className="text-xs text-[#D6C7B2]/90 leading-relaxed font-light">
                    {currentChapter.narrative}
                  </p>

                  {/* Chapter Historical Telemetry Log */}
                  {currentChapter.telemetryLog && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono tracking-widest text-[#5A5A62] uppercase block mb-1">
                        HISTORICAL TELEMETRY LOG [{currentChapter.date}]
                      </span>
                      <div className="font-mono text-xs text-[#D6C7B2] bg-white/[0.02] border border-white/[0.06] p-2.5 rounded-lg leading-relaxed">
                        {currentChapter.telemetryLog}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Operational Lifespan vs Warranty Progress Bar */}
              <div className="space-y-2 rounded-xl border border-white/[0.08] bg-[#15161A]/30 p-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#5A5A62] uppercase tracking-wider text-[10px]">
                    OPERATIONAL LIFESPAN VS. WARRANTY
                  </span>
                  <span className="font-semibold text-[#D6C7B2]">
                    {mission.lifespanMultiplier}
                  </span>
                </div>

                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#D6C7B2] rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          12,
                          (parseFloat(mission.lifespanMultiplier.replace('x', '')) / 56.8) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#9A9AA2] pt-1">
                  <span>Planned: {mission.plannedDuration}</span>
                  <span>Achieved: {formatLifespanConcise(mission.actualDuration)}</span>
                </div>
              </div>

              {/* Scientific Legacy Milestones */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono tracking-widest text-[#5A5A62] uppercase block">
                  SCIENTIFIC LEGACY &amp; FIRSTS
                </span>
                <div className="space-y-2 font-sans text-xs">
                  {mission.scientificLegacy.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.015] p-2.5 text-[#F5F5F7]"
                    >
                      <span className="font-mono text-[#D6C7B2] font-semibold text-[11px] shrink-0 mt-0.5">
                        [0{idx + 1}]
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Site Environmental Conditions */}
              <div className="rounded-xl border border-white/[0.08] bg-[#15161A]/50 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-2 text-[#F5F5F7] font-semibold">
                    <Activity className="h-3.5 w-3.5 text-[#D6C7B2]" />
                    <span className="uppercase text-[11px]">IN SITU SITE CONDITIONS</span>
                  </div>
                  <span className="text-[10px] text-[#5A5A62]">LIVE EPHEMERIS</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#5A5A62] block">THERMAL CYCLE</span>
                    <span className="text-[#F5F5F7]">{siteConditions.tempRange}</span>
                  </div>
                  <div>
                    <span className="text-[#5A5A62] block">CURRENT DISTANCE</span>
                    <span className="text-[#F5F5F7]">{siteConditions.distanceStr}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#5A5A62] block">ATMOSPHERE</span>
                    <span className="text-[#9A9AA2]">{siteConditions.atmosphere}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#5A5A62] block">HERITAGE PRESERVATION</span>
                    <span className="text-[#D6C7B2]">{siteConditions.heritageStatus}</span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications (2-Column Key-Value Grid) */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono tracking-widest text-[#5A5A62] uppercase block">
                  TECHNICAL SPECIFICATIONS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono border-t border-white/[0.06] pt-2">
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-[#5A5A62]">LAUNCH DATE</span>
                    <span className="text-[#F5F5F7]">{mission.specs.launchDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-[#5A5A62]">LAUNCH VEHICLE</span>
                    <span className="text-[#F5F5F7]">{mission.specs.launchVehicle}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-[#5A5A62]">LANDING DATE</span>
                    <span className="text-[#F5F5F7]">{mission.landingDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-[#5A5A62]">MISSION END</span>
                    <span className="text-[#F5F5F7]">{mission.endDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-[#5A5A62]">POWER ARCHITECTURE</span>
                    <span className="text-[#F5F5F7]">{mission.specs.powerSource}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span className="text-[#5A5A62]">FREQUENCY</span>
                    <span className="text-[#F5F5F7]">{mission.specs.frequencyBand}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: BLACK BOX
              ======================================================== */}
          {activeTab === 'blackbox' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.08] pb-2">
                  <span className="text-[#F5F5F7] font-medium tracking-wider">
                    FINAL RECORDED TRANSMISSION
                  </span>
                  <span className="text-[#5A5A62] text-[10px]">
                    {mission.lastTransmission.channel}
                  </span>
                </div>

                {/* Editorial Quote in Refined Serif */}
                <div className="py-4 px-1">
                  <p className="text-lg sm:text-xl font-serif italic text-[#F5F5F7] leading-relaxed tracking-wide pl-4 border-l-2 border-[#D6C7B2]">
                    &ldquo;{blackboxText}&rdquo;
                    {isPlayingBlackbox && (
                      <span className="inline-block w-1.5 h-4 bg-[#D6C7B2] ml-1.5 animate-pulse" />
                    )}
                  </p>
                </div>

                {/* Timestamp & Channel */}
                <div className="flex items-center justify-between py-2 border-t border-white/[0.06] font-mono text-xs text-[#9A9AA2]">
                  <span>{mission.lastTransmission.date}</span>
                  <span className="text-[#5A5A62]">{mission.lastTransmission.channel}</span>
                </div>

                {/* Historical Context Paragraph */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#5A5A62] uppercase block">
                    HISTORICAL CONTEXT
                  </span>
                  <p className="text-xs text-[#9A9AA2] font-sans leading-relaxed">
                    {mission.lastTransmission.context}
                  </p>
                </div>

                {/* Replay Trigger with Quindar audio narration */}
                <div className="pt-2">
                  <button
                    onClick={handlePlayBlackbox}
                    className={`w-full flex items-center justify-center gap-2 rounded-lg border py-3 text-xs font-mono font-medium transition-all ${
                      isPlayingBlackbox
                        ? 'border-[#D6C7B2] bg-[#D6C7B2]/20 text-[#D6C7B2]'
                        : 'border-white/[0.1] bg-white/[0.03] text-[#F5F5F7] hover:bg-white/[0.07] hover:border-[#D6C7B2]/40'
                    }`}
                  >
                    {isPlayingBlackbox ? (
                      <>
                        <div className="flex items-center gap-1 h-3">
                          <div className="w-0.5 h-full bg-[#D6C7B2] animate-pulse" />
                          <div className="w-0.5 h-2/3 bg-[#D6C7B2] animate-pulse delay-75" />
                          <div className="w-0.5 h-full bg-[#D6C7B2] animate-pulse delay-150" />
                        </div>
                        <span>STOP TRANSMISSION AUDIO</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 text-[#D6C7B2]" />
                        <span>PLAY AUDIO TRANSMISSION (QUINDAR CHIRP)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: GALLERY
              ======================================================== */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.08] pb-2">
                <span className="text-[#F5F5F7] font-medium">
                  ARCHIVAL SURFACE PHOTOGRAPHY ({galleryPhotos.length})
                </span>
                {mission.roverApiName && (
                  <button
                    onClick={fetchRoverPhotos}
                    disabled={isLoadingPhotos}
                    className="flex items-center gap-1 text-[11px] text-[#9A9AA2] hover:text-[#F5F5F7] disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingPhotos ? 'animate-spin' : ''}`} />
                    <span>REFRESH API</span>
                  </button>
                )}
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-2 gap-3">
                {galleryPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-white/[0.08] bg-black/40 aspect-video transition-all hover:border-[#D6C7B2]/40"
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getSpacecraftBlueprintSvg(mission);
                      }}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-[10px] font-mono text-white">
                      <span className="truncate font-semibold">{photo.title}</span>
                      <span className="text-[#9A9AA2] text-[9px]">{photo.dateOrSol}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal for Drawer View */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full rounded-xl border border-white/[0.08] bg-[#0F1013] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-1.5 text-[#9A9AA2] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getSpacecraftBlueprintSvg(mission);
              }}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-4 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between text-[#F5F5F7] font-medium">
                <span>{selectedPhoto.title}</span>
                <span className="text-[#9A9AA2]">{selectedPhoto.dateOrSol}</span>
              </div>
              <p className="text-[#9A9AA2] font-sans text-xs">{selectedPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
