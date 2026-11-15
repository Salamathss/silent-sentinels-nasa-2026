'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MissionRelic, CelestialBody } from '@/data/missions';
import { sound } from '@/utils/audio';
import { getPlanetTextures } from '@/utils/proceduralPlanets';
import type { GlobeInstance } from 'globe.gl';

interface GlobeViewProps {
  missions: MissionRelic[];
  selectedMission: MissionRelic | null;
  onSelectMission: (mission: MissionRelic) => void;
  body: CelestialBody;
  showLabels: boolean;
  autoRotate: boolean;
  showHeritageZones?: boolean;
  onCameraPovChange?: (pov: { lat: number; lng: number; altitude: number }) => void;
  zoomTrigger?: { delta: number; count: number };
  resetTrigger?: number;
}

const ATMOSPHERE = {
  Moon: {
    color: '#cbd5e1',
    altitude: 0.05,
  },
  Mars: {
    color: '#d6c7b2',
    altitude: 0.08,
  },
};

export default function GlobeView({
  missions,
  selectedMission,
  onSelectMission,
  body,
  showLabels,
  autoRotate,
  showHeritageZones = false,
  onCameraPovChange,
  zoomTrigger,
  resetTrigger,
}: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<GlobeInstance | null>(null);
  const [isGlobeReady, setIsGlobeReady] = useState(false);

  // Initialize Globe once on mount (client-side only)
  useEffect(() => {
    let isCancelled = false;

    if (!containerRef.current) return;

    // Dynamically import globe.gl strictly on client
    import('globe.gl').then((module) => {
      if (isCancelled || !containerRef.current) return;

      const GlobeFactory = module.default;
      const initialTextures = getPlanetTextures(body);
      const atmosphere = ATMOSPHERE[body];

      // Instantiate globe
      const globe = new GlobeFactory(containerRef.current)
        .backgroundColor('rgba(4, 6, 11, 0)')
        .globeImageUrl(initialTextures.map)
        .bumpImageUrl(initialTextures.bump)
        .showAtmosphere(true)
        .atmosphereColor(atmosphere.color)
        .atmosphereAltitude(atmosphere.altitude);

      // Setup controls
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 0.5;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 140;
        controls.maxDistance = 500;
      }

      // Track camera position for HUD
      globe.onZoom((pov) => {
        if (onCameraPovChange) {
          onCameraPovChange(pov);
        }
      });

      // Responsive sizing (always non-zero safe minimums)
      const updateDimensions = () => {
        if (!containerRef.current) return;
        const width = Math.max(containerRef.current.clientWidth, 400);
        const height = Math.max(containerRef.current.clientHeight || 500, 480);
        globe.width(width).height(height);
      };

      updateDimensions();

      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(containerRef.current);

      globeInstanceRef.current = globe;
      setIsGlobeReady(true);

      // Initial point of view
      const firstMission = missions[0];
      if (firstMission) {
        globe.pointOfView(
          {
            lat: firstMission.coordinates.lat,
            lng: firstMission.coordinates.lng,
            altitude: 1.8,
          },
          1200
        );
      }
    });

    return () => {
      isCancelled = true;
      if (globeInstanceRef.current) {
        try {
          globeInstanceRef.current._destructor();
        } catch {
          // ignore cleanup errors
        }
        globeInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update planetary surface texture when body changes
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !isGlobeReady) return;

    const textures = getPlanetTextures(body);
    const atmosphere = ATMOSPHERE[body];
    globe
      .globeImageUrl(textures.map)
      .bumpImageUrl(textures.bump)
      .atmosphereColor(atmosphere.color)
      .atmosphereAltitude(atmosphere.altitude);

    // Re-center camera on target
    const targetMission = selectedMission && selectedMission.body === body
      ? selectedMission
      : missions[0];

    if (targetMission) {
      globe.pointOfView(
        {
          lat: targetMission.coordinates.lat,
          lng: targetMission.coordinates.lng,
          altitude: 1.8,
        },
        1400
      );
    }
  }, [body, isGlobeReady, missions, selectedMission]);

  // Update auto-rotation when prop changes
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !isGlobeReady) return;
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.5;
    }
  }, [autoRotate, isGlobeReady]);

  // Handle fly-to camera when selected mission changes
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !isGlobeReady || !selectedMission) return;

    if (selectedMission.body === body) {
      globe.pointOfView(
        {
          lat: selectedMission.coordinates.lat,
          lng: selectedMission.coordinates.lng,
          altitude: 1.35,
        },
        1200
      );
    }
  }, [selectedMission, body, isGlobeReady]);

  // Handle external zoom controls
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !isGlobeReady || !zoomTrigger) return;
    const current = globe.pointOfView();
    const newAltitude = Math.max(0.4, Math.min(3.2, current.altitude + zoomTrigger.delta));
    globe.pointOfView({ ...current, altitude: newAltitude }, 400);
  }, [zoomTrigger, isGlobeReady]);

  // Handle external reset view
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !isGlobeReady || !resetTrigger) return;
    const target = selectedMission && selectedMission.body === body
      ? selectedMission
      : missions[0];
    if (target) {
      globe.pointOfView(
        {
          lat: target.coordinates.lat,
          lng: target.coordinates.lng,
          altitude: 1.8,
        },
        1000
      );
    }
  }, [resetTrigger, body, isGlobeReady, missions, selectedMission]);

  // Render 3D Radar Wave Rings
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !isGlobeReady) return;

    const ringData = missions.map((m) => {
      const isSelected = m.id === selectedMission?.id;
      const isHeritage = body === 'Moon' && showHeritageZones;
      return {
        lat: m.coordinates.lat,
        lng: m.coordinates.lng,
        isSelected,
        isHeritage,
        maxR: isSelected ? 4.5 : isHeritage ? 4.0 : 2.5,
        propagationSpeed: isSelected ? 2.0 : isHeritage ? 1.0 : 1.2,
        repeatPeriod: isSelected ? 1400 : isHeritage ? 2600 : 2200,
      };
    });

    const ringColorInterpolator = (d: object) => (t: number) => {
      const alpha = Math.sqrt(1 - t) * 0.6;
      const item = d as { isHeritage?: boolean; isSelected?: boolean };
      if (item.isSelected) {
        return `rgba(214, 199, 178, ${alpha * 1.2})`; // Brushed Titanium / Champagne
      }
      if (item.isHeritage) {
        return `rgba(245, 245, 247, ${alpha * 0.75})`; // Crisp White Heritage Ring
      }
      return `rgba(214, 199, 178, ${alpha * 0.45})`;
    };

    globe
      .ringsData(ringData)
      .ringLat((d) => (d as { lat: number }).lat)
      .ringLng((d) => (d as { lng: number }).lng)
      .ringMaxRadius((d) => (d as { maxR: number }).maxR)
      .ringPropagationSpeed((d) => (d as { propagationSpeed: number }).propagationSpeed)
      .ringRepeatPeriod((d) => (d as { repeatPeriod: number }).repeatPeriod)
      .ringColor((d: object) => ringColorInterpolator(d));
  }, [missions, selectedMission, body, isGlobeReady, showHeritageZones]);

  // Render Interactive 3D DOM Markers (HTML Elements) - Architectural Dark Luxury Minimalist
  const createMarkerElement = useCallback(
    (mission: MissionRelic) => {
      const isSelected = mission.id === selectedMission?.id;
      const champagneHex = '#D6C7B2';
      const bgHex = isSelected ? 'rgba(214, 199, 178, 0.25)' : 'rgba(15, 16, 19, 0.9)';
      const borderHex = isSelected ? '#D6C7B2' : 'rgba(255, 255, 255, 0.55)';

      const el = document.createElement('div');
      el.className = 'group relative -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none';
      el.style.pointerEvents = 'auto';

      el.innerHTML = `
        <div class="flex flex-col items-center">
          ${
            isSelected
              ? `<div class="absolute -inset-2 rounded-full animate-ping opacity-60 pointer-events-none" style="background: ${champagneHex}"></div>`
              : ''
          }
          <div class="relative flex items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-125" style="width: ${
            isSelected ? '18px' : '12px'
          }; height: ${isSelected ? '18px' : '12px'}; background: ${bgHex}; border: 1.5px solid ${borderHex}; box-shadow: 0 0 10px ${
            isSelected ? 'rgba(214, 199, 178, 0.6)' : 'rgba(0, 0, 0, 0.8)'
          };">
            <div class="rounded-full" style="width: ${
              isSelected ? '5px' : '3px'
            }; height: ${isSelected ? '5px' : '3px'}; background: #ffffff;"></div>
          </div>
          <div class="mt-1 transition-all duration-200 ${
            showLabels ? 'opacity-90' : 'opacity-0 group-hover:opacity-100'
          } pointer-events-none">
            <div class="flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] font-mono whitespace-nowrap shadow-xl" style="background: rgba(8, 8, 10, 0.94); backdrop-filter: blur(8px); border-color: ${
              isSelected ? '#D6C7B2' : 'rgba(255, 255, 255, 0.12)'
            }; color: #F5F5F7;">
              <span style="color: ${isSelected ? '#D6C7B2' : '#F5F5F7'}; font-weight: 600;">${
        mission.name.split(' ')[0]
      }</span>
              <span style="color: #9A9AA2;">${mission.landingYear}</span>
            </div>
          </div>
        </div>
      `;

      el.onclick = (e) => {
        e.stopPropagation();
        sound.playBeaconLock();
        onSelectMission(mission);
      };

      return el;
    },
    [selectedMission, showLabels, onSelectMission]
  );

  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !isGlobeReady) return;

    globe
      .htmlElementsData(missions)
      .htmlLat((d) => (d as MissionRelic).coordinates.lat)
      .htmlLng((d) => (d as MissionRelic).coordinates.lng)
      .htmlAltitude(0.015)
      .htmlElement((d) => createMarkerElement(d as MissionRelic))
      .htmlElementVisibilityModifier((el, isVisible) => {
        el.style.opacity = isVisible ? '1' : '0';
        el.style.pointerEvents = isVisible ? 'auto' : 'none';
      });
  }, [missions, isGlobeReady, createMarkerElement]);

  return (
    <div className="relative w-full h-full min-h-[480px] md:min-h-[580px] flex items-center justify-center overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {!isGlobeReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#08080A]/95 backdrop-blur-md z-30 font-mono">
          <div className="relative flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-2 border-white/10 border-t-[#D6C7B2] animate-spin" />
          </div>
          <span className="mt-4 text-xs font-semibold tracking-widest text-[#F5F5F7] uppercase">
            INITIALIZING 3D {body.toUpperCase()} TOPOGRAPHY
          </span>
          <span className="mt-1 text-[11px] text-[#9A9AA2]">
            Synthesizing high-res NASA planetary relief surface...
          </span>
        </div>
      )}
    </div>
  );
}
