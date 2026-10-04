export default function handler(req, res) {
    res.status(200).json({
        status: "healthy ✅",
        service: "Viraj Link Shortener API",
        timestamp: new Date().toISOString(),
        region: process.env.VERCEL_REGION || 'unknown',
        developer: "Viraj_Prajapati 👑",
        "buy apis": "https://t.me/viraj_dm_bot",
        website: "https://ethical-viraj-link-shortener.vercel.app/",
        portfolio: "https://ethicalviraj.vercel.app/"
    });
}
