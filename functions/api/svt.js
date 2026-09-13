export async function onRequest(context) {
  // context.request contains the incoming Request
  const urlObj = new URL(context.request.url);
  const path = urlObj.searchParams.get('path') || '';
  const svtUrl = "https://valresultat.svt.se/2026/" + path;
  
  try {
    // Gör anropet till SVT och sätt en standard webbläsar-User-Agent
    const svtResponse = await fetch(svtUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      }
    });

    // Skapa en ny respons baserad på SVT:s svar
    const newResponse = new Response(svtResponse.body, svtResponse);
    
    // Lägg till CORS headers så att webbläsaren tillåter detta om man kör på annan domän
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    
    // Ta bort restriktiva headers som SVT skickar med
    newResponse.headers.delete("content-security-policy");
    newResponse.headers.delete("x-frame-options");

    return newResponse;
  } catch (error) {
    return new Response("Kunde inte hämta data från SVT: " + error.message, { status: 500 });
  }
}

