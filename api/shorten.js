const VALID_API_KEY = 'virajdeveloper';
const VALID_API_TOKEN = 'VJ2026SECURE'; // 12-char token (V J 2 0 2 6 S E C U R E)

const DEV_SIGNATURE = {
    developer: "Viraj_Prajapati 👑",
    "buy apis": "https://t.me/viraj_dm_bot",
    website: "https://ethical-viraj-link-shortener.vercel.app/",
    portfolio: "https://ethicalviraj.vercel.app/"
};

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Provider 1: is.gd
async function shortenWithIsGd(longUrl) {
    const apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`;
    const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const data = await response.json();
    if (data.errorcode) throw new Error(data.errormessage);
    if (!data.shorturl) throw new Error('No URL returned from is.gd');
    return data.shorturl;
}

// Provider 2: TinyURL
async function shortenWithTinyUrl(longUrl) {
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
    const response = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const text = await response.text();
    if (!text || text.toLowerCase().includes('error')) throw new Error('TinyURL blocked request');
    return text.trim();
}

// Provider 3: CleanURI
async function shortenWithCleanUri(longUrl) {
    const response = await fetch('https://cleanuri.com/api/v1/shorten', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        body: `url=${encodeURIComponent(longUrl)}`
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    if (!data.result_url) throw new Error('No URL returned from CleanURI');
    return data.result_url;
}

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-api-token');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // 1. Authenticate
    const queryKey = req.query.apikey;
    const queryToken = req.query.token;
    const headerKey = req.headers['x-api-key'];
    const headerToken = req.headers['x-api-token'];

    const providedKey = queryKey || headerKey;
    const providedToken = queryToken || headerToken;

    if (providedKey !== VALID_API_KEY || providedToken !== VALID_API_TOKEN) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized. Invalid or missing API key / token.",
            hint: "Provide both ?apikey=virajdeveloper&token=VJ2026SECURE",
            ...DEV_SIGNATURE
        });
    }

    // 2. Get URL
    const longUrl = req.query.url;

    if (!longUrl) {
        return res.status(400).json({
            success: false,
            error: "No URL provided. Add ?url=YOUR_LONG_URL",
            ...DEV_SIGNATURE
        });
    }

    if (!isValidUrl(longUrl)) {
        return res.status(400).json({
            success: false,
            error: "Invalid URL. Must start with http:// or https://",
            ...DEV_SIGNATURE
        });
    }

    // 3. Try Shortening with Fallbacks
    const providers = [
        { name: 'is.gd', fn: () => shortenWithIsGd(longUrl) },
        { name: 'tinyurl', fn: () => shortenWithTinyUrl(longUrl) },
        { name: 'cleanuri', fn: () => shortenWithCleanUri(longUrl) }
    ];

    const errors = [];

    for (const provider of providers) {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );

            const shortUrl = await Promise.race([provider.fn(), timeoutPromise]);

            if (shortUrl && isValidUrl(shortUrl)) {
                return res.status(200).json({
                    success: true,
                    shortUrl: shortUrl,
                    originalUrl: longUrl,
                    provider: provider.name,
                    ...DEV_SIGNATURE
                });
            }
        } catch (error) {
            errors.push(`${provider.name}: ${error.message}`);
        }
    }

    // 4. All providers failed
    return res.status(502).json({
        success: false,
        error: "All shortening providers failed. Please try again later.",
        attempts: errors,
        ...DEV_SIGNATURE
    });
}
