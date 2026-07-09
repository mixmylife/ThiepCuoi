/**
 * ThiepCuoiViet — Shared JS Utilities
 * Dùng chung cho tất cả templates
 */

const TCVUtils = {
    // Lấy slug từ URL path /thiep/:slug
    getSlug() {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1] || 'demo';
    },

    // API Base URL (tự detect dev/prod)
    getApiBase() {
        return `${window.location.protocol}//${window.location.hostname}:${window.location.port || 3000}/api`;
    },

    // Countdown Timer
    startCountdown(dateString, daysEl, hoursEl, minutesEl, secondsEl, containerId) {
        if (!dateString) return;
        const target = new Date(dateString).getTime();
        const update = () => {
            const now = Date.now();
            const dist = target - now;
            if (dist < 0) {
                const el = document.getElementById(containerId);
                if (el) el.innerHTML = '<h3 style="color:white">💒 Đám cưới đã diễn ra!</h3>';
                return;
            }
            const pad = n => String(Math.floor(n)).padStart(2, '0');
            if (daysEl)    daysEl.innerText    = pad(dist / 86400000);
            if (hoursEl)   hoursEl.innerText   = pad((dist % 86400000) / 3600000);
            if (minutesEl) minutesEl.innerText = pad((dist % 3600000) / 60000);
            if (secondsEl) secondsEl.innerText = pad((dist % 60000) / 1000);
        };
        setInterval(update, 1000);
        update();
    },

    // Scroll fade-in animation
    initScrollAnimations(selector = '.fade-in') {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll(selector).forEach(el => observer.observe(el));
    },

    // Show/hide sections dựa vào config
    applySections(sections = {}) {
        const defaults = {
            hero: true, invitation: true, story: true,
            countdown: true, events: true, gallery: true,
            banking: true, rsvp: true, guestbook: false, dresscode: false
        };
        Object.entries({ ...defaults, ...sections }).forEach(([key, visible]) => {
            const el = document.getElementById(`sec-${key}`);
            if (el) el.style.display = visible ? '' : 'none';
        });
    },

    // Toast notification
    showToast(msg, type = 'success', duration = 3500) {
        let toast = document.getElementById('__tcv-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = '__tcv-toast';
            toast.style.cssText = `
                position:fixed;bottom:25px;right:25px;z-index:9999;
                padding:14px 22px;border-radius:12px;font-family:sans-serif;
                font-size:0.9rem;font-weight:500;color:white;max-width:350px;
                box-shadow:0 10px 40px rgba(0,0,0,0.25);display:none;
                transition:all 0.3s;
            `;
            document.body.appendChild(toast);
        }
        toast.style.background = type === 'error' ? '#e74c3c' : '#27ae60';
        toast.textContent = msg;
        toast.style.display = 'block';
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => toast.style.display = 'none', duration);
    },

    // Copy to clipboard
    copyText(text) {
        return navigator.clipboard.writeText(text)
            .then(() => TCVUtils.showToast('✅ Đã sao chép!'))
            .catch(() => TCVUtils.showToast('❌ Không thể sao chép', 'error'));
    },

    // Format date VN
    formatDateVN(isoString) {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString('vi-VN');
    },

    // Music URLs map
    MUSIC_URLS: {
        'canon':            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'a-thousand-years': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'perfect':          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        'wedding-march':    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    },

    // Init music player
    initMusic(musicConfig) {
        if (!musicConfig?.enabled) return;
        const url = musicConfig.customUrl || TCVUtils.MUSIC_URLS[musicConfig.track] || '';
        if (!url) return;
        const audio = document.getElementById('bg-audio');
        if (!audio) return;
        audio.src = url;
        document.getElementById('music-player').style.display = 'block';
        document.addEventListener('click', () => {
            if (audio.paused) audio.play().catch(() => {});
        }, { once: true });
    }
};

// Export nếu dùng trong Node
if (typeof module !== 'undefined') module.exports = TCVUtils;
