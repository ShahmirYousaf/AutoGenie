import { GoogleGenerativeAI } from "@google/generative-ai"

async function fileToBase64(file0) {
    const bytes  = await file.arrayBuffer();  // return promise so using await
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64");
}

export async function processCarImageWithAI(file) {
    try{
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
        2. Model
        3. Year (approximately)
        4. Color
        5. Body type (SUV, Sedan, Hatchback, etc.)
        6. Mileafe
        7. Fuel type (your best guess)
        8. Transmission type (your best guess)
        9. Price (your best guess)
        10. Short Description as to be added to a car listing

        Format your response as a clean JSON object with these fields:
        {
            "make": "",
            "model": "",
            "year": 0000,
            "color": "",
            "price": "",
            "mileage": "",
            "bodyType": "",
            "fuelType": "",
            "transmission": "",
            "description": "",
            "confidence": 0.0
        }

        For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
        Only respond with the JSON object, nothing else.
        `

    }catch (error){}
}