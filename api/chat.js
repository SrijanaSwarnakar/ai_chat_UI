const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

module.exports = async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            error: "GEMINI_API_KEY is not configured"
        });
    }

    try {
        const userMessage = req.body?.message;

        if (
            !userMessage ||
            typeof userMessage !== "string" ||
            userMessage.trim() === ""
        ) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const interaction = await ai.interactions.create({
            model: "gemini-3.8-flash",
            input: userMessage.trim()
        });

        const reply = interaction.output_text;

        if (!reply) {
            return res.status(500).json({
                error: "No response received from Gemini"
            });
        }

        return res.status(200).json({
            reply
        });

    } catch (error) {
        console.error("Gemini API Error:", error);

        return res.status(500).json({
            error: "Failed to get response from Gemini"
        });
    }
};