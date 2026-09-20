const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

// Use the port provided by the hosting service
const PORT = process.env.PORT || 3000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// CHECK GEMINI API KEY
// ===============================

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is not configured.");
    process.exit(1);
}

console.log("✅ Gemini API key loaded");


// ===============================
// INITIALIZE GEMINI
// ===============================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "AI Chat Backend is running!",
        status: "success"
    });
});


// ===============================
// GEMINI CHAT API
// ===============================

app.post("/api/chat", async (req, res) => {

    try {

        const userMessage = req.body.message;


        // Validate message
        if (
            !userMessage ||
            typeof userMessage !== "string" ||
            userMessage.trim() === ""
        ) {
            return res.status(400).json({
                error: "Message is required"
            });
        }


        console.log("User:", userMessage);


        // ===============================
        // SEND MESSAGE TO GEMINI
        // ===============================

        const interaction = await ai.interactions.create({

            model: "gemini-3.6-flash",

            input: userMessage.trim()

        });


        // ===============================
        // GET GEMINI RESPONSE
        // ===============================

        const reply = interaction.output_text;


        if (!reply) {
            return res.status(500).json({
                error: "No response received from Gemini"
            });
        }


        console.log("Gemini:", reply);


        // ===============================
        // SEND RESPONSE TO FRONTEND
        // ===============================

        res.status(200).json({
            reply: reply
        });

    }

    catch (error) {

        console.error("❌ Gemini API Error:");
        console.error(error);

        res.status(500).json({
            error: "Failed to get response from Gemini"
        });
    }
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `🚀 AI Chat Backend running on port ${PORT}`
    );

});