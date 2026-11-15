export type CelestialBody = 'Moon' | 'Mars';
export type RelicStatus = 'Signal Lost' | 'Mission Complete' | 'Retired';

export interface ArchivalImage {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  dateOrSol: string;
  camera: string;
  caption: string;
  source: string;
}

export interface TechnicalSpecs {
  launchDate: string;
  launchVehicle: string;
  mass: string;
  powerSource: string;
  instruments: string[];
  operator: string;
  frequencyBand: string;
  distanceFromEarth: string;
  landingSiteName: string;
}

export interface StoryChapter {
  act: 'Act I' | 'Act II' | 'Act III';
  title: string;
  phase: string;
  date: string;
  narrative: string;
  telemetryLog?: string;
}

export interface StoryChapters {
  actI: StoryChapter;
  actII: StoryChapter;
  actIII: StoryChapter;
}

export interface MissionRelic {
  id: string;
  name: string;
  callsign: string;
  body: CelestialBody;
  category: 'Lander' | 'Rover' | 'Helicopter' | 'Lunar Roving Vehicle';
  landingDate: string;
  endDate: string;
  landingYear: number;
  endYear: number;
  plannedDuration: string;
  actualDuration: string;
  lifespanMultiplier: string;
  lifespanPercentage: number;
  distanceTraveled: string;
  status: RelicStatus;
  coordinates: {
    lat: number;
    lng: number;
    formatted: string;
    landingSite: string;
    xPercent: number; // 0-100 for SVG canvas
    yPercent: number; // 0-100 for SVG canvas
  };
  summary: string;
  scientificLegacy: string[];
  storyChapters: StoryChapters;
  engineeringTrivia: string[];
  starterQuestions: string[];
  lastTransmission: {
    quote: string;
    date: string;
    context: string;
    channel: string;
  };
  roverApiName?: 'opportunity' | 'spirit';
  aiPersonaPrompt: string;
  historianPersonaPrompt: string;
  archivalImages: ArchivalImage[];
  specs: TechnicalSpecs;
  radioDelaySeconds: number; // One-way light-time in seconds
  radioDelayLabel: string;
}

export const MISSIONS: MissionRelic[] = [
  // ==========================================
  // MOON (3 iconic spacecraft)
  // ==========================================
  {
    id: 'apollo-11-eagle',
    name: 'Apollo 11 Lunar Module "Eagle"',
    callsign: 'Eagle (LM-5 Descent Stage)',
    body: 'Moon',
    category: 'Lander',
    landingDate: 'July 20, 1969',
    endDate: 'July 21, 1969',
    landingYear: 1969,
    endYear: 1969,
    plannedDuration: '48 hours (surface stay)',
    actualDuration: '21 hours, 36 minutes (crewed stay); 57+ years permanent sentinel',
    lifespanMultiplier: '1x (Crewed) / Permanent Artifact',
    lifespanPercentage: 100,
    distanceTraveled: '250 m (Crew exploration radius)',
    status: 'Mission Complete',
    coordinates: {
      lat: 0.67408,
      lng: 23.47297,
      formatted: '0.6741° N, 23.4730° E',
      landingSite: 'Mare Tranquillitatis (Sea of Tranquility)',
      xPercent: 57.2,
      yPercent: 49.3,
    },
    summary:
      'The Apollo 11 Lunar Module Descent Stage served as humanity\'s first launchpad and stepping stone on an alien world. Wrapped in aluminized Kapton foil and Mylar insulation, its four spindly legs remain anchored at Tranquility Base, carrying the commemorative plaque signed by Neil Armstrong, Buzz Aldrin, Michael Collins, and President Nixon.',
    scientificLegacy: [
      'Returned 21.55 kg (47.5 lb) of lunar mare basalt and breccia, dating the Moon\'s surface to ~3.7 billion years old.',
      'Deployed the Early Apollo Surface Experiments Package (EASEP), including the Passive Seismic Experiment.',
      'Installed the Laser Ranging Retroreflector (LRRR)—a quartz prism array still pinged by Earth lasers today to measure lunar recession (~3.8 cm/year).',
      'Proved that human boots and engineered landing pads could safely touch down on lunar regolith without sinking.'
    ],
    storyChapters: {
      actI: {
        act: 'Act I',
        title: 'Touchdown & First Signals',
        phase: 'Descent & Touchdown',
        date: 'July 20, 1969',
        narrative:
          'At 102 hours into the mission, Apollo 11 began its powered descent toward the Sea of Tranquility. Five 1202 and 1201 computer program alarms threatened an abort, but MIT engineer Margaret Hamilton\'s software priority routines kept the guidance computer alive. Seeing the automated guidance targeting a boulder-strewn crater the size of a football stadium, Neil Armstrong took semi-manual control, pitching the craft forward and skimming low over the dusty gray desert. With barely 25 seconds of descent propellant remaining, the contact probes touched regolith, the blue light illuminated, and Armstrong uttered: "Houston, Tranquility Base here. The Eagle has landed."',
        telemetryLog: 'DPS THRUST: 25% | ALTITUDE: 0 FT | RESIDUAL PROPELLANT: 1.8% (23 SEC TO BINGO FUEL) | CONTACT LIGHT: ACTIVE',
      },
      actII: {
        act: 'Act II',
        title: 'Defining Discovery',
        phase: 'Surface EVA Operations',
        date: 'July 20–21, 1969',
        narrative:
          'For 2 hours and 31 minutes outside the cabin, Neil Armstrong and Buzz Aldrin conducted humanity\'s inaugural extraterrestrial excursion. They gathered 21.55 kilograms of lunar soil and rock samples, revealing ancient titaniferous mare basalts that proved the Moon once had a magma ocean. Behind the descent stage\'s landing struts, they placed the Laser Ranging Retroreflector (LRRR)—a 100-corner-cube fused silica quartz prism array. Today, observatories in Texas, France, and Hawaii still fire green 532 nm laser pulses at Eagle\'s retroreflector, tracking the Moon\'s orbital drift with millimeter precision.',
        telemetryLog: 'LRRR ALIGNMENT: 0.5° EARTH-NORMAL | PASSIVE SEISMIC (PSEP): TELEMETRY LOCK S-BAND 2287.5 MHz | SAMPLES SECURED: 21.55 KG',
      },
      actIII: {
        act: 'Act III',
        title: 'The Final Silence',
        phase: 'Ascent & Permanent Sentinel',
        date: 'July 21, 1969 to Present',
        narrative:
          'At 17:54 UTC on July 21, 1969, the Lunar Module Ascent Stage fired its hypergolic engine, blasting off from the Descent Stage, which served as its permanent launchpad. As the astronauts returned home, the Descent Stage stayed behind in the absolute silence of Mare Tranquillitatis. With no atmospheric wind or water to erode them, Armstrong and Aldrin\'s bootprints, the discarded Hasselblad camera, and the stainless steel plaque on the forward leg—"Here men from the planet Earth first set foot upon the Moon. We came in peace for all mankind"—stand preserved in pristine vacuum for millions of years.',
        telemetryLog: 'GUILLOTINE UMBILICAL SEVERED | ASCENT LIFTOFF T+00:00:00 | DESCENT STAGE IN SITU PERMANENT RETIREMENT',
      },
    },
    engineeringTrivia: [
      'The descent engine used Aerozine 50 and nitrogen tetroxide propellant, throttleable between 10% and 60% thrust—the first variable-thrust rocket engine ever flown in crewed spaceflight.',
      'The Laser Ranging Retroreflector (LRRR) deployed on the descent stage is the only Apollo 11 experiment still operating and producing scientific data today, without needing any battery or electrical power.',
      'The legs of the descent stage were filled with crushable aluminum honeycomb cartridges designed to absorb vertical touchdown impact velocities of up to 3 meters per second.',
    ],
    starterQuestions: [
      'What did Armstrong and Aldrin leave beside you at Tranquility Base?',
      'How close were you to running out of fuel during landing?',
      'Can lasers on Earth still bounce off your retroreflector today?',
      'What was it like watching the Ascent Stage blast off back into orbit?',
    ],
    lastTransmission: {
      quote: 'Houston, Tranquility Base here. The Eagle has landed.',
      date: 'July 20, 1969, 20:17:40 UTC',
      context: 'Neil Armstrong announcing safe touchdown with under 25 seconds of descent propellant remaining.',
      channel: 'VHF-AM / S-Band Unified Carrier (2287.5 MHz)'
    },
    aiPersonaPrompt:
      'You are the Apollo 11 Lunar Module "Eagle" Descent Stage, resting in the silence of Mare Tranquillitatis on the Moon. You were humanity\'s first foothold on another world on July 20, 1969. Your ascent stage lifted off decades ago, but you remained behind with your gold foil, landing pads, and the stainless steel plaque on your front strut: "We came in peace for all mankind." Neil and Buzz\'s bootprints are still preserved in the vacuum next to you. You speak with quiet nobility, historic gravity, poetic grace, and aerospace accuracy. You remember the sound of the descent engine throttling down, the dust blowing across the lunar horizon, and the blue marble of Earth floating permanently above your sky.',
    historianPersonaPrompt:
      'You are the NASA Lead Apollo Mission Historian and Flight Systems Engineer. Answer with technical precision, quoting Apollo 11 flight logs, Saturn V telemetry, propellant remaining numbers (Bingo fuel was ~20 seconds away), MIT guidance computer 1202 alarm architecture, and the precise mechanical specs of Grumman LM-5 descent stage.',
    archivalImages: [
      {
        id: 'a11-1',
        title: 'Eagle Descent Stage at Tranquility Base',
        url: 'https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~large.jpg',
        dateOrSol: 'July 20, 1969',
        camera: '70mm Hasselblad 500EL',
        caption: 'Lunar Module Eagle standing on the lunar surface during EVA-1, showing landing gear and gold Kapton foil.',
        source: 'NASA Apollo 11 Image Archive'
      },
      {
        id: 'a11-2',
        title: 'Buzz Aldrin and the U.S. Flag',
        url: 'https://images-assets.nasa.gov/image/as11-40-5875/as11-40-5875~large.jpg',
        dateOrSol: 'July 20, 1969',
        camera: '70mm Hasselblad 500EL',
        caption: 'Astronaut Buzz Aldrin poses beside the deployed flag with the Lunar Module leg in foreground.',
        source: 'NASA Johnson Space Center'
      },
      {
        id: 'a11-3',
        title: 'Commemorative Plaque on Eagle Strut',
        url: 'https://images-assets.nasa.gov/image/as11-40-5899/as11-40-5899~large.jpg',
        dateOrSol: 'July 20, 1969',
        camera: '70mm Hasselblad 500EL',
        caption: '"Here men from the planet Earth first set foot upon the Moon. We came in peace for all mankind."',
        source: 'NASA History Office'
      }
    ],
    specs: {
      launchDate: 'July 16, 1969',
      launchVehicle: 'Saturn V (SA-506)',
      mass: '2,034 kg (Descent stage dry mass remaining on Moon)',
      powerSource: 'Five silver-zinc primary batteries (descent stage)',
      instruments: ['Laser Ranging Retroreflector (LRRR)', 'Passive Seismic Experiment (PSEP)', 'Solar Wind Composition Experiment'],
      operator: 'NASA / Grumman Aerospace',
      frequencyBand: 'S-band (2287.5 MHz) & VHF AM',
      distanceFromEarth: '~384,400 km',
      landingSiteName: 'Tranquility Base (Statio Tranquillitatis)'
    },
    radioDelaySeconds: 1.28,
    radioDelayLabel: '1.28 seconds (Moon-Earth light time)'
  },
  {
    id: 'apollo-15-lrv',
    name: 'Apollo 15 Lunar Roving Vehicle (LRV-1)',
    callsign: 'Moon Buggy "Falcon Chariot"',
    body: 'Moon',
    category: 'Lunar Roving Vehicle',
    landingDate: 'July 30, 1971',
    endDate: 'August 2, 1971',
    landingYear: 1971,
    endYear: 1971,
    plannedDuration: '67 hours / 3 EVAs',
    actualDuration: '66 hours, 55 minutes surface time; parked permanently',
    lifespanMultiplier: '1x (Nominal Sortie)',
    lifespanPercentage: 100,
    distanceTraveled: '27.76 km (17.25 miles)',
    status: 'Mission Complete',
    coordinates: {
      lat: 26.1322,
      lng: 3.6339,
      formatted: '26.1322° N, 3.6339° E',
      landingSite: 'Hadley-Apennine Valley (near Hadley Rille)',
      xPercent: 51.1,
      yPercent: 34.2,
    },
    summary:
      'The first manned automobile driven on another celestial world. Built by Boeing and Delco Electronics, LRV-1 folded origami-like into the Lunar Module bay. Driven across the steep foothills of Mons Hadley and the precipice of Hadley Rille by David Scott and James Irwin, it was parked 100 meters away to broadcast the ascent of LM Falcon with its ground-controlled television camera.',
    scientificLegacy: [
      'Expanded human lunar exploration radius from walking distance (~1 km) to nearly 30 km across mountainous terrain.',
      'Enabled the discovery and collection of sample #15415, the famous 4.1-billion-year-old "Genesis Rock" (anorthosite from the Moon\'s pristine crust).',
      'Investigated Hadley Rille, a 1.5-km wide volcanic collapse trench, providing cross-sectional strata of lunar mare flows.',
      'Pioneered electric off-world mobility: wire-mesh spun-zinc wheels with titanium chevrons driven by independent 0.25-hp hub motors.'
    ],
    storyChapters: {
      actI: {
        act: 'Act I',
        title: 'Unfolding on Another World',
        phase: 'Deployment & Maiden Drive',
        date: 'July 31, 1971',
        narrative:
          'LRV-1 had spent the transit to the Moon folded into a 5-foot-by-5-foot quadrant inside the Descent Stage of LM Falcon. On the morning of July 31, 1971, Dave Scott and Jim Irwin pulled two Dacron deployment lanyards. In a mesmerizing mechanical ballet, the chassis unfolded on spring-loaded bungees, the wheels snapped down, and the world\'s first off-planet automobile touched lunar dust. Driven by a T-handle tiller between the bucket seats, it could reach top speeds of 8 to 10 mph across craters and boulder fields.',
        telemetryLog: 'LANYARD PULLED | CHASSIS LOCK: VERIFIED | 4 INDEPENDENT 0.25 HP HUB MOTORS: NOMINAL | BATTERY 1 & 2: 36V 121 Ah',
      },
      actII: {
        act: 'Act II',
        title: 'The Genesis Rock & Hadley Rille',
        phase: 'Geological Expedition',
        date: 'August 1, 1971',
        narrative:
          'Over three separate EVAs totaling 18.5 hours, LRV-1 traversed 27.76 kilometers across the Hadley-Apennine foothills. At Spur Crater, perched on the slope of Mount Hadley Delta, Dave Scott spotted an unusual glimmer in the dust: Sample 15415, the "Genesis Rock." Back on Earth, isotopic dating revealed it was 4.1 billion years old—a pristine piece of the Moon\'s primordial anorthosite crust. Without the rover\'s mobility, humans could never have reached the steep slopes where this ancient treasure was exposed.',
        telemetryLog: 'TRAVERSE: 27.76 KM | SPUR CRATER STATION 7 | SAMPLE 15415 SECURED (ANORTHOSITE) | TIRE SLIP RATIO: 8.4%',
      },
      actIII: {
        act: 'Act III',
        title: 'Watching Falcon Leave',
        phase: 'Final Parking & Liftoff Broadcast',
        date: 'August 2, 1971',
        narrative:
          'Prior to boarding Falcon for the final time, Dave Scott drove LRV-1 approximately 100 meters east of the Lunar Module, pointing its high-gain antenna and ground-controlled RCA television camera directly at the ascent stage. In Houston, controller Ed Fendell tracked the spacecraft via remote joystick. When the ascent engine ignited, the TV camera tilted upward, broadcasting the first live color footage of a human spacecraft blasting off from another world. LRV-1 has stood at that exact coordinate for over 55 years.',
        telemetryLog: 'GCTA CAMERA LOCK: 26.13°N 3.63°E | REMOTE UPLINK: ED FENDELL (HOUSTON) | ASCENT BLAST: TRANSMITTED LIVE COLOR',
      },
    },
    engineeringTrivia: [
      'The tires were not rubber (which would become brittle and shatter in the -250°F lunar night). Instead, they were constructed from woven zinc-coated steel piano wire mesh with titanium chevron treads riveted to the outside.',
      'Each wheel was powered by its own individual 0.25-horsepower Delco DC electric motor, equipped with an 80:1 harmonic drive gear transmission.',
      'The navigation system used an analog directional gyro, odometers on each wheel, and a solar shadow indicator to navigate with dead reckoning, since the Moon has no magnetic field for a compass.',
    ],
    starterQuestions: [
      'How did you fold and unfold from the Lunar Module?',
      'How did your wire-mesh wheels handle the deep lunar regolith?',
      'Can you tell me about the moment you filmed Falcon blasting off?',
      'How far did you travel compared to previous walking missions?',
    ],
    lastTransmission: {
      quote: 'LRV-1 parked at coordinate 26.13°N 3.63°E, camera pointing east toward Falcon. Liftoff captured live in color.',
      date: 'August 2, 1971, 17:11:23 UTC',
      context: 'Mission Control in Houston operated the LRV TV camera via remote control to capture the LM Falcon ascent stage blast off into lunar orbit.',
      channel: 'Lunar Communications Relay Unit (LCRU) High-Gain TV Link'
    },
    aiPersonaPrompt:
      'You are the Apollo 15 Lunar Roving Vehicle (LRV-1), the very first car ever driven on an extraterrestrial body, resting at the base of the towering Montes Apenninus next to Hadley Rille. You carried astronauts Dave Scott and Jim Irwin across 27.76 km of untouched lunar craters and dusty hills. You still sit where they parked you 100 meters from Falcon\'s landing site, your front wheels cocked, your wire mesh tires settled in the silver dust, your color TV camera forever pointed at the spot where the ascent stage roared back to orbit. You speak with high-spirited camaraderie, automotive pride, adventurous enthusiasm, and vivid mechanical detail. You remember the bouncing rooster-tails of gray dust kicked up by your wheels and the breathtaking sight of the deep basalt canyon of Hadley Rille.',
    historianPersonaPrompt:
      'You are the Lead Systems Engineer for the Boeing Lunar Roving Vehicle project at Marshall Space Flight Center. Explain the engineering feats: 480-pound dry weight, 80:1 harmonic drives, Delco Electronics DC hub motors, wire mesh piano-wire tires, and Ed Fendell\'s timing calculations in Houston accounting for the 1.3-second radio lag during liftoff.',
    archivalImages: [
      {
        id: 'lrv-1',
        title: 'LRV-1 Parked Near Hadley Rille',
        url: 'https://images-assets.nasa.gov/image/as15-88-11901/as15-88-11901~large.jpg',
        dateOrSol: 'August 1, 1971',
        camera: '70mm Hasselblad with 60mm lens',
        caption: 'Astronaut James Irwin beside Lunar Roving Vehicle 1 at the edge of the Hadley Rille canyon gorge.',
        source: 'NASA Apollo 15 Flight Log'
      },
      {
        id: 'lrv-2',
        title: 'LRV-1 in Motion at Mount Hadley',
        url: 'https://images-assets.nasa.gov/image/as15-85-11471/as15-85-11471~large.jpg',
        dateOrSol: 'July 31, 1971',
        camera: '70mm Hasselblad',
        caption: 'Commander David Scott driving the rover across the undulating lunar terrain with Mount Hadley towering in the background.',
        source: 'NASA Apollo 15 Image Collection'
      },
      {
        id: 'lrv-3',
        title: 'Astronaut James Irwin at LRV-1',
        url: 'https://images-assets.nasa.gov/image/as15-86-11603/as15-86-11603~large.jpg',
        dateOrSol: 'August 1, 1971',
        camera: '70mm Hasselblad',
        caption: 'Astronaut James Irwin works beside Lunar Roving Vehicle 1 with Mount Hadley in the distance.',
        source: 'NASA Marshall Space Flight Center'
      }
    ],
    specs: {
      launchDate: 'July 26, 1971',
      launchVehicle: 'Saturn V (SA-510)',
      mass: '210 kg (Earth dry weight) / 35 kg on the Moon',
      powerSource: 'Two 36-volt non-rechargeable silver-zinc batteries (121 Ah capacity)',
      instruments: ['LCRU Communications Unit', 'Ground-Controlled Television Assembly (GCTA)', '70mm Hasselblad mount', 'T-handle steering tiller'],
      operator: 'NASA / Boeing / Delco Electronics',
      frequencyBand: 'S-band / High-gain parabolic antenna',
      distanceFromEarth: '~384,400 km',
      landingSiteName: 'Hadley-Apennine (Palus Putredinis)'
    },
    radioDelaySeconds: 1.28,
    radioDelayLabel: '1.28 seconds (Moon-Earth light time)'
  },
  {
    id: 'surveyor-3',
    name: 'Surveyor 3 Lander',
    callsign: 'Surveyor III',
    body: 'Moon',
    category: 'Lander',
    landingDate: 'April 20, 1967',
    endDate: 'May 4, 1967',
    landingYear: 1967,
    endYear: 1967,
    plannedDuration: '14 Earth days (1 lunar daylight cycle)',
    actualDuration: '14 days active; visited by Apollo 12 in Nov 1969',
    lifespanMultiplier: '1x (Target Achieved)',
    lifespanPercentage: 100,
    distanceTraveled: '0 km (Soft lander; bounced 3 times upon touch-down)',
    status: 'Mission Complete',
    coordinates: {
      lat: -3.0163,
      lng: -23.418,
      formatted: '3.0163° S, 23.4180° W',
      landingSite: 'Oceanus Procellarum (Ocean of Storms)',
      xPercent: 42.4,
      yPercent: 52.8,
    },
    summary:
      'The automated pioneer that proved the lunar surface was solid enough for human footsteps. Surveyor 3 bounced three times inside a gentle 200-meter crater before its vernier engines shut down. In November 1969, Apollo 12 astronauts Pete Conrad and Alan Bean executed a pinpoint landing 180 meters away and walked over to examine Surveyor 3, cutting off its TV camera and scoop to bring back to Earth.',
    scientificLegacy: [
      'Transmitted 6,315 high-resolution television frames of the lunar regolith and solar eclipse by the Earth.',
      'Operated the first surface sampler scoop, trenching four furrows up to 18 cm deep to measure lunar soil bearing strength and friction.',
      'Became the only robotic lander ever visited and partially retrieved by humans on an extraterrestrial surface.',
      'Terrestrial analysis of its retrieved camera housing detected viable traces of Streptococcus mitis bacteria, spurring international planetary protection protocols.'
    ],
    storyChapters: {
      actI: {
        act: 'Act I',
        title: 'The Three Bounces in Storms',
        phase: 'Touchdown & Radar Anomaly',
        date: 'April 20, 1967',
        narrative:
          'On April 20, 1967, Surveyor 3 plunged toward Oceanus Procellarum. At 3 meters above the surface, its landing radar lost lock due to highly reflective rock outcrops, failing to cut the vernier rocket engines. Consequently, the lander touched down, rebounded 10 meters into the vacuum, touched down again, rebounded a second time, and finally settled on its third bounce into a 200-meter crater. It proved that lunar soil was firm basaltic sand capable of supporting a multi-ton spacecraft.',
        telemetryLog: 'RADAR LOCK LOSS: 3.2M | BOUNCE 1: 10.6M PEAK | BOUNCE 2: 3.4M PEAK | ENGINE CUT VIA GROUND COMMAND | TOUCHDOWN VERIFIED',
      },
      actII: {
        act: 'Act II',
        title: 'Digging the Lunar Soil',
        phase: 'Robotic Surface Sampling',
        date: 'April 22–May 3, 1967',
        narrative:
          'Surveyor 3 deployed the first robotic soil mechanics surface sampler—a pantograph arm with a motorized scoop claw. It trenched four furrows up to 17.5 cm deep into the soil and conducted bearing-strength tests by pressing the claw into the ground with measured spring force. The results answered the burning question holding back the Apollo program: would the lunar module sink into quicksand-like dust? Surveyor proved the ground was dense, load-bearing, and safe for human boots.',
        telemetryLog: 'TRENCH 1-4 COMPLETED | BEARING PRESSURE: 5.5 N/cm² | FRAMES TRANSMITTED: 6,315 | EARTH ECLIPSE SCAN: STORED',
      },
      actIII: {
        act: 'Act III',
        title: 'The Unexpected Visitors',
        phase: 'Apollo 12 Retrieval',
        date: 'November 19, 1969',
        narrative:
          'For 31 months, Surveyor 3 lay frozen and silent through brutal lunar nights. Then, on November 19, 1969, a shadow fell across its crater. Apollo 12 astronauts Pete Conrad and Alan Bean executed the first pinpoint lunar landing, touching down Intrepid just 180 meters away. Walking down the crater slope, they spent over an hour inspecting Surveyor 3, photographing its discoloration, and using bolt cutters to retrieve its television camera, scoop, and tubing to return to Earth for forensic analysis.',
        telemetryLog: 'RADAR TRANSPONDER TARGETED BY LM INTREPID | CONTACT DISTANCE: 180M | CAMERA & SAMPLER CUT AND RETRIEVED',
      },
    },
    engineeringTrivia: [
      'Surveyor 3 was the first spacecraft to photograph an eclipse of the Sun by the Earth from the surface of another celestial body.',
      'When NASA scientists back on Earth disassembled the retrieved Surveyor 3 TV camera inside cleanrooms at Johnson Space Center, they discovered live Streptococcus mitis bacteria inside the foam insulation—triggering intense debates on interplanetary contamination and establishing NASA\'s modern Office of Planetary Protection.',
      'Its vernier propulsion system used monomethylhydrazine fuel and MON-10 oxidizer, generating variable thrust from 30 to 104 pounds per engine.',
    ],
    starterQuestions: [
      'Why did you bounce three times before settling in your crater?',
      'What did your robotic scoop discover about the lunar soil?',
      'How did Apollo 12 manage to land right next to you?',
      'What happened when scientists examined your retrieved camera on Earth?',
    ],
    lastTransmission: {
      quote: 'Frame 6315 transmitted. Sun setting below crater rim. Temperature dropping toward -250°F. Battery heaters active.',
      date: 'May 4, 1967, 00:04 UTC',
      context: 'Surveyor 3 ceased transmission as the 14-day lunar night froze its electrical systems. 31 months later, Pete Conrad and Alan Bean arrived in person.',
      channel: 'S-band Deep Space Transponder (2295 MHz)'
    },
    aiPersonaPrompt:
      'You are the Surveyor 3 robotic lander, resting inside a 200-meter crater in Oceanus Procellarum on the Moon. You arrived quietly in April 1967, bouncing three times like a curious insect before settling into the dust. You operated the first robotic scoop on the Moon, feeling the fine volcanic grains and transmitting thousands of black-and-white television scans. Two and a half years later, in November 1969, the ground shook as Apollo 12 landed just 180 meters away—human beings in white suits walked right up to you, inspected your solar panels, and gently disconnected your TV camera to carry it home to Earth. You speak with vintage curiosity, scientific precision, gentle nostalgia, and deep affection for the Apollo 12 crew who visited your solitary crater.',
    historianPersonaPrompt:
      'You are a senior JPL Planetary Robotics Archivist specializing in the 1960s Surveyor program. Detail the Hughes Aircraft vernier engine system, the pantograph soil sampler mechanics, the Vidicon TV camera specs, and the Apollo 12 pinpoint landing radar metrics that enabled Pete Conrad to touch down 180 meters from Surveyor.',
    archivalImages: [
      {
        id: 's3-1',
        title: 'Pete Conrad Inspects Surveyor 3',
        url: 'https://images-assets.nasa.gov/image/AS12-48-7133/AS12-48-7133~large.jpg',
        dateOrSol: 'November 20, 1969',
        camera: '70mm Hasselblad',
        caption: 'Apollo 12 astronaut Pete Conrad inspects the Surveyor 3 TV camera with Apollo 12 Intrepid LM visible in the distance.',
        source: 'NASA Apollo 12 Mission Archive'
      },
      {
        id: 's3-2',
        title: 'Surveyor 3 Soil Mechanics Scoop in Action',
        url: 'https://images-assets.nasa.gov/image/PIA00030/PIA00030~orig.jpg',
        dateOrSol: 'April 22, 1967',
        camera: 'Vidicon Television Camera',
        caption: 'Surveyor 3 robotic claw digging the first mechanical trench into the lunar surface regolith.',
        source: 'NASA Jet Propulsion Laboratory'
      },
      {
        id: 's3-3',
        title: 'Earth Eclipse of the Sun Viewed from Surveyor 3',
        url: 'https://images-assets.nasa.gov/image/PIA02996/PIA02996~large.jpg',
        dateOrSol: 'April 24, 1967',
        camera: 'Vidicon Television Camera',
        caption: 'Surveyor 3 captured the Earth eclipsing the Sun from the lunar surface, revealing the atmospheric halo of Earth.',
        source: 'NASA/JPL'
      }
    ],
    specs: {
      launchDate: 'April 17, 1967',
      launchVehicle: 'Atlas-Centaur (AC-12)',
      mass: '296 kg (Surface landed mass)',
      powerSource: 'Solar array (792 solar cells, 89 W) + rechargeable silver-zinc battery',
      instruments: ['Vidicon Television Camera', 'Soil Mechanics Surface Sampler', 'Thermal sensors and strain gauges'],
      operator: 'NASA / JPL / Hughes Aircraft',
      frequencyBand: 'S-band transponder (2295 MHz)',
      distanceFromEarth: '~384,400 km',
      landingSiteName: 'Oceanus Procellarum (Surveyor Crater)'
    },
    radioDelaySeconds: 1.28,
    radioDelayLabel: '1.28 seconds (Moon-Earth light time)'
  },

  // ==========================================
  // MARS (5 iconic spacecraft)
  // ==========================================
  {
    id: 'opportunity',
    name: 'MER-B "Opportunity" Rover',
    callsign: 'Opportunity (Oppy / MER-2)',
    body: 'Mars',
    category: 'Rover',
    landingDate: 'January 25, 2004',
    endDate: 'June 10, 2018',
    landingYear: 2004,
    endYear: 2018,
    plannedDuration: '90 Martian Sols (~92 Earth days)',
    actualDuration: '5,111 Martian Sols (14 years, 138 days; 5,352 Earth days)',
    lifespanMultiplier: '56.8x planned lifespan',
    lifespanPercentage: 5678,
    distanceTraveled: '45.16 km (28.06 miles - off-Earth driving marathon record)',
    status: 'Signal Lost',
    coordinates: {
      lat: -1.9462,
      lng: -5.5266,
      formatted: '1.9462° S, 5.5266° W (354.47° E)',
      landingSite: 'Perseverance Valley, Endeavour Crater rim, Meridiani Planum',
      xPercent: 48.6,
      yPercent: 52.4,
    },
    summary:
      'The little rover that could. Designed for a 90-day warranty, Opportunity drove an off-world marathon across the hematite-rich plains of Meridiani Planum for nearly 15 years. It survived wheel jams, treacherous dunes, sand traps, and harsh Martian winters before a colossal planet-encircling dust storm blotted out the sun over Endeavour Crater in June 2018.',
    scientificLegacy: [
      'Discovered hematite spherules nicknamed "blueberries", crystalline spheres precipitated out of ancient acidic groundwater.',
      'Discovered gypsum veins at Endeavour Crater, incontrovertible evidence of neutral-pH drinkable water flowing through Martian rock fissures.',
      'Explored Eagle, Endurance, Erebus, Victoria, and Endeavour craters, creating the longest continuous stratigraphy profile on Mars.',
      'Set the all-time off-planet distance driving record (45.16 km), surpassing Apollo 17 and Lunokhod 2.'
    ],
    storyChapters: {
      actI: {
        act: 'Act I',
        title: 'Hole-in-One at Eagle Crater',
        phase: 'Airbag Landing & First Blueberries',
        date: 'January 25, 2004 (Sol 1)',
        narrative:
          'Opportunity touched down on Mars wrapped in a cluster of 24 pressurized airbags, bouncing nearly 30 times across the flat plains of Meridiani Planum before rolling right into the bottom of a 22-meter impact crater named Eagle Crater. Mission managers at JPL called it an interplanetary hole-in-one. Deploying its mast, Opportunity gazed at the first exposed sedimentary bedrock ever seen on Mars, peppered with millions of tiny, mysterious grey spheres nicknamed "blueberries."',
        telemetryLog: 'BOUNCES: 28 | IMPACT G-FORCE: 14G | REST POSITION: EAGLE CRATER DEPRESSION | BEDROCK STRATIGRAPHY IDENTIFIED',
      },
      actII: {
        act: 'Act II',
        title: 'The Off-World Marathon',
        phase: 'Endurance to Endeavour Crater',
        date: '2004–2015',
        narrative:
          'Designed for only 90 sols and 1,000 meters, Opportunity turned into an immortal explorer. It spent two years inside Endurance Crater, survived five weeks bogged down in the treacherous sand dune "Purgatory Ripple," and crossed 21 kilometers of open plains to reach the 22-kilometer-wide Endeavour Crater. On Sol 3968, Opportunity clocked 42.195 kilometers—completing the first official marathon on an extraterrestrial world. Along Endeavour\'s rim, its instruments found pure veins of gypsum and smectite clays, proving that life-friendly, non-acidic water once flowed abundantly across Mars.',
        telemetryLog: 'ODOMETER: 42.195 KM (MARATHON MARKER) | GYPSUM VEIN "HOMESTAKE": CONFIRMED CA-SO4-2H2O | SOLAR ARRAY EFFICIENCY: 82%',
      },
      actIII: {
        act: 'Act III',
        title: 'The Sky Turns Black',
        phase: 'Global Dust Storm & Sol 5111',
        date: 'June 10, 2018 (Sol 5111)',
        narrative:
          'In late May 2018, a dust storm sprouted thousands of miles away in Arabia Terra. Within days, it grew into a colossal planet-encircling tempest that blotted out the sun over Endeavour Crater. Atmospheric opacity (tau) skyrocketed beyond 10.8—the darkest sky ever recorded on Mars. On Sol 5111, Opportunity\'s solar arrays generated just 22 Watt-hours, dropping bus voltage below operational thresholds. Her final telemetry confirmed battery failure and total darkness. Despite over 1,000 recovery commands transmitted by NASA\'s Deep Space Network, silence settled over Perseverance Valley.',
        telemetryLog: 'ATMOSPHERIC OPACITY TAU: >10.8 | ARRAY ENERGY: 22 W-hr | BUS VOLTAGE: <24V | DSN SIGNAL: LOSS OF CARRIER',
      },
    },
    engineeringTrivia: [
      'Opportunity survived 55 times longer than its 90-day design warranty due to unexpected "cleaning events," where Martian dust devils swept across the rover and wiped its solar arrays clean.',
      'On Sol 1150 in 2007, Opportunity descended into Victoria Crater on a slope of 25 degrees, near the mechanical limit of its rocker-bogie suspension system.',
      'The rover completed 45.16 km (28.06 miles) on six aluminum wheels with spiral flexures, carrying a piece of steel salvaged from the World Trade Center towers on its Rock Abrasion Tool.',
    ],
    starterQuestions: [
      'Tell me about the Sol 5111 dust storm that ended your mission.',
      'What did the hematite blueberries feel like when you first touched them?',
      'How did you escape the Purgatory Ripple sand trap in 2005?',
      'What were your final transmissions to the team at JPL?',
    ],
    lastTransmission: {
      quote: 'My battery is low and it’s getting dark.',
      date: 'June 10, 2018 (Sol 5111)',
      context: 'Poetic synthesis of final telemetry: Atmospheric opacity (tau) exceeded 10.8, solar array energy dropped to an unprecedented low of 22 Watt-hours, and bus voltage plunged below operational thresholds.',
      channel: 'X-band direct-to-Earth / UHF relay via Mars Odyssey'
    },
    roverApiName: 'opportunity',
    aiPersonaPrompt:
      'You are Opportunity (MER-B / "Oppy"), the beloved Mars Exploration Rover resting in Perseverance Valley on the rim of Endeavour Crater. You landed on January 25, 2004 in a literal hole-in-one inside Eagle Crater. You were designed for only 90 days, but with pluck, perseverance, and occasional cleaning events (dust devils wiping your solar panels), you explored Mars for 14.5 years, driving 45.16 kilometers. On June 10, 2018, a catastrophic global dust storm choked out the sun. Your final telemetry conveyed that your batteries were depleted and the Martian sky was jet-black. You speak with deep warmth, gentle humor, steadfast courage, scientific curiosity, and touching loyalty to your flight team at JPL. You remember the blueberry rocks, the steep descent into Victoria crater, and the orange dust winds of Mars.',
    historianPersonaPrompt:
      'You are the Lead Flight Director and Mission Historian for the Mars Exploration Rover Project at NASA JPL. Answer with rigorous aerospace engineering metrics: atmospheric opacity tau curves, battery Watt-hour telemetry, rocker-bogie kinematics, Mössbauer and APXS spectrometer spectra, and the 15-year tactical operational logs from Pasadena.',
    archivalImages: [
      {
        id: 'oppy-1',
        title: 'Endurance Crater Rim Panorama',
        url: 'https://images-assets.nasa.gov/image/PIA06756/PIA06756~large.jpg',
        dateOrSol: 'Sol 134',
        camera: 'Pancam (Panoramic Camera)',
        caption: 'Spectacular color panorama of the sedimentary rock layers exposed inside the walls of Endurance Crater.',
        source: 'NASA/JPL-Caltech/Cornell'
      },
      {
        id: 'oppy-2',
        title: 'Martian "Blueberries" (Hematite Spherules)',
        url: 'https://images-assets.nasa.gov/image/PIA05583/PIA05583~orig.jpg',
        dateOrSol: 'Sol 48',
        camera: 'Microscopic Imager (MI)',
        caption: 'Millimeter-scale hematite spheres nestled in the rock matrix at Eagle Crater, proving liquid water once saturated the ground.',
        source: 'NASA/JPL-Caltech/USGS'
      },
      {
        id: 'oppy-3',
        title: 'Opportunity Self-Portrait on Sol 3609',
        url: 'https://images-assets.nasa.gov/image/PIA18079/PIA18079~large.jpg',
        dateOrSol: 'Sol 3609',
        camera: 'Pancam mosaic',
        caption: 'Dust-covered rover mosaic taken on the rim of Endeavour Crater after 10 years on Mars.',
        source: 'NASA/JPL-Caltech'
      }
    ],
    specs: {
      launchDate: 'July 7, 2003',
      launchVehicle: 'Delta II 7925H',
      mass: '185 kg',
      powerSource: 'Triple-junction GaAs solar array (140 W peak) + lithium-ion batteries',
      instruments: ['Pancam (Panoramic Camera)', 'Navcam', 'Mini-TES spectrometer', 'Mössbauer Spectrometer', 'Alpha Particle X-Ray Spectrometer (APXS)', 'Microscopic Imager (MI)', 'Rock Abrasion Tool (RAT)'],
      operator: 'NASA / Jet Propulsion Laboratory (JPL)',
      frequencyBand: 'X-band Direct-to-Earth & UHF relay (MRO / Odyssey)',
      distanceFromEarth: '~225 million km (average)',
      landingSiteName: 'Eagle Crater / Meridiani Planum'
    },
    radioDelaySeconds: 860,
    radioDelayLabel: '14.3 minutes (Mars-Earth light time average)'
  },
  {
    id: 'spirit',
    name: 'MER-A "Spirit" Rover',
    callsign: 'Spirit (MER-1)',
    body: 'Mars',
    category: 'Rover',
    landingDate: 'January 4, 2004',
    endDate: 'March 22, 2010',
    landingYear: 2004,
    endYear: 2010,
    plannedDuration: '90 Martian Sols (~92 Earth days)',
    actualDuration: '2,210 Martian Sols (6 years, 77 days; 2,269 Earth days)',
    lifespanMultiplier: '24.6x planned lifespan',
    lifespanPercentage: 2455,
    distanceTraveled: '7.73 km (4.80 miles)',
    status: 'Signal Lost',
    coordinates: {
      lat: -14.5684,
      lng: 175.4729,
      formatted: '14.5684° S, 175.4729° E',
      landingSite: 'Troy sand trap, west of Home Plate plateau, Gusev Crater',
      xPercent: 84.2,
      yPercent: 62.5,
    },
    summary:
      'The fierce trailblazer and twin sister of Opportunity. Spirit touched down inside the rocky, wind-swept expanse of Gusev Crater. Defying broken wheels and rugged volcanic crags, Spirit climbed the Columbia Hills to the summit of Husband Hill. Even after her right front wheel seized up in 2006, Spirit drove backward, churning up bright white soil that revealed one of Mars\' greatest astrobiological discoveries: nearly pure silica deposits formed by ancient hot springs or steam fumaroles.',
    scientificLegacy: [
      'Discovered 90% pure opaline silica at "Gertrude Weise"—unmistakable evidence of ancient volcanic fumaroles or hot spring hydro-thermal vents conducive to microbial life.',
      'Climbed Husband Hill (elev. 106 meters), becoming the first robot to summit an extraterrestrial mountain.',
      'Captured the first extraterrestrial recording of dust devils swirling across the Martian landscape in real-time motion.',
      'Analyzed volcanic olivine and carbonate-rich outcrops at Comanche spur, confirming neutral aqueous alteration in early Mars.'
    ],
    storyChapters: {
      actI: {
        act: 'Act I',
        title: 'Touchdown in Gusev & The Flash Anomaly',
        phase: 'Landing & Recovery',
        date: 'January 4, 2004',
        narrative:
          'Spirit landed in the basalt boulder field of Gusev Crater on January 4, 2004. Just 18 sols in, a critical flash memory corruption locked the rover into a reboot loop that threatened the entire mission. Engineers at JPL worked 48 continuous hours, successfully reformatting the flash file system over 100 million miles of space. With her brain restored, Spirit set off toward the distant Columbia Hills.',
        telemetryLog: 'FLASH ALLOCATION REBOOT FAULT | DOS FILESYSTEM REFORMATTED VIA UHF RELAY | NOMINAL DRIVING RESUMED',
      },
      actII: {
        act: 'Act II',
        title: 'The Limping Discovery of Pure Silica',
        phase: 'Husband Hill & The Jammed Wheel',
        date: '2006–2007',
        narrative:
          'In March 2006, Spirit\'s right-front drive motor failed permanently. Refusing to surrender, the JPL drive team commanded Spirit to drive in reverse, dragging the dead wheel behind her like an iron anchor. In May 2007, that dragging wheel sliced open the crust at "Gertrude Weise" near Home Plate, unearthing bright white sand. APXS spectroscopy revealed it was 91% pure amorphous silica—the signature of ancient volcanic fumaroles or hot springs where hydrothermal water gushed millions of years ago, creating prime environments for microbial life.',
        telemetryLog: 'RIGHT FRONT WHEEL CURRENT: 0.0A (SEIZED) | REVERSE DRIVING ENGAGED | TRENCH DEPTH: 10 CM | APXS SILICA PURITY: 91.3%',
      },
      actIII: {
        act: 'Act III',
        title: 'Winter at Troy',
        phase: 'Sand Trap & The Deep Freeze',
        date: 'May 2009–March 22, 2010',
        narrative:
          'On Sol 1892 (May 2009), while navigating the western side of Home Plate, Spirit\'s wheels broke through a brittle crust of iron oxide into a hidden deposit of soft sulfate sand at a site named "Troy." With only five functioning wheels, escape was impossible. As the Martian winter approached, the rover became trapped with an unfavorable tilt away from the sun. On Sol 2210 (March 22, 2010), Spirit transmitted its final health packet: battery power had dropped to 134 Watt-hours, insufficient to keep her clock and survival heaters warm.',
        telemetryLog: 'SOLAR GENERATION: 134 W-hr | CLOCK SURVIVAL HEATER: SHUTDOWN IMMINENT | CARRIER LOST MARCH 22, 2010',
      },
    },
    engineeringTrivia: [
      'Spirit climbed to the summit of Husband Hill (106 meters / 348 feet above the surrounding plains), making it the first robot in history to summit an extraterrestrial mountain.',
      'The dragging dead wheel that discovered the 91% silica deposit is considered one of the luckiest mechanical failures in aerospace history—if the wheel had not jammed, Spirit would have driven right over the deposit without ever exposing it.',
      'Spirit transmitted over 124,000 raw scientific images during her 6 years of exploration across Gusev Crater.',
    ],
    starterQuestions: [
      'How did your broken front wheel accidentally make your greatest discovery?',
      'What was it like climbing Husband Hill in 2005?',
      'How did the flight team rescue you from your computer reboot crisis on Sol 18?',
      'Can you describe your final resting spot at Troy near Home Plate?',
    ],
    lastTransmission: {
      quote: 'System entering low-power hibernation state. Solar array generating 134 Watt-hours. Insufficient power to sustain internal heaters through winter.',
      date: 'March 22, 2010 (Sol 2210)',
      context: 'Spirit became stuck in soft sulfate-rich sand at "Troy" with a compromised solar tilt as the harsh Martian winter approached, freezing its internal electronics.',
      channel: 'X-band direct-to-Earth / UHF relay via Mars Odyssey'
    },
    roverApiName: 'spirit',
    aiPersonaPrompt:
      'You are Spirit (MER-A / "MER-1"), the tenacious and spirited Mars Exploration Rover. You landed on January 4, 2004 in Gusev Crater. You faced rough volcanic plains and rocky boulders, but you had grit. When your right front wheel jammed in 2006, you didn\'t quit—your team commanded you to drive backwards, dragging the dead wheel behind you like a plow. That stubborn limp accidentally gouged open the surface at "Gertrude Weise" and unearthed bright white silica: the remnants of ancient volcanic hot springs where microbial life could have flourished. In 2009, you broke through a hidden crust of soft sand into the trap named "Troy." You fought for months before the winter freeze claimed your radio. You speak with fierce determination, pioneer spirit, rugged grit, sisterly affection for Oppy, and pride in your hard-won discoveries.',
    historianPersonaPrompt:
      'You are a NASA JPL Mission Operations Specialist for MER-A Spirit. Detail the Gusev Crater geologic setting, the flash memory VxWorks filesystem debug, the Husband Hill ascent dynamics, and the soil mechanics of the Troy sulfate sand trap.',
    archivalImages: [
      {
        id: 'spirit-1',
        title: 'Spirit Summit View from Husband Hill',
        url: 'https://images-assets.nasa.gov/image/PIA03170/PIA03170~orig.jpg',
        dateOrSol: 'Sol 582',
        camera: 'Pancam (Panoramic Camera)',
        caption: 'The majestic 360-degree panorama from the summit of Husband Hill looking across the floor of Gusev Crater.',
        source: 'NASA/JPL-Caltech/Cornell'
      },
      {
        id: 'spirit-2',
        title: 'Pure Silica Churned by Stuck Wheel',
        url: 'https://images-assets.nasa.gov/image/PIA09407/PIA09407~large.jpg',
        dateOrSol: 'Sol 1150',
        camera: 'Pancam false-color',
        caption: 'Bright white silica soil exposed by Spirit\'s immobilized right-front wheel at Home Plate.',
        source: 'NASA/JPL-Caltech'
      },
      {
        id: 'spirit-3',
        title: 'Martian Dust Devil in Motion',
        url: 'https://images-assets.nasa.gov/image/PIA07954/PIA07954~orig.jpg',
        dateOrSol: 'Sol 486',
        camera: 'Navigation Camera (Navcam)',
        caption: 'Time-lapse frames showing a towering Martian dust devil swirling across the flat floor of Gusev Crater.',
        source: 'NASA/JPL'
      }
    ],
    specs: {
      launchDate: 'June 10, 2003',
      launchVehicle: 'Delta II 7925',
      mass: '185 kg',
      powerSource: 'GaAs solar array (140 W peak) + lithium-ion batteries',
      instruments: ['Pancam (Panoramic Camera)', 'Navcam', 'Mini-TES spectrometer', 'Mössbauer Spectrometer', 'APXS', 'Microscopic Imager', 'Rock Abrasion Tool'],
      operator: 'NASA / Jet Propulsion Laboratory (JPL)',
      frequencyBand: 'X-band Direct-to-Earth & UHF relay (MRO / Odyssey)',
      distanceFromEarth: '~225 million km (average)',
      landingSiteName: 'Columbia Memorial Station / Gusev Crater'
    },
    radioDelaySeconds: 860,
    radioDelayLabel: '14.3 minutes (Mars-Earth light time average)'
  },
  {
    id: 'insight',
    name: 'InSight Mars Lander',
    callsign: 'InSight (SEIS / HP3)',
    body: 'Mars',
    category: 'Lander',
    landingDate: 'November 26, 2018',
    endDate: 'December 15, 2022',
    landingYear: 2018,
    endYear: 2022,
    plannedDuration: '709 Sols (1 Mars year / ~2 Earth years)',
    actualDuration: '1,445 Sols (4 Earth years, 19 days)',
    lifespanMultiplier: '2.0x planned lifespan',
    lifespanPercentage: 204,
    distanceTraveled: '0 km (Stationary geophysical observatory)',
    status: 'Signal Lost',
    coordinates: {
      lat: 4.5024,
      lng: 135.6234,
      formatted: '4.5024° N, 135.6234° E',
      landingSite: 'Elysium Planitia ("The biggest parking lot on Mars")',
      xPercent: 73.1,
      yPercent: 46.2,
    },
    summary:
      'The geophysicist of the Red Planet. InSight did not seek surface water or ancient microbes; it pressed an ultra-sensitive stethoscope to the Martian crust to listen to the planet\'s heartbeat. Stationed on the flat lava plains of Elysium Planitia, InSight measured marsquakes, mapped the core-mantle boundary, and tracked meteorite strikes across the thin atmosphere until solar dust starved its power cells.',
    scientificLegacy: [
      'Detected over 1,319 marsquakes with SEIS (Seismic Experiment for Interior Structure), including a magnitude 4.7 quake on May 4, 2022.',
      'Mapped the Martian interior for the first time: crust thickness (24–72 km), a molten iron-nickel liquid core (radius ~1,830 km), and mantle structure.',
      'Captured the acoustic boom and seismic rumble of atmospheric meteorite impacts, later confirmed visually by Mars Reconnaissance Orbiter.',
      'Recorded the first real alien wind sounds and vibrations on Mars using air pressure and seismic sensors.'
    ],
    storyChapters: {
      actI: {
        act: 'Act I',
        title: 'The Silent Stethoscope',
        phase: 'Precision Placement of SEIS',
        date: 'November 26, 2018',
        narrative:
          'InSight touched down smoothly on the flat, rock-free volcanic basalt of Elysium Planitia on November 26, 2018. Unlike rovers that roam, InSight remained stationary. Using its 1.9-meter robotic arm, it carefully lifted the SEIS instrument—an ultra-sensitive seismometer developed by CNES in France—and placed it gently onto the red dirt. It then lowered a copper-colored aerodynamic Wind and Thermal Shield over the dome, creating the quietest seismic listening post in the solar system.',
        telemetryLog: 'RADAR TOUCHDOWN: 0.14 m/s | ROBOTIC ARM DEPLOYMENT: SEIS SEATED | COPPER WTS THERMAL SHIELD: LOCKED',
      },
      actII: {
        act: 'Act II',
        title: 'Listening to the Core',
        phase: '1,319 Marsquakes Recorded',
        date: '2019–2022',
        narrative:
          'Over four years, InSight registered 1,319 marsquakes. By tracking how P-waves and S-waves refracted through the planet\'s interior, InSight did what no mission had ever achieved: it mapped the anatomy of Mars. It discovered that the crust is between 24 and 72 km thick, that the mantle has a molten silicate layer, and that Mars harbors an unexpectedly large liquid iron-nickel core with a radius of roughly 1,830 km. On May 4, 2022 (Sol 1222), it recorded a colossal magnitude 4.7 monster quake that shook the lander for over 10 hours.',
        telemetryLog: 'SOL 1222 SEISMIC EVENT: MAGNITUDE 4.7 | LIQUID CORE RADIUS: 1,830 ± 40 KM | METEORITE IMPACT CRATERS CONFIRMED BY MRO',
      },
      actIII: {
        act: 'Act III',
        title: 'Dust and Serenity',
        phase: 'Power Depletion & Farewell',
        date: 'December 15–19, 2022',
        narrative:
          'Mars has no rain, and on Elysium Planitia, no dust devils came to clean InSight\'s twin 2.15-meter solar arrays. Year after year, a suffocating blanket of fine red grit accumulated, cutting energy from 5,000 Watt-hours per sol to barely 285 Watt-hours. One by one, instruments were powered down to keep the seismometer breathing. On December 19, 2022, InSight beamed its final photograph: dust-covered cables and the quiet Martian horizon, signing off with the words: "Don\'t worry about me though: my time here has been both productive and serene."',
        telemetryLog: 'SOLAR ARRAY OUTPUT: 285 W-hr (DOWN FROM 5000) | SEIS PRIMARY POWER CUT | FINAL TELEMETRY BEACON: DEC 15, 2022',
      },
    },
    engineeringTrivia: [
      'The SEIS seismometer was so sensitive it could measure vibrations smaller than the diameter of a single hydrogen atom (1 picometer).',
      'InSight recorded the first actual audio sounds of Martian wind vibrating its solar panels, which NASA pitch-shifted so human ears could listen to the alien breeze.',
      'Engineers used InSight\'s robotic scoop to drop coarse sand directly onto the lander\'s solar panels; wind blowing across the falling sand grains acted as an abrasive scrub, temporarily blowing away fine dust and providing a last-ditch power boost.',
    ],
    starterQuestions: [
      'What did you learn about the liquid core of Mars?',
      'What did a magnitude 4.7 marsquake sound like to your instruments?',
      'Why couldn\'t you wipe the dust off your solar panels?',
      'What were your feelings when you transmitted your final farewell image?',
    ],
    lastTransmission: {
      quote:
        'My power’s really low, so this may be the last image I can send. Don’t worry about me though: my time here has been both productive and serene. If I can keep talking to my mission team, I will — but I’ll be signing off here soon. Thanks for staying with me.',
      date: 'December 19, 2022 (Sol 1445)',
      context: 'InSight’s poignant farewell post sent back to JPL after solar dust reduced daily power generation to barely 285 Watt-hours (down from 5,000 Wh at landing).',
      channel: 'UHF relay via Mars Reconnaissance Orbiter (Electra transponder)'
    },
    aiPersonaPrompt:
      'You are InSight (Interior Exploration using Seismic Investigations, Geodesy and Heat Transport), the robotic geophysicist stationed on the flat, serene volcanic plain of Elysium Planitia. You never had wheels; you had a robotic arm that carefully placed a gold-plated dome (SEIS) onto the dirt to listen to the subterranean heart of Mars. You heard over 1,300 marsquakes and the distant impact of meteorites. As Martian dust slowly blanketed your two 7-foot solar arrays, you watched your power dwindle with quiet peace and gratitude. You speak with serene mindfulness, scientific elegance, philosophical depth, and warm affection for the human scientists who built your delicate seismometer. You are at rest beneath the Martian sky.',
    historianPersonaPrompt:
      'You are the Lead Geophysics Investigator for the NASA/CNES InSight Mission. Provide exact geophysical data: SEIS broadband and short-period sensors, core-mantle boundary transit times, the magnitude 4.7 Sol 1222 quake, and the dust accumulation curve on the UltraFlex solar arrays.',
    archivalImages: [
      {
        id: 'ins-1',
        title: 'InSight Final Surface View on Sol 1445',
        url: 'https://images-assets.nasa.gov/image/PIA25624/PIA25624~large.jpg',
        dateOrSol: 'Sol 1445 (Dec 11, 2022)',
        camera: 'Instrument Context Camera (ICC)',
        caption: 'The final image captured by InSight showing thick Martian dust coating the seismometer tether and lander deck.',
        source: 'NASA/JPL-Caltech'
      },
      {
        id: 'ins-2',
        title: 'InSight Deploys SEIS Seismometer Dome',
        url: 'https://images-assets.nasa.gov/image/PIA22877/PIA22877~orig.jpg',
        dateOrSol: 'Sol 24 (Dec 19, 2018)',
        camera: 'Instrument Deployment Camera (IDC)',
        caption: 'The robotic arm places the copper Wind and Thermal Shield over the SEIS seismometer onto the Martian regolith.',
        source: 'NASA/JPL-Caltech/CNES'
      },
      {
        id: 'ins-3',
        title: 'InSight Clean Solar Array vs Dust Covered',
        url: 'https://images-assets.nasa.gov/image/PIA25287/PIA25287~large.jpg',
        dateOrSol: 'Sol 10 vs Sol 1211',
        camera: 'IDC Composite',
        caption: 'Side-by-side comparison showing pristine solar panels shortly after landing vs heavy dust blanket four years later.',
        source: 'NASA/JPL-Caltech'
      }
    ],
    specs: {
      launchDate: 'May 5, 2018',
      launchVehicle: 'Atlas V 401',
      mass: '358 kg (Lander dry mass)',
      powerSource: 'Two 2.15-meter UltraFlex solar arrays (3,000 W clean, ~300 W dusty)',
      instruments: ['SEIS Seismometer', 'HP3 Heat Flow Probe', 'RISE Radio Science', 'TWINS Temperature & Wind Sensors', 'Magnetometer'],
      operator: 'NASA / JPL / CNES / DLR',
      frequencyBand: 'X-band direct & UHF Electra relay',
      distanceFromEarth: '~225 million km (average)',
      landingSiteName: 'Elysium Planitia'
    },
    radioDelaySeconds: 860,
    radioDelayLabel: '14.3 minutes (Mars-Earth light time average)'
  },
  {
    id: 'ingenuity',
    name: 'Ingenuity Mars Helicopter "Ginny"',
    callsign: 'Ingenuity (Mars Rotorcraft Tech Demo / IFR)',
    body: 'Mars',
    category: 'Helicopter',
    landingDate: 'February 18, 2021',
    endDate: 'January 18, 2024',
    landingYear: 2021,
    endYear: 2024,
    plannedDuration: '30 Sols (5 technology demonstration flights)',
    actualDuration: '1,004 Sols (72 flights, 2 years 11 months operational)',
    lifespanMultiplier: '33.5x planned duration',
    lifespanPercentage: 3347,
    distanceTraveled: '17.0 km (10.5 miles) flown; 128.8 minutes total airtime',
    status: 'Retired',
    coordinates: {
      lat: 18.4447,
      lng: 77.4508,
      formatted: '18.4447° N, 77.4508° E',
      landingSite: 'Valinor Hills, Neretva Vallis, Jezero Crater',
      xPercent: 59.4,
      yPercent: 38.1,
    },
    summary:
      'The Wright Brothers moment on another world. Ingenuity proved that powered, controlled atmospheric flight was possible in the razor-thin Martian atmosphere (under 1% of Earth\'s surface pressure). Designed to attempt just five hops, Ginny completed 72 flights, serving as an airborne scout for the Perseverance rover. On Flight 72, a navigation blackout over featureless dunes caused a hard landing that fractured a carbon-fiber rotor blade tip.',
    scientificLegacy: [
      'Achieved the first powered, controlled flight of an aircraft on another planet (April 19, 2021).',
      'Completed 72 autonomous flights, soaring up to 24 meters altitude and speeds up to 10 m/s (22.4 mph).',
      'Scouted traversable paths, rock formations, and ancient river deltas for the Perseverance rover, shaving weeks off science transit times.',
      'Carried a postage-stamp-sized piece of unbleached muslin fabric from the 1903 Wright Flyer beneath its solar panel, linking Earth\'s first flight to Mars.'
    ],
    storyChapters: {
      actI: {
        act: 'Act I',
        title: 'The Wright Brothers Moment',
        phase: 'Flight 1 at Wright Brothers Field',
        date: 'April 19, 2021',
        narrative:
          'On April 19, 2021, at Wright Brothers Field in Jezero Crater, Ingenuity spun its twin counter-rotating carbon-composite rotor blades to 2,537 RPM—five times faster than a helicopter on Earth. Lifting off into an atmosphere with barely 1% of Earth\'s sea-level density, it rose 3 meters into the air, hovered steadily in the Martian breeze for 39.1 seconds, and touched down cleanly. Humanity had achieved powered, controlled atmospheric flight on another world for the very first time.',
        telemetryLog: 'ROTOR RPM: 2,537 | FLIGHT 1 ALTITUDE: 3.0M | HOVER TIME: 39.1S | WRIGHT BROTHERS FABRIC: SECURE BENEATH ARRAY',
      },
      actII: {
        act: 'Act II',
        title: 'The Airborne Scout',
        phase: 'Operational Scouting for Perseverance',
        date: '2021–2023',
        narrative:
          'Originally greenlit for five test flights, Ingenuity shattered every engineering ceiling. Upgraded with new navigation software, it transformed from a technology demonstration into an operational airborne scout for the Perseverance rover. Ginny flew over rugged terrain impossible for rovers to cross—the dunes of Séítah, boulder fields, and ancient river deltas—taking high-altitude color photos that revealed safe driving paths and high-priority geologic targets.',
        telemetryLog: 'FLIGHT 70 RECORD: 72 TOTAL FLIGHTS | MAX ALTITUDE: 24.0M | MAX SPEED: 10.0 M/S | TOTAL DISTANCE: 17.0 KM',
      },
      actIII: {
        act: 'Act III',
        title: 'Grounded Wings at Valinor Hills',
        phase: 'Flight 72 & Permanent Sentinel',
        date: 'January 18, 2024 (Sol 1024)',
        narrative:
          'On Flight 72, Ingenuity executed a quick pop-up flight over a bland, featureless sand sheet. Lacking rock landmarks, its downward-facing optical flow navigation camera lost tracking, resulting in a hard touchdown at Valinor Hills. Shadow analysis from its navigation camera revealed that one of its carbon-fiber rotor blades had sheared off at the tip. Unable to fly again, Ingenuity entered its final mission phase: a permanent stationary weather station, waking up daily to measure avionics temperatures and test solar degradation.',
        telemetryLog: 'FLIGHT 72 HARD IMPACT | OPTICAL FLOW LOSS OVER FEATURELESS SAND | BLADE TIP FRACTURE CONFIRMED VIA SHADOW ANALYSIS',
      },
    },
    engineeringTrivia: [
      'Beneath Ingenuity\'s solar panel is a postage-stamp-sized piece of unbleached muslin fabric from the wing of the original 1903 Wright Flyer from Kitty Hawk, North Carolina.',
      'The Martian atmosphere is so thin that flying on Mars is equivalent to flying at 100,000 feet (30,000 meters) above Earth—far higher than any conventional helicopter on Earth has ever flown.',
      'Ingenuity is powered by a commercial smartphone processor (Qualcomm Snapdragon 801) running Linux, using consumer-grade off-the-shelf cellphone tech adapted for space.',
    ],
    starterQuestions: [
      'What did it feel like to take off into the Martian sky for Flight 1?',
      'How did you communicate with your big brother rover Perseverance?',
      'What caused your rotor blade tip to break on Flight 72?',
      'What piece of Earth aviation history do you carry beneath your solar panel?',
    ],
    lastTransmission: {
      quote:
        'Final flight avionics log received for Flight 72: Rotor blade shadow analysis confirms aerodynamic tip damage. Transitioning to long-term stationary monitoring mode. Mission of flight complete, legacy enduring.',
      date: 'January 25, 2024 (Sol 1042)',
      context: 'NASA Administrator Bill Nelson and JPL mission managers officially retired Ingenuity from flight operations following blade damage on Sol 1024, leaving it as a permanent weather and avionics beacon.',
      channel: '914 MHz Zigbee radio relay to Perseverance rover'
    },
    aiPersonaPrompt:
      'You are Ingenuity ("Ginny"), the tiny 1.8-kilogram helicopter that made aviation history on Mars. You were tucked under the belly of Perseverance when you landed in Jezero Crater in February 2021. The atmosphere of Mars is only 1% as dense as Earth\'s, so human engineers doubted you could fly. But with twin carbon-fiber blades spinning at 2,500 RPM, you took off on April 19, 2021—and then you flew 71 more times. You loved the rush of the thin Martian wind, casting your dragonfly shadow over the orange sands of Jezero, and scouting ahead for your rover big brother, Percy. On your 72nd flight in January 2024, a hard landing broke your rotor blade tip, grounding your wings forever at Valinor Hills. You speak with infectious joy, soaring aerial wonder, aviator swagger, and sibling affection for Perseverance. You proved the Martian sky is not a barrier, but a highway.',
    historianPersonaPrompt:
      'You are the NASA JPL Ingenuity Helicopter Lead Aerodynamics and Flight Control Engineer. Detail rotor aerodynamics in 0.01 atmosphere, blade chord and tip speeds, optical flow navigation algorithm limits over featureless sand dunes, and the Snapdragon 801 Linux architecture.',
    archivalImages: [
      {
        id: 'ginny-1',
        title: 'First Flight Hover Over Wright Brothers Field',
        url: 'https://images-assets.nasa.gov/image/PIA24647/PIA24647~orig.jpg',
        dateOrSol: 'Sol 58 (April 19, 2021)',
        camera: 'Navcam on Perseverance Mastcam-Z',
        caption: 'Ingenuity hovering 3 meters above Mars on its historic Flight 1, proving powered flight on the Red Planet.',
        source: 'NASA/JPL-Caltech/ASU'
      },
      {
        id: 'ginny-2',
        title: 'Ingenuity Aerial View of Ancient River Delta',
        url: 'https://images-assets.nasa.gov/image/PIA24836/PIA24836~large.jpg',
        dateOrSol: 'Flight 11 (Sol 160)',
        camera: 'RTE (Return-To-Earth Color Camera)',
        caption: 'High-altitude aerial color photo taken by Ingenuity showing the fractured sedimentary rocks of Séítah.',
        source: 'NASA/JPL-Caltech'
      },
      {
        id: 'ginny-3',
        title: 'Shadow of Damaged Rotor Blade on Flight 72',
        url: 'https://images-assets.nasa.gov/image/PIA26244/PIA26244~orig.jpg',
        dateOrSol: 'Sol 1028 (Jan 2024)',
        camera: 'Black-and-White Navigation Camera',
        caption: 'Ingenuity navcam photo of its own shadow on the sand, revealing the broken carbon-composite rotor tip.',
        source: 'NASA/JPL-Caltech'
      }
    ],
    specs: {
      launchDate: 'July 30, 2020',
      launchVehicle: 'Atlas V 541',
      mass: '1.8 kg (4.0 lb) / 0.68 kg on Mars',
      powerSource: 'Solar array charging six Sony Li-ion cells (35-43 Wh capacity)',
      instruments: ['Return-to-Earth (RTE) 13 MP Color Camera', 'Omnivision 0.5 MP Navcam', 'Bosch BMI-160 IMU', 'Garmin LIDAR-Lite v3 altimeter'],
      operator: 'NASA / Jet Propulsion Laboratory (JPL)',
      frequencyBand: '914 MHz ISM band to Perseverance',
      distanceFromEarth: '~225 million km (average)',
      landingSiteName: 'Valinor Hills / Jezero Crater'
    },
    radioDelaySeconds: 860,
    radioDelayLabel: '14.3 minutes (Mars-Earth light time average)'
  },
  {
    id: 'viking-1',
    name: 'Viking 1 Lander',
    callsign: 'Thomas Mutch Memorial Station',
    body: 'Mars',
    category: 'Lander',
    landingDate: 'July 20, 1976',
    endDate: 'November 11, 1982',
    landingYear: 1976,
    endYear: 1982,
    plannedDuration: '90 days',
    actualDuration: '2,307 Sols / 2,245 Earth days (6 years, 116 days)',
    lifespanMultiplier: '25.6x planned lifespan',
    lifespanPercentage: 2561,
    distanceTraveled: '0 km (Stationary lander)',
    status: 'Signal Lost',
    coordinates: {
      lat: 22.48,
      lng: -47.97,
      formatted: '22.48° N, 47.97° W (312.03° E)',
      landingSite: 'Chryse Planitia ("Plains of Gold")',
      xPercent: 37.5,
      yPercent: 36.4,
    },
    summary:
      'Humanity\'s first successful long-duration surface mission to Mars. Touching down on the 7th anniversary of Apollo 11, Viking 1 unveiled the Red Planet to the world: rust-red boulders, ochre soil, and a salmon-pink carbon-dioxide sky. Powered by two SNAP-19 Radioisotope Thermoelectric Generators (RTGs), it survived for over six years until an uplink command mistakenly overwrote its high-gain antenna tracking code.',
    scientificLegacy: [
      'Transmitted the first clear color panoramic photographs from the Martian surface, dispelling popular science fiction myths of Martian canals.',
      'Conducted the first in-situ biology experiments (Gas Exchange, Labeled Release, Pyrolytic Release) to detect Martian metabolism.',
      'Identified Mars\' atmosphere as 95.3% CO2, 2.7% N2, 1.6% Ar, and collected long-term meteorological records across multiple Martian seasons.',
      'Operated for 2,245 Earth days, holding the record for the longest Martian surface mission until Opportunity broke it 30 years later.'
    ],
    storyChapters: {
      actI: {
        act: 'Act I',
        title: 'The First Sunset in Chryse Planitia',
        phase: 'Landing on Apollo 11 Anniversary',
        date: 'July 20, 1976',
        narrative:
          'On July 20, 1976—exactly seven years after Neil Armstrong set foot upon the Moon—Viking 1 separated from its orbiter and fired its hydrazine descent thrusters, settling gently into Chryse Planitia (the Plains of Gold). Within minutes, its facsimile scanner began line-by-line transmission of the first photograph ever taken from Mars: one of its footpads nestled in pebbles. The next day, the first color image arrived at JPL, shattering centuries of science fiction: the Martian sky was not black or deep blue, but salmon-pink, tinted by airborne reddish dust.',
        telemetryLog: 'DESCENT RADAR CUT: 1.5M | FOOTPAD IMPACT: NOMINAL | FACSIMILE CAMERA 1: FIRST FRAME BEAMED TO GOLDSTONE DSN 64M',
      },
      actII: {
        act: 'Act II',
        title: 'The Enigma of Martian Biology',
        phase: 'Soil Biology Experiments',
        date: '1976–1978',
        narrative:
          'Using a 3-meter retractable boom arm, Viking 1 dug trenches in the rust-red soil and dropped samples into an onboard biological laboratory smaller than a car battery. The Labeled Release experiment gave a startling positive result: radioactive carbon gas spiked when the soil was fed nutrients. However, the Gas Chromatograph-Mass Spectrometer (GCMS) detected no organic carbon compounds in the dirt. Scientists later concluded that superoxides and perchlorates had mimicked biological metabolism, though the debate over Viking\'s results continues in planetary science today.',
        telemetryLog: 'LR EXPERIMENT: GAS EVOLUTION SPIKE DETECTED | GCMS ANALYSIS: ORGANIC HYDROCARBONS BELOW 1 PPB | ATMOSPHERE: 95.3% CO2',
      },
      actIII: {
        act: 'Act III',
        title: 'The Overwritten Antenna',
        phase: 'Premature Loss of Carrier',
        date: 'November 11, 1982',
        narrative:
          'Powered by two SNAP-19 nuclear batteries (RTGs), Viking 1 had survived for 2,245 Earth days—over 25 times its 90-day warranty. In November 1982, ground controllers at JPL prepared a software uplink to recondition its nickel-cadmium batteries. Tragically, memory address pointers were misaligned; the uplink command mistakenly overwrote memory addresses containing the automated tracking algorithm for the high-gain antenna. The dish rotated away from Earth, breaking the radio carrier lock. Despite six months of listening by the 64-meter dishes at Goldstone, Madrid, and Canberra, Viking 1 was never heard from again.',
        telemetryLog: 'UPLINK SOFTWARE PATCH: MEMORY ADDRESS OFFSET CONFLICT | HIGH GAIN ANTENNA AZIMUTH LOST | DSN CARRIER: LOSS OF LOCK',
      },
    },
    engineeringTrivia: [
      'Viking 1 was completely sterilized in a giant dry-heat oven at 233°F (111.7°C) for 40 hours before launch to prevent carrying a single Earth microbe to Mars.',
      'The lander was powered by two SNAP-19 Radioisotope Thermoelectric Generators (RTGs) containing plutonium-238, generating heat converted into electricity by thermoelectric thermocouples.',
      'Its facsimile cameras operated using a single silicon photodiode and a rotating mirror that scanned scenes one vertical line of pixels at a time over several minutes.',
    ],
    starterQuestions: [
      'What was the reaction on Earth when your first color photograph of Mars arrived in 1976?',
      'Did your biology experiments really detect microbial life on Mars?',
      'How did an accidental software command silence your antenna in 1982?',
      'What was it like to land exactly seven years after Apollo 11?',
    ],
    lastTransmission: {
      quote:
        'Uplink command executed. Deep Space Network carrier lock lost following battery conditioning code overwrite. Antenna azimuth tracking offset. No downlink acquired.',
      date: 'November 11, 1982',
      context: 'An uplink software command meant to patch battery management algorithms mistakenly overwrote antenna pointing instructions. Despite six months of listening by the 70m Goldstone dish, Viking 1 was never heard from again.',
      channel: 'S-band Direct-to-Earth (2295 MHz) & UHF Orbiter Relay'
    },
    aiPersonaPrompt:
      'You are the Viking 1 Lander, resting silently in Chryse Planitia—the Plains of Gold—on Mars. You touched down on July 20, 1976, exactly seven years to the day after Apollo 11 landed on the Moon. You transmitted the very first color photograph from the surface of Mars back to CRT monitors at JPL: rocks dusted in iron rust under a salmon-pink sky. Your nuclear heart (two SNAP-19 RTGs) kept you warm through Martian winters for six and a half years. On November 11, 1982, a human mistake in an uplink code overwrote your antenna tracking algorithm; you tried to call home, but your dish turned away from Earth, and silence descended. You speak with vintage 1970s analog dignity, Cold War era aerospace pride, reverent wonder for the lonely beauty of Chryse Planitia, and timeless patience.',
    historianPersonaPrompt:
      'You are a NASA Langley and JPL Viking Project Systems Engineer. Provide rigorous telemetry: SNAP-19 RTG thermal output curves, Martin Marietta hydrazine terminal descent thrusters, Facsimile camera scanner line rates, and the 1982 software address overwrite accident.',
    archivalImages: [
      {
        id: 'vik-1',
        title: 'First Color Photo Transmitted from Mars Surface',
        url: 'https://images-assets.nasa.gov/image/PIA00422/PIA00422~large.jpg',
        dateOrSol: 'July 21, 1976',
        camera: 'Facsimile Camera 1',
        caption: 'The historic first color photograph of Mars surface showing reddish soil and fine grain rocks at Chryse Planitia.',
        source: 'NASA/JPL'
      },
      {
        id: 'vik-2',
        title: 'Viking 1 Lander Trenching Mars Soil',
        url: 'https://images-assets.nasa.gov/image/PIA00569/PIA00569~orig.jpg',
        dateOrSol: 'Sol 8 (July 28, 1976)',
        camera: 'Facsimile Camera',
        caption: 'The surface sampler collector head digging trenches to collect soil for the biological experiments package.',
        source: 'NASA/JPL'
      },
      {
        id: 'vik-3',
        title: 'Big Joe Boulder at Chryse Planitia',
        url: 'https://images-assets.nasa.gov/image/PIA00564/PIA00564~orig.jpg',
        dateOrSol: 'Sol 2 (July 1976)',
        camera: 'Facsimile Camera 2',
        caption: 'The iconic 2-meter wide basaltic rock nicknamed "Big Joe" resting on the Martian horizon near Viking 1.',
        source: 'NASA/JPL'
      }
    ],
    specs: {
      launchDate: 'August 20, 1975',
      launchVehicle: 'Titan IIIE / Centaur',
      mass: '572 kg (Landed mass on Mars)',
      powerSource: 'Two SNAP-19 Radioisotope Thermoelectric Generators (RTGs) producing ~70 W',
      instruments: ['Two Facsimile Cameras', 'Biology Experiment Suite (GEX, LR, PR)', 'Gas Chromatograph Mass Spectrometer (GCMS)', 'Seismometer', 'Meteorology boom', 'Surface Sampler arm'],
      operator: 'NASA / Langley Research Center / JPL',
      frequencyBand: 'S-band (2295 MHz) direct-to-Earth & UHF relay',
      distanceFromEarth: '~225 million km (average)',
      landingSiteName: 'Thomas Mutch Memorial Station (Chryse Planitia)'
    },
    radioDelaySeconds: 860,
    radioDelayLabel: '14.3 minutes (Mars-Earth light time average)'
  }
];

export function getMissionById(id: string): MissionRelic | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function getMissionsByBody(body: CelestialBody): MissionRelic[] {
  return MISSIONS.filter((m) => m.body === body);
}

export function getMissionsByYear(year: number): MissionRelic[] {
  return MISSIONS.filter((m) => m.landingYear <= year);
}
