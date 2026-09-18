const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
const PORT = 3000;


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// CHECK API KEY
// ===============================

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is not loaded.");
    console.error("Check your backend/.env file.");
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
    res.send("AI Chat Backend is running!");
});


// ===============================
// GEMINI CHAT API
// ===============================

app.post("/api/chat", async (req, res) => {

    try {

        const userMessage = req.body.message;


        // Check message
        if (!userMessage || userMessage.trim() === "") {

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

            input: userMessage

        });


        // ===============================
        // GET GEMINI RESPONSE
        // ===============================

        const reply = interaction.output_text;


        console.log("Gemini:", reply);


        // ===============================
        // SEND RESPONSE TO FRONTEND
        // ===============================

        res.json({
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

app.listen(PORT, () => {

    console.log(
        `🚀 Server running on http://localhost:${PORT}`
    );

});