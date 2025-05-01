"use server"

import aj from "@/lib/arcjet";
import { serializeCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getFeaturedCars(limit = 6) {
    try {
        const cars = await db.car.findMany({
            where: {
                featured: true,
                status: "AVAILABLE",
            },
            take: limit,
            orderBy: {createdAt: "desc"},
        })

        return cars.map(serializeCarData);
    } catch (error) {
        throw new Error("Error fetching featured cars:" + error.message)
    }
}

async function fileToBase64(file) {
    const bytes  = await file.arrayBuffer();  // return promise so using await
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64");
}

export async function processImageSearch (file) {
    try {
        // Rate limit with arcjet

        const req = await request();

        const descision = await aj.protect(req, {
            requested: 1,
        });

        if(descision.isDenied())
        {
            if(descision.reason.isRateLimit())
            {
                const {remaining, reset} = descision.reason;

                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset,
                    },
                });

                throw new Error ("Too many requests. Please try again later.")
             }
             throw new Error("Request blocked");
        }

        if(!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key is not configured")
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({model:"gemini-1.5-flash"})

        const base64Image = await fileToBase64(file);

        const imagePart = {
            inlineData:{
                data: base64Image,
                mimeType: file.type,
            },
        }

        const prompt = `
        Analyze this car image and extract the following information:
        1. Make (manafacturer)
        2. Body tye (SUV, Sedan, Hatchback, etc.)
        3. Color

        Format your response as a clean JSON object with these fields:
        {
            "make": "",
            "bodyType": "",
            "color": "",
            "confidence": 0.0
        }

        For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
        Only respond with the JSON object, nothing else.
        `;

        const result = await model.generateContent([imagePart, prompt]);
        const response = await result.response;
        const text = response.text();  
        const cleanText = text.replace(/```(?:json)?\n?/g, "").trim(); // to clean the text

        try {
            const carDetails = JSON.parse(cleanText);
            return {
                success: true,
                data: carDetails,
            }
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            return {
                success: false,
                error: "Failed to parse AI response",
            }
        }
    } catch (error) {
        throw new Error("AI Search error:" + error.message);
    }
}