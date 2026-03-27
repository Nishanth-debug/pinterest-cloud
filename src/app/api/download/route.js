import axios from 'axios';
import potrace from 'potrace';
import { promisify } from 'util';

const trace = promisify(potrace.trace);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) return new Response('Missing URL', { status: 400 });

  try {
    console.log("Fetching image from:", imageUrl);
    
    // 1. Fetch image with fake Browser Headers to bypass Pinterest blocks
    const response = await axios({ 
        url: imageUrl, 
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/jpeg,image/png,image/*;q=0.8'
        }
    });
    
    console.log("Image fetched successfully. Converting to buffer...");
    const buffer = Buffer.from(response.data);

    console.log("Starting Potrace vectorization...");
    // 2. Vectorize the image (optimized for apparel logos)
    const svg = await trace(buffer, {
      color: '#000000',
      threshold: 120, // Adjust this between 100-150 if vectors are too dark/light
      optTolerance: 0.4
    });

    console.log("Vectorization complete!");
    // 3. Send back the SVG
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment; filename="kodo_vector.svg"',
      },
    });
  } catch (e) {
    // This will print the EXACT reason it failed to your screen
    console.error("VECTOR ERROR:", e.message);
    return new Response(`Vectorization Error: ${e.message}`, { status: 500 });
  }
}