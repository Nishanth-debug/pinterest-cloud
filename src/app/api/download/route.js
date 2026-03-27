import axios from 'axios';
import potrace from 'potrace';
import { promisify } from 'util';

const trace = promisify(potrace.trace);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) return new Response('Missing URL', { status: 400 });

  try {
    // 1. Fetch the image
    const response = await axios({ url: imageUrl, responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 2. Vectorize (Trace) the image
    // Options: color: '#000' ensures a solid black vector for printing/logos
    const svg = await trace(buffer, {
      threshold: 128,
      turdSize: 2, // Removes tiny "noise" spots
      optTolerance: 0.4
    });

    // 3. Return as a Vector (SVG)
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment; filename="kodo_vector.svg"',
      },
    });
  } catch (e) {
    console.error(e);
    return new Response('Vectorization Failed', { status: 500 });
  }
}