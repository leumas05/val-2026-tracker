export async function onRequest(context) {
  const svtUrl = "https://valresultat.svt.se/2026/";
  
  try {
    // Gör anropet till SVT
    const svtResponse = await fetch(svtUrl, {
      headers: {
        // En User-Agent kan ibland hjälpa till att undvika blockeringar
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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

