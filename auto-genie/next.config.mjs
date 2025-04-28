/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsHmrCache: false, 
    },

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ozlgybmhdsnifrqqedyb.supabase.co"
            },
        ],
    },

    async header() {
        return [
            {
                source: "/embed",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: "frame-src 'self' https:// https://autogenie.created.app "
                    }
                ]
            }
        ]
    },
    
};

export default nextConfig;
