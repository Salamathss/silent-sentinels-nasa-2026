/**
 * Bespoke NASA Technical Blueprint SVG Generator
 * Generates editorial, vector SVG schematics for Moon and Mars relics
 * used as instantaneous, zero-broken-image fallbacks for archival photography.
 * Styled in Dark Luxury Minimalism (Titanium & Warm Champagne palette).
 */

import { MissionRelic } from '@/data/missions';

export function getSpacecraftBlueprintSvg(mission: MissionRelic): string {
  const isMoon = mission.body === 'Moon';
  const accent = isMoon ? '#E4E4E8' : '#D6C7B2';
  const accentMuted = isMoon ? 'rgba(228, 228, 232, 0.14)' : 'rgba(214, 199, 178, 0.14)';
  const bodyUpper = mission.body.toUpperCase();
  const typeUpper = mission.category.toUpperCase();
  const latStr = `${mission.coordinates.lat >= 0 ? '+' : ''}${mission.coordinates.lat.toFixed(2)}°`;
  const lngStr = `${mission.coordinates.lng >= 0 ? '+' : ''}${mission.coordinates.lng.toFixed(2)}°`;

  // Generate vector schematic based on spacecraft category
  let schematicPaths = '';

  if (mission.category === 'Lander') {
    // Lander schematic: Tripod landing gear, hexagonal deck, dish & instrument masts
    schematicPaths = `
      <!-- Lander Core Body & Deck -->
      <polygon points="340,240 460,240 480,290 320,290" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <rect x="360" y="210" width="80" height="30" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="4,2" />
      <!-- High Gain Antenna Dish -->
      <path d="M 430,210 Q 470,170 480,140" fill="none" stroke="${accent}" stroke-width="2" />
      <ellipse cx="485" cy="135" rx="24" ry="12" fill="none" stroke="${accent}" stroke-width="2" transform="rotate(-30 485 135)" />
      <line x1="485" y1="135" x2="505" y2="125" stroke="${accent}" stroke-width="1.5" />
      <!-- Descent Thruster Engine Bell -->
      <polygon points="380,290 420,290 435,325 365,325" fill="none" stroke="${accent}" stroke-width="2" />
      <ellipse cx="400" cy="325" rx="35" ry="6" fill="${accentMuted}" stroke="${accent}" stroke-width="1.5" />
      <!-- Landing Legs & Footpads -->
      <line x1="330" y1="280" x2="250" y2="360" stroke="${accent}" stroke-width="3" />
      <line x1="280" y1="330" x2="330" y2="345" stroke="${accent}" stroke-width="1.5" />
      <rect x="230" y="360" width="40" height="8" rx="3" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      
      <line x1="470" y1="280" x2="550" y2="360" stroke="${accent}" stroke-width="3" />
      <line x1="520" y1="330" x2="470" y2="345" stroke="${accent}" stroke-width="1.5" />
      <rect x="530" y="360" width="40" height="8" rx="3" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      
      <line x1="400" y1="290" x2="400" y2="365" stroke="${accent}" stroke-width="2" stroke-dasharray="3,3" />
      <rect x="385" y="365" width="30" height="6" rx="2" fill="${accentMuted}" stroke="${accent}" stroke-width="1.5" />
      
      <!-- Sensor Mast -->
      <line x1="365" y1="210" x2="365" y2="160" stroke="${accent}" stroke-width="1.5" />
      <circle cx="365" cy="155" r="5" fill="${accent}" />
    `;
  } else if (mission.category === 'Rover') {
    // Rover schematic: Rocker-bogie suspension, 6 wheels, camera mast, solar deck
    schematicPaths = `
      <!-- Solar Array Deck -->
      <polygon points="290,240 510,240 480,265 320,265" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <line x1="330" y1="240" x2="330" y2="265" stroke="${accent}" stroke-width="1" />
      <line x1="400" y1="240" x2="400" y2="265" stroke="${accent}" stroke-width="1" />
      <line x1="470" y1="240" x2="470" y2="265" stroke="${accent}" stroke-width="1" />
      <!-- Chassis Avionics Box -->
      <rect x="330" y="265" width="140" height="40" fill="none" stroke="${accent}" stroke-width="1.5" />
      <!-- Pancam / Navcam Mast (PMA) -->
      <line x1="450" y1="240" x2="450" y2="150" stroke="${accent}" stroke-width="2.5" />
      <rect x="435" y="135" width="30" height="15" rx="3" fill="${accentMuted}" stroke="${accent}" stroke-width="1.5" />
      <circle cx="442" cy="142" r="3.5" fill="${accent}" />
      <circle cx="458" cy="142" r="3.5" fill="${accent}" />
      <!-- Low Gain Antenna -->
      <line x1="310" y1="240" x2="310" y2="175" stroke="${accent}" stroke-width="1.5" />
      <!-- Rocker-Bogie Suspension Tubes -->
      <line x1="350" y1="285" x2="270" y2="335" stroke="${accent}" stroke-width="2.5" />
      <line x1="270" y1="335" x2="240" y2="360" stroke="${accent}" stroke-width="2" />
      <line x1="270" y1="335" x2="330" y2="360" stroke="${accent}" stroke-width="2" />
      <line x1="440" y1="285" x2="520" y2="340" stroke="${accent}" stroke-width="2.5" />
      <line x1="520" y1="340" x2="550" y2="360" stroke="${accent}" stroke-width="2" />
      <!-- 6 Wheels -->
      <circle cx="230" cy="360" r="16" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <circle cx="330" cy="360" r="16" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <circle cx="430" cy="360" r="16" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <circle cx="560" cy="360" r="16" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <line x1="222" y1="360" x2="238" y2="360" stroke="${accent}" stroke-width="1.5" />
      <line x1="322" y1="360" x2="338" y2="360" stroke="${accent}" stroke-width="1.5" />
      <line x1="422" y1="360" x2="438" y2="360" stroke="${accent}" stroke-width="1.5" />
      <line x1="552" y1="360" x2="568" y2="360" stroke="${accent}" stroke-width="1.5" />
      <!-- Robotic Arm (IDD) -->
      <polyline points="470,290 510,310 535,325" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="2,2" />
      <circle cx="535" cy="325" r="4" fill="${accent}" />
    `;
  } else if (mission.category === 'Helicopter') {
    // Ingenuity schematic: Coaxial twin rotor blades, solar mast, fuselage cube, 4 spindly legs
    schematicPaths = `
      <!-- Top Solar Mast & Panel -->
      <rect x="360" y="125" width="80" height="8" rx="2" fill="${accentMuted}" stroke="${accent}" stroke-width="1.5" />
      <line x1="400" y1="133" x2="400" y2="160" stroke="${accent}" stroke-width="2.5" />
      <!-- Upper Rotor Blade (Counter-Clockwise) -->
      <ellipse cx="400" cy="165" rx="160" ry="8" fill="none" stroke="${accent}" stroke-width="2" />
      <line x1="240" y1="165" x2="560" y2="165" stroke="${accent}" stroke-width="2" />
      <!-- Rotor Hub Spacer -->
      <line x1="400" y1="165" x2="400" y2="195" stroke="${accent}" stroke-width="3" />
      <!-- Lower Rotor Blade (Clockwise) -->
      <ellipse cx="400" cy="200" rx="160" ry="8" fill="none" stroke="${accent}" stroke-width="2" />
      <line x1="240" y1="200" x2="560" y2="200" stroke="${accent}" stroke-width="2" />
      <line x1="400" y1="200" x2="400" y2="230" stroke="${accent}" stroke-width="3" />
      <!-- Avionics Core Cube -->
      <rect x="365" y="230" width="70" height="70" rx="4" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <circle cx="400" cy="265" r="14" fill="none" stroke="${accent}" stroke-width="1.5" stroke-dasharray="4,2" />
      <rect x="388" y="280" width="24" height="12" fill="${accent}" opacity="0.6" />
      <!-- 4 Composite Landing Legs -->
      <line x1="365" y1="290" x2="280" y2="370" stroke="${accent}" stroke-width="2" />
      <line x1="435" y1="290" x2="520" y2="370" stroke="${accent}" stroke-width="2" />
      <line x1="375" y1="300" x2="320" y2="370" stroke="${accent}" stroke-width="1.5" stroke-dasharray="4,2" />
      <line x1="425" y1="300" x2="480" y2="370" stroke="${accent}" stroke-width="1.5" stroke-dasharray="4,2" />
      <circle cx="275" cy="370" r="4" fill="${accent}" />
      <circle cx="525" cy="370" r="4" fill="${accent}" />
      <circle cx="318" cy="370" r="3" fill="${accent}" />
      <circle cx="482" cy="370" r="3" fill="${accent}" />
    `;
  } else if (mission.category === 'Lunar Roving Vehicle') {
    // Apollo 15 LRV-1 schematic: Chassis, 4 open mesh wire wheels, dish TV antenna, seats
    schematicPaths = `
      <!-- Chassis Tubular Frame -->
      <line x1="250" y1="290" x2="550" y2="290" stroke="${accent}" stroke-width="3" />
      <polygon points="280,290 520,290 500,315 300,315" fill="${accentMuted}" stroke="${accent}" stroke-width="1.5" />
      <!-- 2 Fold-down Crew Seats -->
      <polyline points="370,290 370,230 420,230 420,290" fill="none" stroke="${accent}" stroke-width="2" />
      <polyline points="430,290 430,230 480,230 480,290" fill="none" stroke="${accent}" stroke-width="2" />
      <!-- T-Handle Joystick Controller -->
      <line x1="425" y1="270" x2="425" y2="245" stroke="${accent}" stroke-width="2" />
      <line x1="418" y1="245" x2="432" y2="245" stroke="${accent}" stroke-width="2" />
      <!-- Forward High-Gain Parabolic Mesh Antenna -->
      <line x1="280" y1="290" x2="280" y2="180" stroke="${accent}" stroke-width="2.5" />
      <ellipse cx="280" cy="170" rx="35" ry="18" fill="${accentMuted}" stroke="${accent}" stroke-width="2" transform="rotate(-20 280 170)" />
      <line x1="280" y1="170" x2="295" y2="150" stroke="${accent}" stroke-width="1.5" />
      <!-- Color TV Camera -->
      <line x1="240" y1="290" x2="240" y2="225" stroke="${accent}" stroke-width="2" />
      <rect x="230" y="215" width="20" height="14" fill="${accentMuted}" stroke="${accent}" stroke-width="1.5" />
      <!-- 4 Wire-Mesh Wheels with Chevrons -->
      <circle cx="230" cy="340" r="28" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <circle cx="230" cy="340" r="14" fill="none" stroke="${accent}" stroke-width="1.5" />
      <circle cx="560" cy="340" r="28" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <circle cx="560" cy="340" r="14" fill="none" stroke="${accent}" stroke-width="1.5" />
      <line x1="250" y1="290" x2="230" y2="340" stroke="${accent}" stroke-width="3" />
      <line x1="550" y1="290" x2="560" y2="340" stroke="${accent}" stroke-width="3" />
    `;
  } else {
    // Apollo 11 Module (Descent Stage) schematic: Octagonal faceted foil, 4 outriggers, DPS engine bell
    schematicPaths = `
      <!-- Faceted Octagonal Descent Stage Bus -->
      <polygon points="330,210 470,210 520,285 470,325 330,325 280,285" fill="${accentMuted}" stroke="${accent}" stroke-width="2.5" />
      <!-- Kapton Foil Cross-Hatching -->
      <line x1="330" y1="210" x2="470" y2="325" stroke="${accent}" stroke-width="1" stroke-dasharray="4,4" />
      <line x1="470" y1="210" x2="330" y2="325" stroke="${accent}" stroke-width="1" stroke-dasharray="4,4" />
      <rect x="360" y="240" width="80" height="55" fill="none" stroke="${accent}" stroke-width="1.5" />
      <!-- Ascent Stage Docking Interface Ring -->
      <ellipse cx="400" cy="210" rx="55" ry="12" fill="none" stroke="${accent}" stroke-width="2" />
      <!-- DPS Gimbaled Rocket Engine Bell -->
      <polygon points="370,325 430,325 450,370 350,370" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <ellipse cx="400" cy="370" rx="50" ry="9" fill="none" stroke="${accent}" stroke-width="2" />
      <!-- 4 Quad Outrigger Landing Gear & Footpads -->
      <line x1="310" y1="300" x2="200" y2="385" stroke="${accent}" stroke-width="3.5" />
      <line x1="260" y1="350" x2="330" y2="350" stroke="${accent}" stroke-width="2" />
      <ellipse cx="190" cy="388" rx="24" ry="7" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <line x1="190" y1="388" x2="190" y2="408" stroke="${accent}" stroke-width="1" /> <!-- Lunar Surface Probe -->
      
      <line x1="490" y1="300" x2="600" y2="385" stroke="${accent}" stroke-width="3.5" />
      <line x1="540" y1="350" x2="470" y2="350" stroke="${accent}" stroke-width="2" />
      <ellipse cx="610" cy="388" rx="24" ry="7" fill="${accentMuted}" stroke="${accent}" stroke-width="2" />
      <line x1="610" y1="388" x2="610" y2="408" stroke="${accent}" stroke-width="1" />
      
      <!-- Plaque on Front Strut -->
      <rect x="290" y="325" width="22" height="14" fill="${accent}" opacity="0.8" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
      <defs>
        <!-- Architectural Dark Luxury Grid Pattern -->
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.7" />
          <circle cx="40" cy="40" r="0.8" fill="rgba(255,255,255,0.12)" />
        </pattern>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#08080A" />
          <stop offset="100%" stop-color="#0F1013" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="800" height="450" fill="url(#bgGrad)" />
      <rect width="800" height="450" fill="url(#grid)" />

      <!-- Corner Aerospace Crosshairs -->
      <g stroke="${accent}" stroke-width="1" opacity="0.6">
        <path d="M 25 35 L 25 25 L 35 25" fill="none" />
        <path d="M 775 35 L 775 25 L 765 25" fill="none" />
        <path d="M 25 415 L 25 425 L 35 425" fill="none" />
        <path d="M 775 415 L 775 425 L 765 425" fill="none" />
        <circle cx="30" cy="30" r="1.2" fill="${accent}" />
        <circle cx="770" cy="30" r="1.2" fill="${accent}" />
      </g>

      <!-- Top Technical Eyebrow -->
      <text x="40" y="44" fill="${accent}" font-family="ui-monospace, SFMono-Regular, monospace" font-size="9" font-weight="600" letter-spacing="2">
        NASA TECHNICAL BLUEPRINT // ARCHIVAL RELIC SCHEMATIC
      </text>
      <text x="760" y="44" text-anchor="end" fill="#9A9AA2" font-family="ui-monospace, SFMono-Regular, monospace" font-size="9" letter-spacing="1">
        DSN-NAV // REF: ${mission.id.toUpperCase()}
      </text>
      <line x1="40" y1="54" x2="760" y2="54" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

      <!-- Spacecraft Core Vector Schematic -->
      <g>
        ${schematicPaths}
      </g>

      <!-- Dimension Baseline Markers -->
      <line x1="160" y1="395" x2="640" y2="395" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="6,4" />
      <text x="400" y="410" text-anchor="middle" fill="#5A5A62" font-family="ui-monospace, SFMono-Regular, monospace" font-size="8" letter-spacing="1.5">
        SURFACE RESTING PLANE // ZERO DE-ORBIT / DESCENT TRAJECTORY
      </text>

      <!-- Bottom Info Overlay Box -->
      <line x1="40" y1="422" x2="760" y2="422" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
      <text x="40" y="437" fill="#F5F5F7" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11" font-weight="600" letter-spacing="1">
        ${mission.name.toUpperCase()}
      </text>
      <text x="400" y="437" text-anchor="middle" fill="#9A9AA2" font-family="ui-monospace, SFMono-Regular, monospace" font-size="9">
        ${bodyUpper} // ${typeUpper} • ${latStr}, ${lngStr}
      </text>
      <text x="760" y="437" text-anchor="end" fill="${accent}" font-family="ui-monospace, SFMono-Regular, monospace" font-size="9" font-weight="600" letter-spacing="1">
        [ ${mission.status.toUpperCase()} ]
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
