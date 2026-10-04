export default function handler(req, res) {
    res.status(200).json({
        status: "online ✅",
        service: "Viraj Link Shortener API",
        developer: "Viraj_Prajapati 👑",
        "buy apis": "https://t.me/viraj_dm_bot",
        website: "https://ethical-viraj-link-shortener.vercel.app/",
        portfolio: "https://ethicalviraj.vercel.app/",
        message: "API is working! Use /api/shorten to shorten links.",
        usage: "/api/shorten?url=YOUR_LONG_URL&apikey=virajdeveloper&token=VJ2026SECURE"
    });
}
