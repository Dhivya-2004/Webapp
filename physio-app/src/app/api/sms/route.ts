import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message, number } = await request.json();

    // --- MOCK SMS FOR DEVELOPMENT ---
    console.log(`[MOCK SMS] Sending to ${number}: ${message}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({ 
      return: true, 
      request_id: "mock_id_" + Date.now(), 
      message: ["SMS sent successfully (Mocked for Development)"] 
    });
    // --------------------------------

    /* 
    // UNCOMMENT THIS SECTION WHEN YOU RECHARGE FAST2SMS WALLET
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": "JhRcn46m2g5PUfijvktClErqbys78SpD0T9AVXYIKGQHWO3zMoerxB1IKzUuob5RvSY9Qc7OMsqWpyFN",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "q",
        message: message,
        language: "english",
        flash: 0,
        numbers: number
      })
    });

    const data = await response.json();
    console.log("Fast2SMS API Response:", data);
    
    if (!response.ok || data.return === false) {
       return NextResponse.json({ error: data.message || "Failed to send SMS" }, { status: 400 });
    }

    return NextResponse.json(data);
    */
  } catch (error) {
    console.error("SMS Error:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
