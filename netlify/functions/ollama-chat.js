exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ error: "Method not allowed" })
      };
    }

    const { message, history = [] } = JSON.parse(event.body || "{}");

    if (!message || !message.trim()) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ error: "Message is required" })
      };
    }

    if (!process.env.HF_ANALYSIS_URL || !process.env.HF_API_TOKEN) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Missing Hugging Face environment variables"
        })
      };
    }

    if (!process.env.OLLAMA_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Missing OLLAMA_API_KEY"
        })
      };
    }

    const trimmed = message.trim();

    // 1) Hugging Face analysis call
    const analysisResponse = await fetch(process.env.HF_ANALYSIS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.HF_API_TOKEN}`
      },
      body: JSON.stringify({
        inputs: trimmed
      })
    });

    const analysisText = await analysisResponse.text();

    if (!analysisResponse.ok) {
      return {
        statusCode: analysisResponse.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Hugging Face analysis request failed",
          details: analysisText
        })
      };
    }

    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
    } catch {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Hugging Face returned invalid JSON",
          details: analysisText
        })
      };
    }

    // 2) Plain Ollama response
    const plainResponse = await fetch("https://ollama.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "ministral-3:3b",
        stream: false,
        messages: [
          ...history,
          { role: "user", content: trimmed }
        ]
      })
    });

    const plainText = await plainResponse.text();

    if (!plainResponse.ok) {
      return {
        statusCode: plainResponse.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Plain Ollama request failed",
          details: plainText
        })
      };
    }

    let plainData;
    try {
      plainData = JSON.parse(plainText);
    } catch {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Plain Ollama returned invalid JSON",
          details: plainText
        })
      };
    }

    const plainReply = plainData?.message?.content || "";

    // 3) Emotion/VAD-aware Ollama response
const alteredResponse = await fetch("https://ollama.com/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`
  },
  body: JSON.stringify({
    model: process.env.OLLAMA_MODEL || "ministral-3:3b",
    stream: false,
    messages: [
      {
        role: "system",
        content: `You will receive internal emotion and VAD analysis for the user's message.
Use that information only as hidden context to shape your response.
Do not mention, quote, summarise, list, or refer to the emotion analysis, VAD analysis, labels, scores, or internal metadata unless the user explicitly asks for them.`
      },
      ...history,
      {
        role: "user",
        content: trimmed
      },
      {
        role: "system",
        content: `Internal analysis for the most recent user message:
${JSON.stringify({
  emotion_analysis: analysisData.emotion_analysis,
  vad_analysis: analysisData.vad_analysis
})}`
      }
    ]
  })
});

    const alteredText = await alteredResponse.text();

    if (!alteredResponse.ok) {
      return {
        statusCode: alteredResponse.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Altered Ollama request failed",
          details: alteredText
        })
      };
    }

    let alteredData;
    try {
      alteredData = JSON.parse(alteredText);
    } catch {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Altered Ollama returned invalid JSON",
          details: alteredText
        })
      };
    }

    const alteredReply = alteredData?.message?.content || "";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        analysis: {
          emotion_analysis: analysisData.emotion_analysis,
          vad_analysis: analysisData.vad_analysis
        },
        plainResponse: plainReply,
        alteredResponse: alteredReply
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Server error",
        details: error.message
      })
    };
  }
};