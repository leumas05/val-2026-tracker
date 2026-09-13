export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Fånga upp anrop till vårt API
    if (url.pathname === '/api/svt') {
      const svtUrl = "https://valresultat.svt.se/2026/";
      try {
        const svtResponse = await fetch(svtUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });

        // Kopiera svaret
        const newResponse = new Response(svtResponse.body, svtResponse);
        
        // Tillåt CORS för vår frontend
        newResponse.headers.set("Access-Control-Allow-Origin", "*");
        
        // Rensa bort headers som blockerar
        newResponse.headers.delete("content-security-policy");
        newResponse.headers.delete("x-frame-options");

        return newResponse;
      } catch (error) {
        return new Response("Kunde inte hämta data från SVT: " + error.message, { status: 500 });
      }
    }
    
    // För alla andra filer (som index.html), ladda dem normalt
    return env.ASSETS.fetch(request);
  }
};

