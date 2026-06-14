import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini setup with a clear sanity check per request
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "GEMINI_API_KEY is not configured or still has the placeholder value. Please configuration this key in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Full-stack fashion generation API proxy
app.post("/api/fashion/generate", async (req, res) => {
  try {
    const { description, occasion, genderNeutrality, targetBudget, skillLevel } = req.body;

    if (!description || typeof description !== "string") {
      res.status(400).json({ error: "Clothing description is required." });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert haute-couture and streetwear fashion designer. 
Design an absolute masterpiece fashion design concept based on the following student/beginner parameters:
- Core Description: ${description}
- Occasion context: ${occasion}
- Gender focus: ${genderNeutrality}
- Target budget: ${targetBudget}
- Sewer expertise level: ${skillLevel}

Provide creative styling suggestions, fabric suggestions, a color palette, 3 creative visual/aesthetic mood variations, 
affordable/thrifty local outfit hacks to build a similar look on a budget, and a step-by-step DIY stitching/drafting schedule.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional fashion design instructor. Return output strictly matching the provided JSON schema. Ensure to suggest realistic color combinations with exact HEX values, detailed material specifications with cheap student sourcing alternatives, and tailored outfit suggestions that duplicate the custom style affordably.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "conceptName",
            "aesthetic",
            "silhouette",
            "moodDescription",
            "canvasGuide",
            "colorPalette",
            "materials",
            "variations",
            "budgetSuggestions",
            "assemblySteps"
          ],
          properties: {
            conceptName: {
              type: Type.STRING,
              description: "A highly creative, literal yet sophisticated name for the design concept."
            },
            aesthetic: {
              type: Type.STRING,
              description: "Primary fashion aesthetic (e.g., Cyberpunk Streetwear, Victorian Goth, Minimalist Scandi, Deconstructed Grunge)."
            },
            silhouette: {
              type: Type.STRING,
              description: "The visual outline or structure of the design (e.g., Oversized boxy silhouette with asymmetric draping)."
            },
            moodDescription: {
              type: Type.STRING,
              description: "A detailed sensory brief about the emotion, vibe, or mood this design evokes."
            },
            canvasGuide: {
              type: Type.STRING,
              description: "An explicit, descriptive text blueprint of the garment's visual details. Include seam lengths, hemlines, stitch lines, collar structures, pockets, and specific focal features. This guides a student's hand sketch."
            },
            colorPalette: {
              type: Type.ARRAY,
              description: "Palette of 4 key colors that compose the look.",
              items: {
                type: Type.OBJECT,
                required: ["name", "hex", "weight"],
                properties: {
                  name: { type: Type.STRING, description: "Descriptive name like 'Burnt Ochre' or 'Foggy Sage'" },
                  hex: { type: Type.STRING, description: "Exact Hex color code, e.g. '#2F4F4F'" },
                  weight: { type: Type.INTEGER, description: "Numeric ratio/importance value (e.g., 60 for dominant, 30, 20, 10)" },
                  pantone: { type: Type.STRING, description: "Optional approximate Pantone Reference code (like 18-1250 TCX)" }
                }
              }
            },
            materials: {
              type: Type.ARRAY,
              description: "3-4 material and fabric specifications recommended for this garment.",
              items: {
                type: Type.OBJECT,
                required: ["name", "type", "description", "sourcingTip"],
                properties: {
                  name: { type: Type.STRING, description: "Fabric/Material name, e.g. '10oz Brushed Cotton Canvas', 'Recycled Polyester Mesh'" },
                  type: { type: Type.STRING, description: "Category e.g., 'Main Shell', 'Lining', 'Trims', 'Hardware'" },
                  description: { type: Type.STRING, description: "Why this fabric was selected, its weight, and drape behavior." },
                  sourcingTip: { type: Type.STRING, description: "Budget-friendly suggestion for students, such as bedsheets, curtains, or deadstock outlets." }
                }
              }
            },
            variations: {
              type: Type.ARRAY,
              description: "3 diverse variations representing different artistic directions of this design.",
              items: {
                type: Type.OBJECT,
                required: ["id", "name", "description", "keyChanges"],
                properties: {
                  id: { type: Type.STRING, description: "id for list rendering" },
                  name: { type: Type.STRING, description: "Variation title, e.g., 'The Runway Avant-Garde', 'The Everyday Casual'" },
                  description: { type: Type.STRING, description: "Detailed description of how the concept changes." },
                  keyChanges: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 discrete, concrete fashion lines altered (e.g. 'Shorten standard hemline to mid-waist')"
                  }
                }
              }
            },
            budgetSuggestions: {
              type: Type.ARRAY,
              description: "Practical strategies and outfit assemblies to reconstruct or fake this high-fashion concept with affordable retail/thrift finds.",
              items: {
                type: Type.OBJECT,
                required: ["itemName", "whereToFind", "approxPrice", "stylingTip"],
                properties: {
                  itemName: { type: Type.STRING },
                  whereToFind: { type: Type.STRING, description: "Specific thrifting category or budget retailer type" },
                  approxPrice: { type: Type.STRING, description: "Expected pricing range, e.g. '$5-$12'" },
                  stylingTip: { type: Type.STRING, description: "How to fit, layer, or distress this cheap element to mimic the high-fashion concept look." }
                }
              }
            },
            assemblySteps: {
              type: Type.ARRAY,
              description: "A clear step-by-step DIY drafting and sewing instruction sheet for students to construct the outfit.",
              items: {
                type: Type.OBJECT,
                required: ["stepNumber", "phase", "title", "instruction", "difficulty"],
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  phase: { type: Type.STRING, description: "Drafting, Cutting, Assembly, or Finishing" },
                  title: { type: Type.STRING },
                  instruction: { type: Type.STRING },
                  difficulty: { type: Type.STRING, description: "Easy, Medium, or Challenging" }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Generative AI proxy error:", error);
    res.status(500).json({
      error: error.message || "An unexpected error occurred during design generation.",
      needsApiKey: error.message && error.message.includes("GEMINI_API_KEY")
    });
  }
});

// Configure Vite or Static Middleware depending on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Fashion Design Server running on port ${PORT}`);
  });
}

startServer();
