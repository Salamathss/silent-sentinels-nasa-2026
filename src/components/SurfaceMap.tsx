'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MissionRelic, CelestialBody } from '@/data/missions';
import { sound } from '@/utils/audio';
import {
  Compass,
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Tag,
  Globe2,
  Map as MapIcon,
  Orbit,
  Shield,
} from 'lucide-react';

// Dynamically import GlobeView with ssr: false to prevent window / requestAnimationFrame reference during SSR
const GlobeView = dynamic(() => import('./GlobeView'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[480px] md:min-h-[580px] w-full bg-[#08080A] text-[#9A9AA2] font-mono text-xs">
      <div className="h-10 w-10 border-2 border-white/10 border-t-[#D6C7B2] rounded-full animate-spin mb-3" />
      <span className="tracking-widest uppercase text-[11px] text-[#F5F5F7]">
        INITIALIZING 3D PLANETARY WEBGL SPHERE...
      </span>
    </div>
  ),
});

interface SurfaceMapProps {
  missions: MissionRelic[];
  selectedMission: MissionRelic | null;
  onSelectMission: (mission: MissionRelic) => void;
  body: CelestialBody;
}

export default function SurfaceMap({
  missions,
  selectedMission,
  onSelectMission,
  body,
}: SurfaceMapProps) {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showHeritageZones, setShowHeritageZones] = useState<boolean>(true);
  const [zoomLevel2D, setZoomLevel2D] = useState<number>(1);
  const [zoomTrigger3D, setZoomTrigger3D] = useState<{ delta: number; count: number }>({
    delta: 0,
    count: 0,
  });
  const [resetTrigger3D, setResetTrigger3D] = useState<number>(0);

  // 3D Camera POV tracking for HUD
  const [camPov, setCamPov] = useState<{ lat: number; lng: number; altitude: number }>({
    lat: 0,
    lng: 0,
    altitude: 1.8,
  });

  // 2D Mouse Hover tracking
  const container2DRef = useRef<HTMLDivElement>(null);
  const [mouseCoords2D, setMouseCoords2D] = useState<{
    lat: string;
    lng: string;
    sector: string;
  } | null>(null);
  const [hoveredMission2D, setHoveredMission2D] = useState<MissionRelic | null>(null);

  // Filter missions to current celestial body
  const bodyMissions = useMemo(() => {
    return missions.filter((m) => m.body === body);
  }, [missions, body]);

  const isMoon = body === 'Moon';
  const accentBorder = 'border-[#D6C7B2]/40';
  const accentText = 'text-[#D6C7B2]';

  const handleZoom = (delta: number) => {
    sound.playClick(1400);
    if (viewMode === '3d') {
      setZoomTrigger3D((prev) => ({ delta: delta > 0 ? -0.3 : 0.3, count: prev.count + 1 }));
    } else {
      setZoomLevel2D((prev) => Math.max(1, Math.min(2.5, +(prev + delta).toFixed(2))));
    }
  };

  const handleReset = () => {
    sound.playClick(900);
    if (viewMode === '3d') {
      setResetTrigger3D((prev) => prev + 1);
    } else {
      setZoomLevel2D(1);
    }
  };

  const handleToggleAutoRotate = () => {
    sound.playClick(1100);
    setAutoRotate((prev) => !prev);
  };

  const handleToggleViewMode = () => {
    sound.playClick(1200);
    setViewMode((prev) => (prev === '3d' ? '2d' : '3d'));
  };

  const handleCameraPovChange = useCallback((pov: { lat: number; lng: number; altitude: number }) => {
    setCamPov(pov);
  }, []);

  const handle2DMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!container2DRef.current) return;
    const rect = container2DRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    const latNum = Math.round((50 - yPct) * 1.6);
    const lngNum = Math.round((xPct - 50) * 3.6);

    const latStr = `${Math.abs(latNum)}° ${latNum >= 0 ? 'N' : 'S'}`;
    const lngStr = `${Math.abs(lngNum)}° ${lngNum >= 0 ? 'E' : 'W'}`;

    let sector = body === 'Moon' ? 'LUNAR REGOLITH' : 'MARTIAN TERRAIN';
    if (body === 'Moon') {
      if (xPct > 45 && xPct < 65 && yPct > 40 && yPct < 55) sector = 'MARE TRANQUILLITATIS';
      else if (xPct < 45 && yPct > 30 && yPct < 60) sector = 'OCEANUS PROCELLARUM';
      else if (xPct > 45 && yPct < 40) sector = 'MARE IMBRIUM';
      else if (yPct > 70) sector = 'SOUTHERN HIGHLANDS / TYCHO';
    } else {
      if (xPct > 20 && xPct < 45 && yPct > 40 && yPct < 60) sector = 'VALLES MARINERIS TRENCH';
      else if (xPct < 25 && yPct < 45) sector = 'THARSIS / OLYMPUS MONS';
      else if (xPct > 70 && yPct > 35 && yPct < 55) sector = 'ELYSIUM PLANITIA';
      else if (xPct > 45 && xPct < 65 && yPct > 30 && yPct < 50) sector = 'ISIDIS / JEZERO BASIN';
    }

    setMouseCoords2D({ lat: latStr, lng: lngStr, sector });
  };

  return (
    <div className="relative flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[#0F1013] overflow-hidden shadow-2xl">
      {/* Top Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-[#0F1013]/95 px-4 py-2.5 z-20 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#F5F5F7]">
            <Compass className={`h-4 w-4 ${accentText}`} />
            <span>
              {body === 'Moon'
                ? 'LUNAR CARTOGRAPHY // LRO'
                : 'MARTIAN TOPOGRAPHY // MRO'}
            </span>
          </div>

          <span className="hidden md:inline text-xs font-mono text-[#5A5A62]">
            {viewMode === '3d'
              ? '[3D WEBGL INTERACTIVE GLOBE]'
              : '[CYLINDRICAL MERCATOR 1:5,000,000]'}
          </span>
        </div>

        {/* Map Toolbar Controls */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {/* 3D / 2D View Switcher */}
          <button
            onClick={handleToggleViewMode}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] transition-all ${
              viewMode === '3d'
                ? `border-[#D6C7B2] bg-[#15161A] text-[#F5F5F7] font-medium`
                : `border-white/10 bg-white/[0.02] text-[#9A9AA2] hover:text-[#F5F5F7]`
            }`}
            title="Toggle between 3D Spherical Globe and 2D Cylindrical Map"
          >
            {viewMode === '3d' ? (
              <>
                <Globe2 className="h-3.5 w-3.5 text-[#D6C7B2]" />
                <span>3D GLOBE</span>
              </>
            ) : (
              <>
                <MapIcon className="h-3.5 w-3.5 text-[#D6C7B2]" />
                <span>2D MAP</span>
              </>
            )}
          </button>

          {/* Auto-rotation toggle (3D Globe mode only) */}
          {viewMode === '3d' && (
            <button
              onClick={handleToggleAutoRotate}
              className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] transition-colors ${
                autoRotate
                  ? `${accentBorder} bg-white/[0.06] ${accentText}`
                  : 'border-white/10 bg-white/[0.02] text-[#9A9AA2] hover:text-[#F5F5F7]'
              }`}
              title="Toggle Orbital Camera Rotation"
            >
              <Orbit className={`h-3 w-3 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
              <span className="hidden sm:inline">ORBIT</span>
            </button>
          )}

          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] transition-colors ${
              showLabels
                ? 'border-white/20 bg-white/[0.06] text-[#F5F5F7]'
                : 'border-white/10 bg-white/[0.02] text-[#9A9AA2] hover:text-[#F5F5F7]'
            }`}
            title="Toggle Landing Site & Feature Labels"
          >
            <Tag className="h-3 w-3" />
            <span className="hidden sm:inline">LABELS</span>
          </button>

          {/* Lunar Heritage Protection Zones Toggle (Moon only) */}
          {isMoon && (
            <button
              onClick={() => {
                sound.playClick(1100);
                setShowHeritageZones((prev) => !prev);
              }}
              className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] transition-colors ${
                showHeritageZones
                  ? 'border-[#D6C7B2]/40 bg-[#D6C7B2]/10 text-[#D6C7B2] font-medium'
                  : 'border-white/10 bg-white/[0.02] text-[#9A9AA2] hover:text-[#F5F5F7]'
              }`}
              title="Toggle NASA 2.0 km Lunar Heritage Exclusion Buffer"
            >
              <Shield className="h-3 w-3 text-[#D6C7B2]" />
              <span className="hidden sm:inline">HERITAGE ZONES</span>
            </button>
          )}

          <div className="h-4 w-px bg-white/10 mx-0.5" />

          {/* Zoom controls */}
          <button
            onClick={() => handleZoom(0.25)}
            className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
            title="Reset Map View"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport: 3D Globe or 2D Map */}
      <div className="relative flex-1 w-full min-h-[480px] md:min-h-[580px] bg-[#05070d] overflow-hidden select-none">
        {viewMode === '3d' ? (
          /* ========================================================
             3D WEBGL INTERACTIVE GLOBE VIEW
             ======================================================== */
          <div className="relative w-full h-full min-h-[480px] md:min-h-[580px]">
            <GlobeView
              missions={bodyMissions}
              selectedMission={selectedMission}
              onSelectMission={onSelectMission}
              body={body}
              showLabels={showLabels}
              autoRotate={autoRotate}
              showHeritageZones={showHeritageZones}
              onCameraPovChange={handleCameraPovChange}
              zoomTrigger={zoomTrigger3D}
              resetTrigger={resetTrigger3D}
            />

            {/* 3D Telemetry HUD (Bottom-left) */}
            <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-lg border border-white/10 bg-[#070b14]/90 px-3 py-2 font-mono text-[11px] backdrop-blur-md shadow-xl text-zinc-300">
              <div className="flex items-center gap-2 text-white font-medium mb-1">
                <Crosshair className="h-3.5 w-3.5 text-zinc-400" />
                <span>ORBITAL TELEMETRY</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-zinc-400">
                <div>
                  <span className="text-zinc-500">POV:</span>{' '}
                  <span className="text-zinc-200">
                    {Math.abs(camPov.lat).toFixed(2)}°{camPov.lat >= 0 ? 'N' : 'S'},{' '}
                    {Math.abs(camPov.lng).toFixed(2)}°{camPov.lng >= 0 ? 'E' : 'W'}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">ALTITUDE:</span>{' '}
                  <span className="text-zinc-200">
                    {Math.round(camPov.altitude * 1000)} KM
                  </span>
                </div>
              </div>
            </div>

            {/* Interaction Hint (Bottom-right) */}
            <div className="hidden sm:block pointer-events-none absolute bottom-3 right-3 z-20 rounded-lg border border-white/10 bg-[#070b14]/80 px-3 py-1.5 font-mono text-[10px] text-zinc-400 backdrop-blur-sm">
              <span>DRAG TO ROTATE • SCROLL TO ZOOM • CLICK PIN TO TARGET</span>
            </div>
          </div>
        ) : (
          /* ========================================================
             2D CYLINDRICAL TOPOLOGICAL MAP VIEW
             ======================================================== */
          <div
            ref={container2DRef}
            onMouseMove={handle2DMouseMove}
            onMouseLeave={() => setMouseCoords2D(null)}
            className="relative w-full h-full min-h-[480px] md:min-h-[580px] cursor-crosshair overflow-hidden"
          >
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
              style={{ transform: `scale(${zoomLevel2D})` }}
            >
              {body === 'Moon' ? (
                /* MOON SVG TOPOGRAPHY */
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1000 600"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#05070d" stopOpacity="1" />
                    </radialGradient>
                    <radialGradient id="tychoRayGlow" cx="50%" cy="80%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#05070d" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  <rect width="1000" height="600" fill="#0c111d" />
                  <rect width="1000" height="600" fill="url(#moonGlow)" />

                  {/* Coordinate Graticule Grid */}
                  <g stroke="#334155" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.35">
                    <line x1="0" y1="100" x2="1000" y2="100" />
                    <line x1="0" y1="200" x2="1000" y2="200" />
                    <line x1="0" y1="300" x2="1000" y2="300" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="none" opacity="0.4" />
                    <line x1="0" y1="400" x2="1000" y2="400" />
                    <line x1="0" y1="500" x2="1000" y2="500" />

                    <line x1="166" y1="0" x2="166" y2="600" />
                    <line x1="333" y1="0" x2="333" y2="600" />
                    <line x1="500" y1="0" x2="500" y2="600" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="none" opacity="0.4" />
                    <line x1="666" y1="0" x2="666" y2="600" />
                    <line x1="833" y1="0" x2="833" y2="600" />
                  </g>

                  {/* Lunar Maria */}
                  <g fill="#172033" stroke="#243048" strokeWidth="1.5" opacity="0.85">
                    <path d="M 280,180 C 220,160 160,200 140,260 C 120,320 160,390 230,420 C 310,450 380,390 390,320 C 400,260 360,200 280,180 Z" />
                    <path d="M 370,120 C 440,90 520,110 540,170 C 560,230 500,280 430,280 C 360,280 320,220 340,160 C 350,130 360,125 370,120 Z" />
                    <path d="M 540,170 C 610,160 660,190 650,250 C 640,290 580,310 540,290 C 510,270 510,210 540,170 Z" />
                    <path d="M 530,270 C 610,250 670,270 680,320 C 690,370 630,410 560,400 C 510,390 490,330 530,270 Z" fill="#1b253b" />
                    <path d="M 720,200 C 780,195 810,230 805,270 C 800,305 750,320 715,305 C 685,290 690,220 720,200 Z" />
                    <path d="M 640,360 C 710,340 760,390 740,460 C 720,500 660,510 610,470 C 580,440 600,380 640,360 Z" />
                    <path d="M 340,380 C 420,380 460,430 440,490 C 420,530 350,540 310,500 C 280,460 300,400 340,380 Z" />
                  </g>

                  {/* Tycho Crater & Rays */}
                  <circle cx="500" cy="510" r="180" fill="url(#tychoRayGlow)" />
                  <g stroke="#ffffff" strokeWidth="0.7" opacity="0.25">
                    <line x1="500" y1="510" x2="200" y2="400" />
                    <line x1="500" y1="510" x2="350" y2="280" />
                    <line x1="500" y1="510" x2="520" y2="200" />
                    <line x1="500" y1="510" x2="680" y2="260" />
                    <line x1="500" y1="510" x2="780" y2="380" />
                    <line x1="500" y1="510" x2="600" y2="580" />
                    <line x1="500" y1="510" x2="380" y2="580" />
                  </g>

                  {/* Craters */}
                  <circle cx="500" cy="510" r="16" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                  <circle cx="370" cy="270" r="18" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.8" />
                  <circle cx="280" cy="280" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />

                  {/* Feature Labels */}
                  {showLabels && (
                    <g fill="#94a3b8" fontSize="10" fontFamily="monospace" letterSpacing="1" opacity="0.6">
                      <text x="180" y="320">OCEANUS PROCELLARUM</text>
                      <text x="400" y="190">MARE IMBRIUM</text>
                      <text x="545" y="240">MARE SERENITATIS</text>
                      <text x="560" y="340">MARE TRANQUILLITATIS</text>
                      <text x="725" y="260">MARE CRISIUM</text>
                      <text x="635" y="440">MARE FECUNDITATIS</text>
                      <text x="350" y="460">MARE NUBIUM</text>
                      <text x="525" y="520" fill="#cbd5e1">TYCHO</text>
                      <text x="395" y="280" fill="#cbd5e1">COPERNICUS</text>
                    </g>
                  )}
                </svg>
              ) : (
                /* MARS SVG TOPOGRAPHY */
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1000 600"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <radialGradient id="marsGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#431407" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#05070d" stopOpacity="1" />
                    </radialGradient>
                    <radialGradient id="olympusCaldera" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.8" />
                      <stop offset="40%" stopColor="#c2410c" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#450a0a" stopOpacity="0.2" />
                    </radialGradient>
                  </defs>

                  <rect width="1000" height="600" fill="#180a06" />
                  <rect width="1000" height="600" fill="url(#marsGlow)" />

                  {/* Coordinate Graticule Grid */}
                  <g stroke="#7c2d12" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.35">
                    <line x1="0" y1="100" x2="1000" y2="100" />
                    <line x1="0" y1="200" x2="1000" y2="200" />
                    <line x1="0" y1="300" x2="1000" y2="300" stroke="#D6C7B2" strokeWidth="0.8" strokeDasharray="none" opacity="0.4" />
                    <line x1="0" y1="400" x2="1000" y2="400" />
                    <line x1="0" y1="500" x2="1000" y2="500" />

                    <line x1="166" y1="0" x2="166" y2="600" />
                    <line x1="333" y1="0" x2="333" y2="600" />
                    <line x1="500" y1="0" x2="500" y2="600" stroke="#D6C7B2" strokeWidth="0.8" strokeDasharray="none" opacity="0.4" />
                    <line x1="666" y1="0" x2="666" y2="600" />
                    <line x1="833" y1="0" x2="833" y2="600" />
                  </g>

                  {/* Lowlands */}
                  <g fill="#260f08" stroke="#3b170e" strokeWidth="1.2" opacity="0.8">
                    <ellipse cx="375" cy="218" rx="85" ry="60" fill="#30130a" />
                    <ellipse cx="600" cy="240" rx="65" ry="50" fill="#2d1109" />
                    <ellipse cx="670" cy="460" rx="95" ry="70" fill="#220b06" stroke="#451a0f" strokeWidth="2" />
                    <ellipse cx="730" cy="275" rx="80" ry="55" fill="#35140b" />
                  </g>

                  {/* Valles Marineris */}
                  <g stroke="#0f0402" strokeWidth="6" strokeLinecap="round" opacity="0.9">
                    <path d="M 270,300 Q 340,310 400,325 T 510,340" />
                  </g>

                  {/* Olympus Mons */}
                  <circle cx="160" cy="240" r="55" fill="url(#olympusCaldera)" stroke="#7c2d12" strokeWidth="1" />

                  {/* Tharsis Montes */}
                  <g fill="#9a3412" stroke="#ea580c" strokeWidth="1.2">
                    <circle cx="230" cy="180" r="14" />
                    <circle cx="215" cy="255" r="13" />
                    <circle cx="195" cy="330" r="15" />
                  </g>

                  {/* Geographic Labels */}
                  {showLabels && (
                    <g fill="#fdba74" fontSize="10" fontFamily="monospace" letterSpacing="1" opacity="0.65">
                      <text x="120" y="245">OLYMPUS MONS</text>
                      <text x="320" y="355">VALLES MARINERIS</text>
                      <text x="315" y="210">CHRYSE PLANITIA</text>
                      <text x="440" y="300">MERIDIANI PLANUM</text>
                      <text x="560" y="225">ISIDIS / JEZERO</text>
                      <text x="690" y="270">ELYSIUM PLANITIA</text>
                    </g>
                  )}
                </svg>
              )}

              {/* 2D Spacecraft Markers */}
              {bodyMissions.map((mission) => {
                const isSelected = selectedMission?.id === mission.id;
                const isHovered = hoveredMission2D?.id === mission.id;

                return (
                  <div
                    key={mission.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-transform duration-200"
                    style={{
                      left: `${mission.coordinates.xPercent}%`,
                      top: `${mission.coordinates.yPercent}%`,
                      transform: `translate(-50%, -50%) ${isSelected || isHovered ? 'scale(1.2)' : 'scale(1)'}`,
                    }}
                    onClick={() => {
                      sound.playBeaconLock();
                      onSelectMission(mission);
                    }}
                    onMouseEnter={() => {
                      sound.playClick(1600);
                      setHoveredMission2D(mission);
                    }}
                    onMouseLeave={() => setHoveredMission2D(null)}
                  >
                    {isSelected && (
                      <div className="absolute -inset-3 rounded-full border border-white/40 animate-ping pointer-events-none" />
                    )}

                    {/* NASA 2.0 km Plume Exclusion Buffer Ring in 2D */}
                    {isMoon && showHeritageZones && (
                      <div
                        className="absolute -inset-6 rounded-full border border-dashed border-[#D6C7B2]/40 bg-[#D6C7B2]/5 pointer-events-none"
                        title="NASA 2.0 km Plume Exhaust Exclusion Zone"
                      />
                    )}

                    <div className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/60 bg-[#08080A] shadow-lg">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2]" />
                    </div>
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] font-medium bg-[#08080A]/95 border border-white/10 text-[#F5F5F7]">
                      {mission.callsign.split(' ')[0]} {mission.landingYear}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2D Crosshair readout */}
            {mouseCoords2D && (
              <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-lg border border-white/10 bg-[#08080A]/95 px-3 py-2 font-mono text-[11px] backdrop-blur-md shadow-xl text-[#9A9AA2]">
                <div className="flex items-center gap-2 text-[#F5F5F7] font-semibold mb-0.5">
                  <Crosshair className="h-3.5 w-3.5 text-[#5A5A62]" />
                  <span>SURFACE COORDINATES</span>
                </div>
                <div className="text-[10px] text-[#9A9AA2]">
                  {mouseCoords2D.lat}, {mouseCoords2D.lng} • <span className="text-[#F5F5F7]">{mouseCoords2D.sector}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="flex flex-wrap items-center justify-between border-t border-white/[0.08] bg-[#0F1013] px-4 py-2.5 text-[11px] font-mono text-[#9A9AA2]">
        <div className="flex items-center gap-4">
          <span className="text-[#5A5A62] uppercase text-[10px]">Relic Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D6C7B2]" />
            <span className="text-[#9A9AA2]">Mission Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F5F5F7]" />
            <span className="text-[#9A9AA2]">Signal Lost</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5A5A62]" />
            <span className="text-[#9A9AA2]">Retired</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[#5A5A62] text-[10px]">
          <span>CLICK ANY 3D SURFACE PIN TO ZOOM &amp; ENGAGE HISTORIC DOSSIER</span>
        </div>
      </div>
    </div>
  );
}
