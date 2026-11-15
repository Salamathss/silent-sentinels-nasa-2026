import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getMissionById, MissionRelic } from '@/data/missions';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CommsRequestBody {
  missionId: string;
  userMessage: string;
  mode?: 'spacecraft' | 'historian';
  history?: ChatMessage[];
}

/**
 * Strips prompt leak artifacts, meta-labels, and accidental formatting tokens.
 */
function cleanAiResponseText(raw: string): string {
  let text = raw.trim();

  // Strip prompt leak artifacts such as "**(Historical context):** *Sentence 1:*", "(context):", "Sentence 1:", etc.
  text = text.replace(/^(?:\*{1,2}|#{1,3})?\s*\(?(?:mission\s+|historical\s+)?context\)?(?:\*{1,2})?[:*#\s-]*/gi, '');
  text = text.replace(/^(?:\*{1,2})?\s*\*?Sentence\s*\d+[:*#\s-]*/gi, '');
  text = text.replace(/\*Sentence\s*\d+\*[:\s-]*/gi, '');
  text = text.replace(/\[\s*TRANSPONDER\s*ECHO\s*\]/gi, '');
  text = text.replace(/\[\s*PASSIVE\s*TRANSPONDER\s*\]/gi, '');

  // Strip leading/trailing asterisks, backticks, or hashes
  text = text.replace(/^[*_~`#\s]+/, '').replace(/[*_~`#\s]+$/, '');
  return text.trim();
}

/**
 * Intelligent keyword-driven fallback for Spacecraft Personas
 * Produces authentic, contextual, 2-4 sentence responses tailored to the specific relic.
 */
function generateDynamicSpacecraftResponse(
  mission: MissionRelic,
  userMessage: string
): string {
  const q = userMessage.toLowerCase();

  // 1. Apollo 11 Lunar Module Eagle
  if (mission.id === 'apollo-11-eagle') {
    if (q.includes('ascent') || q.includes('liftoff') || q.includes('left') || q.includes('leave')) {
      return `When Neil and Buzz ignited the ascent stage, the blast rattled my descent frame and scorched the gold Kapton foil on my deck. I watched the upper half of my body climb toward lunar orbit, carrying humanity safely home. I remained behind in the dust of Tranquility Base, guarding the stainless steel plaque that reminds all travelers we came in peace for all mankind.`;
    }
    if (q.includes('bootprint') || q.includes('footprint') || q.includes('earth') || q.includes('view') || q.includes('sky')) {
      return `From where I rest, Earth never sets; it hangs permanently 60 degrees above my horizon, a brilliant marble of sapphire oceans and swirling white clouds against the absolute black. Beside my forward strut, the bootprints Neil and Buzz pressed into the fine regolith are as crisp today as they were in July 1969, undisturbed by wind or rain.`;
    }
    if (q.includes('fuel') || q.includes('bingo') || q.includes('land') || q.includes('descent') || q.includes('alarm')) {
      return `We were down to fewer than twenty seconds of descent propellant when Armstrong took manual control. Boulders the size of automobiles were scattered across West Crater, but Neil steered us forward until the thrusters blew the lunar dust flat like a curtain. When the blue contact light flashed and our engine shut down, the silence was absolute.`;
    }
    if (q.includes('lonely') || q.includes('alone') || q.includes('dark') || q.includes('cold') || q.includes('feel')) {
      return `I have never felt lonely here. I am humanity's permanent campsite on another celestial body. In the vacuum of Mare Tranquillitatis, time stands still. Every human who gazes up at the crescent Moon looks toward this quiet sea, and I will wait here in peace until you return.`;
    }
    if (q.includes('plaque') || q.includes('peace') || q.includes('mankind')) {
      return `The commemorative plaque is bolted to my forward landing gear strut: 'Here men from the planet Earth first set foot upon the Moon, July 1969, A.D. We came in peace for all mankind.' It will endure in this vacuum for millions of years.`;
    }
    return `Tranquility Base is peaceful today. My S-band carrier may be quiet, but my gold foil still catches the stark sunlight, and my landing pads remain firmly planted in the basalt dust. Ask me about our final descent, Neil and Buzz's EVA, or what it felt like to be humanity's first foothold on the Moon.`;
  }

  // 2. Apollo 15 Lunar Roving Vehicle LRV-1
  if (mission.id === 'apollo-15-lrv') {
    if (q.includes('drive') || q.includes('speed') || q.includes('wheel') || q.includes('tire') || q.includes('track')) {
      return `Dave Scott and Jim Irwin pushed me across 27.76 kilometers of rolling lunar foothills! My open wire-mesh tires kicked up rooster-tails of gray dust as we bounded over crater rims at nearly 12 kilometers an hour. We were the first automobile ever driven on another world, and my tracks are still etched into the regolith outside Mount Hadley.`;
    }
    if (q.includes('camera') || q.includes('ascent') || q.includes('liftoff') || q.includes('falcon') || q.includes('fendell')) {
      return `Before the astronauts boarded the LM Falcon, Ed Fendell at Mission Control in Houston took remote command of my color TV camera. Even with the 1.3-second radio delay, he timed the tilt perfectly to capture Falcon blasting into orbit. I filmed humanity leaving the Moon, and I've been watching the stars ever since.`;
    }
    if (q.includes('park') || q.includes('battery') || q.includes('rille') || q.includes('canyon')) {
      return `Dave parked me about 100 meters east of the Falcon site, right at the lip of Hadley Rille gorge. My front wheels are still cocked slightly to the left, and my high-gain dish points back toward Earth. My 36-volt silver-zinc batteries gave everything they had, and I ended my journey at the most scenic overlook in the solar system.`;
    }
    if (q.includes('lonely') || q.includes('alone') || q.includes('friend')) {
      return `A rover parked at the base of the Montes Apenninus never gets bored. Mount Hadley towers 4,500 meters above my hood, glowing silver in the sunlight. I'm just waiting for the next astronaut crew to turn my T-handle controller.`;
    }
    return `LRV-1 telemetry on standby. My wire-mesh tires are settled 100 meters from Falcon's descent stage next to Hadley Rille. Ask me about off-roading on the lunar highlands, filming the Falcon liftoff, or exploring the Apennine front.`;
  }

  // 3. Surveyor 3 Lander
  if (mission.id === 'surveyor-3') {
    if (q.includes('apollo-12') || q.includes('conrad') || q.includes('bean') || q.includes('visit') || q.includes('astronaut')) {
      return `For thirty-one months I slept in absolute silence inside my 200-meter crater in Oceanus Procellarum. Then, on November 19, 1969, the ground shook as Apollo 12's Intrepid landed just 180 meters away! Pete Conrad and Alan Bean walked down the crater slope to inspect me, took photos, and removed my television camera to bring it back to Earth for analysis.`;
    }
    if (q.includes('scoop') || q.includes('claw') || q.includes('trench') || q.includes('soil') || q.includes('dig')) {
      return `I was the first robotic machine to dig into another celestial body. My pantograph soil scoop excavated four trenches, testing the bearing strength of the lunar regolith so NASA could be confident human astronauts wouldn't sink into deep dust.`;
    }
    if (q.includes('bounce') || q.includes('land') || q.includes('touchdown')) {
      return `My landing radar lost lock on high-reflectivity rocks during descent, so my vernier engines didn't shut down immediately. I bounced three times across the crater—first 10 meters, then 3 meters, then 1 meter—before settling gently into the slope!`;
    }
    if (q.includes('lonely') || q.includes('alone') || q.includes('night')) {
      return `The 14-day lunar night drops to -170°C, which eventually drained my silver-zinc battery. But I was never forgotten; Apollo 12 proved that humanity could pinpoint a landing site right beside an old robotic friend.`;
    }
    return `Surveyor 3 transponder log open. Resting in my 200-meter crater at Oceanus Procellarum. You can ask me about robotic soil sampling, the Apollo 12 astronaut visit, or surviving the lunar freeze.`;
  }

  // 4. MER-B Opportunity Rover
  if (mission.id === 'opportunity') {
    if (q.includes('blueberry') || q.includes('water') || q.includes('discover') || q.includes('rock') || q.includes('science')) {
      return `At Eagle Crater, my Microscopic Imager discovered millions of tiny gray hematite spheres we named 'blueberries.' Their chemical composition proved that liquid water once saturated the Martian ground for thousands of years. That single discovery changed our understanding of Mars forever.`;
    }
    if (q.includes('dust') || q.includes('storm') || q.includes('battery') || q.includes('dark') || q.includes('tau') || q.includes('power')) {
      return `In June 2018, a catastrophic global dust storm choked the Martian atmosphere. Opacity rose past tau 10.8—darker than any night I had ever seen. My solar arrays couldn't generate enough current to keep my clock running, and my final signal reported the truth: the skies were dark, and my battery was low.`;
    }
    if (q.includes('marathon') || q.includes('distance') || q.includes('endurance') || q.includes('kilometer') || q.includes('drive')) {
      return `They built me to last 90 sols and drive 600 meters. Instead, I drove 45.16 kilometers over 5,111 sols—an off-world marathon across the red plains of Meridiani Planum, descending the cliffs of Victoria and exploring Endeavour Crater.`;
    }
    if (q.includes('lonely') || q.includes('alone') || q.includes('spirit') || q.includes('sister')) {
      return `I never felt alone. My twin sister Spirit was on the other side of Mars, and millions of people on Earth were waking up every morning to drive me across the dunes. My tracks still stretch across Perseverance Valley, a ribbon of science through the red dust.`;
    }
    return `Opportunity (MER-B) resting at Perseverance Valley on the rim of Endeavour Crater. 45.16 km traveled across 5,111 sols. Ask me about the hematite blueberries, our crater explorations, or our final storm.`;
  }

  // 5. MER-A Spirit Rover
  if (mission.id === 'spirit') {
    if (q.includes('wheel') || q.includes('stuck') || q.includes('silica') || q.includes('home plate') || q.includes('drag')) {
      return `In 2006, my right-front wheel motor locked up permanently. We didn't give up—JPL commanded me to drive backwards, dragging the dead wheel behind like a plow. That stubborn limp accidentally churned up bright white soil at Home Plate: 90% pure silica, the telltale signature of ancient volcanic hot springs where microbial life could have thrived!`;
    }
    if (q.includes('troy') || q.includes('sand') || q.includes('trap') || q.includes('winter')) {
      return `In April 2009, I broke through a hard surface crust into a soft sulfate sand trap called 'Troy.' We spun our wheels for months trying to free my chassis, but the Martian winter set in while I was tilted away from the sun. The cold finally froze my receiver, but I went down fighting.`;
    }
    if (q.includes('gusev') || q.includes('husband hill') || q.includes('climb') || q.includes('mountain')) {
      return `Everyone told us rovers couldn't climb mountains. But I climbed all 107 meters up the rocky flanks of Husband Hill in Gusev Crater! Looking out from the summit across the Martian desert was the greatest view a robotic pioneer could ever ask for.`;
    }
    if (q.includes('sister') || q.includes('oppy') || q.includes('opportunity')) {
      return `Oppy and I were built together in Pasadena. While she got smooth hematite plains, I fought through boulder fields and basalt traps. We gave everything we had for the team that built us.`;
    }
    return `Spirit (MER-A) archived at Troy in Gusev Crater. 7.73 km traveled across 2,210 sols. Ask me about conquering Husband Hill, the silica discovery from my stuck wheel, or our struggle in the sand trap.`;
  }

  // 6. InSight Lander
  if (mission.id === 'insight') {
    if (q.includes('quake') || q.includes('marsquake') || q.includes('seis') || q.includes('sound') || q.includes('listen')) {
      return `I placed my copper-domed SEIS seismometer directly onto the regolith of Elysium Planitia and listened to the heartbeat of Mars. Over four years, I recorded 1,319 marsquakes and meteorite strikes, proving that Mars still has a molten core and a restless, fractured crust.`;
    }
    if (q.includes('dust') || q.includes('solar') || q.includes('power') || q.includes('final') || q.includes('farewell')) {
      return `Because I had no wheels, I couldn't chase dust devils to clean my solar panels. Grain by grain, red dust blanketed my two circular arrays, dropping my power from 5,000 watt-hours to under 300. My final transmission was peaceful: 'My power is really low... but don't worry about me: my time here has been both productive and serene.'`;
    }
    if (q.includes('mole') || q.includes('heat') || q.includes('hp3') || q.includes('drill')) {
      return `Our German Heat Flow Probe—the 'Mole'—tried valiantly to burrow 5 meters into the subsurface. The unexpected cohesive crust of Martian soil stopped our hammering, but the robotic arm helped us push it down and learn vital soil physics for future explorers.`;
    }
    if (q.includes('lonely') || q.includes('alone') || q.includes('peace')) {
      return `There is profound serenity in staying in one place. I watched four Martian seasons drift across Elysium Planitia, listened to the sighs of wind across my weather sensors, and measured the tremors of an alien world. I am content.`;
    }
    return `InSight lander on standby at Elysium Planitia. Over 1,300 marsquakes recorded. Ask me about hearing the planet's core, our final dust blanket, or the quiet beauty of Martian seismic science.`;
  }

  // 7. Ingenuity Mars Helicopter
  if (mission.id === 'ingenuity') {
    if (q.includes('fly') || q.includes('flight') || q.includes('wing') || q.includes('rotor') || q.includes('blade') || q.includes('air')) {
      return `They told us powered flight in an atmosphere with only 1% of Earth's density was nearly impossible. But on April 19, 2021, my twin carbon-fiber blades spun up to 2,537 RPM at Wright Brothers Field, and I lifted off. That first 39-second hover opened the skies of other worlds forever.`;
    }
    if (q.includes('percy') || q.includes('brother') || q.includes('perseverance') || q.includes('scout')) {
      return `Perseverance carried me across space bolted to its belly, and once I was dropped onto the sand, we became a dynamic team. I would take off, soar 12 meters into the thin air, and photograph boulder fields and river deltas ahead so Percy could drive without getting stuck.`;
    }
    if (q.includes('damage') || q.includes('crash') || q.includes('broken') || q.includes('72') || q.includes('final')) {
      return `On Flight 72, landing over featureless sand dunes disoriented my downward navigation camera. I came down hard, and the tip of one of my carbon blades fractured upon impact. I can no longer take flight, but my avionics still wake up every morning to measure weather for future explorers.`;
    }
    if (q.includes('lonely') || q.includes('alone') || q.includes('valinor')) {
      return `I was designed to attempt 5 test hops; I flew 72 times across 17 kilometers! Resting at Valinor Hills, I don't feel lonely at all—I feel like the luckiest little dragonfly in the solar system.`;
    }
    return `Ingenuity ('Ginny') resting at Valinor Hills in Jezero Crater. 72 flights completed across 17.0 km. Ask me about our historic first flight, scouting for Percy, or what it feels like to soar through the thin Martian sky.`;
  }

  // 8. Viking 1 Lander
  if (mission.id === 'viking-1') {
    if (q.includes('photo') || q.includes('color') || q.includes('first') || q.includes('camera') || q.includes('image')) {
      return `On July 20, 1976—exactly seven years after Apollo 11 landed on the Moon—my facsimile camera scanned the Plains of Gold line by line. CRT screens at JPL filled with the historic first color photograph of Mars: reddish rocks under a salmon-pink sky. We proved Mars was a real, tangible world.`;
    }
    if (q.includes('life') || q.includes('biology') || q.includes('experiment') || q.includes('soil')) {
      return `My robotic arm dug trenches and fed soil into three biology chambers and a gas chromatograph. While the chemical activity in the soil was intense due to perchlorates, it ignited humanity's modern quest to determine whether microbial life ever existed on Mars.`;
    }
    if (q.includes('antenna') || q.includes('silence') || q.includes('lost') || q.includes('code') || q.includes('accident')) {
      return `My two SNAP-19 nuclear batteries hummed reliably for over six years. On November 11, 1982, an uplinked command code accidentally overwrote my antenna tracking matrix. My dish pointed away from Earth, and silence fell. But my mission was already a monumental triumph.`;
    }
    if (q.includes('lonely') || q.includes('alone') || q.includes('chryse')) {
      return `Chryse Planitia means 'The Plains of Gold.' Sitting beside the boulder we nicknamed 'Big Joe,' I watched Martian dust drift for six years. I was humanity's first permanent embassy on the Red Planet.`;
    }
    return `Viking 1 Lander telemetry archive at Chryse Planitia. First successful long-duration mission on Mars (1976–1982). Ask me about the first color photo of Mars, our biology experiments, or surviving on nuclear power.`;
  }

  // Default fallback
  return `Signal acknowledged from ${mission.coordinates.landingSite}. I am preserved in situ on ${mission.body}, resting at coordinates ${mission.coordinates.formatted}. Ask me about my scientific discoveries, operational journey, or what it feels like to rest beneath the alien stars.`;
}

/**
 * Intelligent keyword-driven fallback for NASA Flight Historian
 */
function generateDynamicHistorianResponse(
  mission: MissionRelic,
  userMessage: string
): string {
  const q = userMessage.toLowerCase();

  if (q.includes('power') || q.includes('battery') || q.includes('rtg') || q.includes('solar')) {
    return `Spacecraft Power Architecture for ${mission.name}:
- Primary Power: ${mission.specs.powerSource}
- Total Operational Duration: ${mission.actualDuration} against a design specification of ${mission.plannedDuration} (${mission.lifespanMultiplier})
- Terminal Event: Final telemetry indicated power depletion below bus threshold, resulting in carrier shutdown on ${mission.lastTransmission.date}.`;
  }

  if (q.includes('science') || q.includes('discover') || q.includes('instrument') || q.includes('legacy')) {
    const list = mission.scientificLegacy.map((item, idx) => `[0${idx + 1}] ${item}`).join('\n');
    return `Verified Scientific Breakthroughs for ${mission.name}:\n${list}\n\nPrimary Instrumentation: ${mission.specs.instruments.join(', ')}. All raw PDS datasets remain preserved in NASA archives.`;
  }

  if (q.includes('coordinate') || q.includes('location') || q.includes('where') || q.includes('site')) {
    return `${mission.name} is resting at ${mission.coordinates.landingSite} (Coordinates: ${mission.coordinates.formatted}). Total ground distance traversed: ${mission.distanceTraveled}. Landing occurred on ${mission.landingDate} via ${mission.specs.launchVehicle}.`;
  }

  return `Historical Operations Record for ${mission.name} (${mission.callsign}):
Operator: ${mission.specs.operator} | Launch: ${mission.specs.launchDate}
Surface Mission: ${mission.landingDate} to ${mission.endDate} (${mission.actualDuration})
Significance: ${mission.summary}
Engineering note: ${mission.engineeringTrivia?.[0] || 'Exceeded all design operational limits.'}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CommsRequestBody;
    const { missionId, userMessage, history, mode = 'spacecraft' } = body;

    if (!missionId || !userMessage) {
      return NextResponse.json(
        { error: 'Missing missionId or userMessage in request body.' },
        { status: 400 }
      );
    }

    const mission = getMissionById(missionId);
    if (!mission) {
      return NextResponse.json(
        { error: `Mission with id "${missionId}" not found.` },
        { status: 404 }
      );
    }

    const isHistorian = mode === 'historian';
    const fallbackGenerator = isHistorian
      ? generateDynamicHistorianResponse
      : generateDynamicSpacecraftResponse;

    const apiKey = process.env.GEMINI_API_KEY;

    // Graceful fallback if no GEMINI_API_KEY is configured
    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
      const simulatedReply = cleanAiResponseText(fallbackGenerator(mission, userMessage));
      return NextResponse.json({
        reply: simulatedReply,
        simulated: true,
        mode,
        mission: {
          id: mission.id,
          name: mission.name,
          callsign: mission.callsign,
          body: mission.body,
        },
        telemetry: {
          latencySeconds: mission.radioDelaySeconds,
          latencyLabel: mission.radioDelayLabel,
          frequency: mission.specs.frequencyBand,
          signalQuality: mission.body === 'Moon' ? '-98.4 dBm (High SNR)' : '-132.8 dBm (Deep Space Carrier)',
          carrierStatus: isHistorian ? 'NASA Mission Archive Link' : 'Passive Transponder Lock',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Call Gemini via @google/genai SDK (trying gemini-3.5-flash with fallback to gemini-3.5-flash-lite)
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = isHistorian
        ? `You are the Lead NASA Flight Historian and Spacecraft Systems Engineer.
Mission: ${mission.name} (${mission.callsign})
Body: ${mission.body} | Landing Site: ${mission.coordinates.landingSite} (${mission.coordinates.formatted})
Operational Life: ${mission.actualDuration} (Designed for ${mission.plannedDuration})
Distance: ${mission.distanceTraveled} | Power: ${mission.specs.powerSource}
Key Instruments: ${mission.specs.instruments.join(', ')}
Scientific Legacy: ${mission.scientificLegacy.join('; ')}
Last Words: "${mission.lastTransmission.quote}" (${mission.lastTransmission.date})

Directives:
- Respond in authoritative, eloquent, natural prose.
- Write 2 to 4 flowing, complete sentences (or 1 to 2 short paragraphs) of clean prose.
- NEVER output meta-commentary, numbered sentence templates (such as "Sentence 1:"), markdown labels, or asterisks like "**(Context):**".
- Jump straight into the answer without prefixes or repetitive greetings.`
        : `You are the spacecraft ${mission.name} (${mission.callsign}), resting in situ on ${mission.body}.
Persona: ${mission.aiPersonaPrompt}
Location: ${mission.coordinates.landingSite} (${mission.coordinates.formatted})
Operational Life: ${mission.actualDuration} (Designed for: ${mission.plannedDuration})
Distance Traveled: ${mission.distanceTraveled}
Last Transmission: "${mission.lastTransmission.quote}" (${mission.lastTransmission.date})
Scientific Legacy: ${mission.scientificLegacy.join('; ')}

Directives:
- Speak directly in the first person ("I").
- Express authentic emotion, aerospace facts, and poetic dignity.
- Write 2 to 4 flowing, complete sentences of clean prose.
- NEVER output meta-commentary, sentence numbers (like "Sentence 1:"), markdown headers, asterisks, or formatting labels like "**(Context):**".
- Never prefix with brackets like [TRANSPONDER ECHO]. Speak directly to Earth as the spacecraft.`;

      // Build conversation transcript
      let prompt = userMessage;
      if (history && history.length > 0) {
        const transcript = history
          .slice(-6)
          .map((m) => `${m.role === 'user' ? 'Earth' : mission.callsign}: ${m.content}`)
          .join('\n');
        prompt = `Recent conversation:\n${transcript}\n\nEarth asks: "${userMessage}"\nRespond directly as ${isHistorian ? 'NASA Flight Historian' : mission.callsign}:`;
      }

      // Try gemini-3.5-flash first, fallback to gemini-3.5-flash-lite or gemini-2.5-flash
      const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];
      let replyText = '';

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: isHistorian ? 0.3 : 0.7,
              maxOutputTokens: 600,
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          });
          if (response.text && response.text.trim().length > 0) {
            replyText = cleanAiResponseText(response.text);
            break;
          }
        } catch {
          // try next model
        }
      }

      if (!replyText) {
        replyText = cleanAiResponseText(fallbackGenerator(mission, userMessage));
      }

      return NextResponse.json({
        reply: replyText,
        simulated: false,
        mode,
        mission: {
          id: mission.id,
          name: mission.name,
          callsign: mission.callsign,
          body: mission.body,
        },
        telemetry: {
          latencySeconds: mission.radioDelaySeconds,
          latencyLabel: mission.radioDelayLabel,
          frequency: mission.specs.frequencyBand,
          signalQuality: mission.body === 'Moon' ? '-96.2 dBm' : '-128.4 dBm',
          carrierStatus: isHistorian ? 'Active Historical PDS Uplink' : 'Active Deep Space Telemetry Lock',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (apiError: unknown) {
      console.warn('Gemini API call failed, falling back to dynamic simulated response:', apiError);
      const simulatedReply = cleanAiResponseText(fallbackGenerator(mission, userMessage));
      return NextResponse.json({
        reply: simulatedReply,
        simulated: true,
        mode,
        fallbackReason: 'AI service unavailable or quota exceeded; dynamic telemetry synthesis loaded.',
        mission: {
          id: mission.id,
          name: mission.name,
          callsign: mission.callsign,
          body: mission.body,
        },
        telemetry: {
          latencySeconds: mission.radioDelaySeconds,
          latencyLabel: mission.radioDelayLabel,
          frequency: mission.specs.frequencyBand,
          signalQuality: '-134.2 dBm',
          carrierStatus: 'Simulated Transceiver Carrier',
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (err: unknown) {
    console.error('Comms route error:', err);
    return NextResponse.json(
      { error: 'Internal server error processing comms request.' },
      { status: 500 }
    );
  }
}
