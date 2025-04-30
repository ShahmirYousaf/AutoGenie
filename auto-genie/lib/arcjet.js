import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 15,  // refill 15 tokens per interval
            interval: 3600,  // per hour interval
            capacity: 20,  // bucket max capacity
        })
    ]
})

export default aj;