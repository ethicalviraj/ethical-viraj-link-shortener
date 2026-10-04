const API_KEY = 'virajdeveloper';
const API_TOKEN = 'VJ2026SECURE'; // Make sure this matches exactly
const API_ENDPOINT = '/api/shorten';

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');
const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const result = document.getElementById('result');
const year = document.getElementById('year');

if (year) year.textContent = new Date().getFullYear();

function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

hamburger.addEventListener('click', () => toggleMenu());
overlay.addEventListener('click', () => toggleMenu(false));

document.querySelectorAll('.mobile-menu > a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
});

async function shortenUrl() {
    const url = urlInput.value.trim();

    if (!url) {
        showResult('Please enter a URL to shorten.', 'error');
        return;
    }

    try { new URL(url); }
    catch { showResult('Invalid URL. Please enter a valid http:// or https:// link.', 'error'); return; }

    // UI Loading State
    shortenBtn.disabled = true;
    shortenBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Shortening...</span>';
    result.classList.remove('show');

    try {
        const res = await fetch(
            `${API_ENDPOINT}?url=${encodeURIComponent(url)}&apikey=${API_KEY}&token=${API_TOKEN}`
        );

        // Check if response is OK
        if (!res.ok) {
            // Try to parse JSON error response, fallback to generic error
            let errorMsg = `Server error (${res.status})`;
            try {
                const errData = await res.json();
                if (errData.error) errorMsg = errData.error;
            } catch (e) {
                // Response wasn't JSON (maybe HTML 404 page)
                if (res.status === 404) {
                    errorMsg = 'API endpoint not found. Please check your vercel.json configuration.';
                }
            }
            throw new Error(errorMsg);
        }

        const data = await res.json();

        if (data.success && data.shortUrl) {
            showShortResult(data.shortUrl, url, data.provider);
        } else {
            showResult(data.error || 'Something went wrong. Please try again.', 'error');
        }
    } catch (err) {
        // Show the actual error message
        showResult(err.message || 'Network error. Please try again.', 'error');
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Shorten</span>';
    }
}

function showResult(message, type = 'success') {
    const icon = type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check';
    result.innerHTML = `
        <div class="result-box ${type}">
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    result.classList.add('show');
}

function showShortResult(shortUrl, originalUrl, provider) {
    result.innerHTML = `
        <div class="result-box">
            <i class="fa-solid fa-circle-check"></i>
            <a href="${shortUrl}" target="_blank" rel="noopener">${shortUrl}</a>
        </div>
        <div class="result-actions">
            <button class="action-btn" onclick="copyToClipboard('${shortUrl}')">
                <i class="fa-regular fa-copy"></i> Copy
            </button>
            <a class="action-btn" href="${shortUrl}" target="_blank" rel="noopener">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Open
            </a>
            <button class="action-btn" onclick="shareLink('${shortUrl}')">
                <i class="fa-solid fa-share-nodes"></i> Share
            </button>
        </div>
    `;
    result.classList.add('show');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const t = document.createElement('div');
        t.textContent = '✅ Copied to clipboard!';
        t.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: linear-gradient(135deg, #a855f7, #06b6d4);
            color: white; padding: 12px 24px; border-radius: 12px;
            font-weight: 600; z-index: 9999;
            box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4);
        `;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2000);
    });
}

function shareLink(url) {
    if (navigator.share) {
        navigator.share({ title: 'Short Link', url });
    } else {
        copyToClipboard(url);
    }
}

function copyCode(btn) {
    const code = btn.parentElement.querySelector('code').innerText;
    copyToClipboard(code);
}

shortenBtn.addEventListener('click', shortenUrl);
urlInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') shortenUrl();
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .doc-card, .social-card, .stat').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

window.copyToClipboard = copyToClipboard;
window.shareLink = shareLink;
window.copyCode = copyCode;
