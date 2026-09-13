export async function onRequest(context) {
  const svtUrl = "https://valresultat.svt.se/2026/";
  
  try {
    const svtResponse = await fetch(svtUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const html = await svtResponse.text();
    
    // Vi extraherar all data från HTML och formaterar om den till JSON (API)
    const parties = {};
    const partyNames = [
        'Vänsterpartiet', 'Socialdemokraterna', 'Miljöpartiet', 'Centerpartiet', 
        'Liberalerna', 'Moderaterna', 'Kristdemokraterna', 'Sverigedemokraterna'
    ];
    
    partyNames.forEach(name => {
        // Hitta var i texten partiet nämns för att avgränsa sökningen
        const partyIndex = html.indexOf('>' + name + '<');
        if (partyIndex !== -1) {
            // Plocka ut ett stycke HTML direkt efter partinamnet
            const chunk = html.substring(partyIndex, partyIndex + 1000).replace(/\s+/g, ' ');
            
            // Leta efter "X röster" och "Y av 349 mandat"
            const voteMatch = chunk.match(/([\d\s]+)röster/);
            const mandateMatch = chunk.match(/(\d+)\s*av\s*349\s*mandat/);
            
            if (voteMatch) {
                parties[name] = {
                    votes: parseInt(voteMatch[1].replace(/\s/g, ''), 10),
                    mandates: mandateMatch ? parseInt(mandateMatch[1], 10) : 0
                };
            }
        }
    });

    const responseData = {
        timestamp: new Date().toISOString(),
        source: "SVT Valresultat 2026",
        data: parties
    };

    return new Response(JSON.stringify(responseData, null, 2), {
        status: 200,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*" // Gör API:et publikt för alla att hämta
        }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Kunde inte hämta data från SVT: " + error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}

