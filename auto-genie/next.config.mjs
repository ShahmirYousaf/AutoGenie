/** @type {import('next').NextConfig} */
const nextConfig = {
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
    }
};

export default nextConfig;
