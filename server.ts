import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini SDK to prevent startup crashes if key is initially empty
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Error creating Gemini Client:", e);
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// 1. Get custom AI-powered "Aaj Ki Baat" (thought of the day)
app.post("/api/gemini/quote", async (req, res) => {
  const { dateStr, gregorianInfo, hijriInfo, bikarmiInfo } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.status(200).json({
      error: "No API Key configured",
      quote: "وقت کی قدر کرو، کیونکہ یہ واپس نہیں آتا۔",
      translation: "Value time, because it never returns.",
      author: "ثنائیہ (Sufi Proverb)",
      source: "Local Fallback"
    });
  }

  try {
    const prompt = `Generate an inspiring, deep, moral, or philosophical Urdu quote ("Aaj Ki Baat") with an English translation, matching the vibe of this date:
Gregorian Date: ${gregorianInfo || dateStr}
Hijri Month: ${hijriInfo || "Unknown"}
Bikarmi Month: ${bikarmiInfo || "Unknown"}
Provide an inspiring ethical wisdom or life perspective. Deliver the response strictly in JSON format matching the schema requested.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a wise philosopher and expert calligrapher fluent in Urdu literature and Sufi wisdom. Write pure, high-quality, grammatical Urdu text. Refrain from using complex Arabic or Persian text that is illegible. Format your response strictly in JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: {
              type: Type.STRING,
              description: "A beautiful inspiring quote of the day in Urdu script."
            },
            translation: {
              type: Type.STRING,
              description: "The English translation of the quote."
            },
            author: {
              type: Type.STRING,
              description: "Source of the quote or attributes (e.g. Sufi Saying, Hazrat Ali, Allama Iqbal, Wise Saying)."
            }
          },
          required: ["quote", "translation", "author"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Failed to generate quote from Gemini:", err);
    res.json({
      quote: "چھوٹی چھوٹی خوشیوں میں بڑا سکون ملتا ہے۔",
      translation: "In tiny moments of happiness lies great peace.",
      author: "Urdu Wisdom",
      error: err.message
    });
  }
});

// 2. Explaining significance of a date (History, significance)
app.post("/api/gemini/history", async (req, res) => {
  const { gregorian, hijri, bikarmi } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.status(200).json({
      significance: "عیسوی، ہجری اور بکرمی تاریخیں ایک دوسرے سے بے حد مختلف اور دلکش تاریخ رکھتی ہیں۔ ہجری مہینہ چاند کی گردش اور بکرمی مہینہ دیسی زمین و موسم کے بدلتے رنگوں کی عکاسی کرتا ہے۔",
      englishSummary: "Gregorian, Hijri, and Bikarmi calendars have distinct, beautiful origins. Hijri signifies lunar rotations and spiritual transitions, while Bikarmi maps indigenous seasons and South Asian land dynamics."
    });
  }

  try {
    const prompt = `The user is looking at this unique multi-calendar date combination:
- Gregorian Date: ${gregorian.dayName} ${gregorian.day} ${gregorian.monthName} ${gregorian.year}
- Hijri Date: ${hijri.day} ${hijri.monthName} ${hijri.year} AH
- Bikarmi Date: ${bikarmi.day} ${bikarmi.monthName} ${bikarmi.year} BK

Write an explanation in Urdu about the historical, cultural or seasonal significance of this specific combination.
Focus on:
1. The meaning/significance of this Hijri month/day in Islamic traditions.
2. The seasonal or agricultural significance of this Bikarmi month/day in Punjabi/desi culture (e.g. Chet is spring, Bhadon is monsoon, Katak is harvest).
3. Any interesting mathematical or astronomical connection between solar and lunar loops.

Return the response strictly in JSON format containing a beautiful Urdu description and a brief English summary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a cultural historian and scholar who explains calendars and traditions around South Asia and the Middle East in eloquent, accessible Urdu and English. Format output as JSON strictly.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            significance: {
              type: Type.STRING,
              description: "Detailed description of significance in Urdu."
            },
            englishSummary: {
              type: Type.STRING,
              description: "A summary of the historical and seasonal importance in English."
            }
          },
          required: ["significance", "englishSummary"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Failed to explain history from Gemini:", err);
    res.json({
      significance: "تاریخی اور موسمی معلومات حاصل کرنے میں عارضی وقفہ آیا ہے۔ یہ تاریخیں ہمارے عظیم ثقافتی ورثے اور وقت کی خوبصورت تقسیم کا مظہر ہیں۔",
      englishSummary: "Astronomical and seasonal significance lookup is temporarily unavailable. These calendars are beautiful mirrors of our land, climate, and heritage."
    });
  }
});

// ----------------------------------------------------
// VITE AND ASSET HANDLING MIDDLEWARE
// ----------------------------------------------------

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static file server mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to bootstrap Vite/Express middleware:", err);
});
