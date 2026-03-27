import axios from 'axios';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let imageUrl = searchParams.get('url');

  if (!imageUrl) return new Response('Missing URL', { status: 400 });

  try {
    // 1. If it's a short pin.it link, we need to find where it redirects
    if (imageUrl.includes('pin.it')) {
      const redirectResponse = await axios.get(imageUrl, {
        maxRedirects: 5,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      // The actual image page URL is now in redirectResponse.request.res.responseUrl
      const finalUrl = redirectResponse.request.res.responseUrl;
      
      // Note: Extra logic would be needed here to scrape the <img> tag.
      // For now, the most reliable way is still pasting the direct IMAGE link.
    }

    const response = await axios({ 
        url: imageUrl, 
        method: 'GET', 
        responseType: 'arraybuffer' 
    });

    return new Response(response.data, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': 'attachment; filename="kodo_design.jpg"',
      },
    });
  } catch (e) {
    return new Response('Error processing link', { status: 500 });
  }
}