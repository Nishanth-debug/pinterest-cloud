import axios from 'axios';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let imageUrl = searchParams.get('url');

  if (!imageUrl) return new Response('Missing URL', { status: 400 });

  try {
    // 1. Follow the redirect if it's a short pin.it link
    if (imageUrl.includes('pin.it')) {
      const res = await axios.get(imageUrl, { maxRedirects: 5 });
      // We still need a direct image URL to download a file
      // If the redirect leads to an HTML page, this will fail.
      imageUrl = res.request.res.responseUrl; 
    }

    // 2. Fetch the actual image data
    const response = await axios({ 
        url: imageUrl, 
        method: 'GET', 
        responseType: 'arraybuffer' 
    });

    // 3. Send back as a PNG
    return new Response(response.data, {
      headers: {
        'Content-Type': 'image/png', // Changed to PNG
        'Content-Disposition': 'attachment; filename="kodo_design.png"', // Changed to .png
      },
    });
  } catch (e) {
    console.error(e);
    return new Response('Error processing image', { status: 500 });
  }
}