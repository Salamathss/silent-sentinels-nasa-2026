import { NextRequest, NextResponse } from 'next/server';
import { getMissionById, MISSIONS, ArchivalImage } from '@/data/missions';

interface NasaApiResponsePhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roverParam = searchParams.get('rover')?.toLowerCase();
  const missionId = searchParams.get('missionId');
  const solParam = searchParams.get('sol') || '1000';

  // Determine target mission
  let targetMission = missionId ? getMissionById(missionId) : undefined;
  if (!targetMission && roverParam) {
    targetMission = MISSIONS.find(
      (m) => m.roverApiName === roverParam || m.id.toLowerCase().includes(roverParam)
    );
  }

  // If rover is specified and is either 'opportunity' or 'spirit', attempt the NASA Mars Photos API
  const rover = roverParam || targetMission?.roverApiName;

  if (rover === 'opportunity' || rover === 'spirit') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const nasaApiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${encodeURIComponent(
        solParam
      )}&api_key=DEMO_KEY`;

      const response = await fetch(nasaApiUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (Array.isArray(data.photos) && data.photos.length > 0) {
          const transformedPhotos: ArchivalImage[] = data.photos
            .slice(0, 12)
            .map((p: NasaApiResponsePhoto) => ({
              id: `nasa-api-${p.id}`,
              title: `${p.rover.name} - ${p.camera.full_name}`,
              url: p.img_src.replace('http://', 'https://'),
              dateOrSol: `Sol ${p.sol} (${p.earth_date})`,
              camera: `${p.camera.name} (${p.camera.full_name})`,
              caption: `Raw telemetry capture transmitted by ${p.rover.name} on Martian Sol ${p.sol}.`,
              source: 'NASA Mars Rover Photos API / JPL',
            }));

          return NextResponse.json({
            success: true,
            source: 'nasa_rover_api',
            rover,
            sol: solParam,
            count: transformedPhotos.length,
            photos: transformedPhotos,
          });
        }
      }
    } catch (err: unknown) {
      console.warn(
        `NASA Rover API fetch failed or timed out for rover "${rover}". Serving curated fallback imagery:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  // Fallback / standard response using curated NASA imagery
  const fallbackMission = targetMission || MISSIONS.find((m) => m.id === 'opportunity') || MISSIONS[0];
  const photos = fallbackMission.archivalImages;

  return NextResponse.json({
    success: true,
    source: 'archival_curated',
    rover: rover || 'curated_mission_archive',
    missionId: fallbackMission.id,
    missionName: fallbackMission.name,
    count: photos.length,
    photos,
    notice:
      'Archival imagery curated from NASA Jet Propulsion Laboratory and Johnson Space Center historical collections.',
  });
}
