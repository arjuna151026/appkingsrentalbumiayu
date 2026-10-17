// ========================================================================
//  🎨 KING'S RENTAL - ENHANCED ANIMATIONS & INTERACTIVITY
//  File: animations.js
//  Deskripsi: File JavaScript terpisah untuk semua efek animasi canggih
// ========================================================================

// 🆕 ===============================================
//     PARTICLE SYSTEM - BACKGROUND ANIMATION
// ================================================
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const numberOfParticles = 80;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a + 1; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 - distance / 600})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesArray.forEach(particle => {
        particle.update();
        particle.draw();
    });

    connectParticles();
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

initParticles();
animateParticles();

// 🆕 ===============================================
//     SCROLL PROGRESS BAR
// ================================================
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.getElementById('scroll-progress').style.width = scrollPercent + '%';
});

// ===============================================
//     ORIGINAL JAVASCRIPT (KEPT INTACT)
// ================================================

// --- TESTIMONIALS RENDER ---
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.testimonial-grid');
    container.innerHTML = '<div class="spinner" style="margin: 30px auto; grid-column: 1/-1;"></div>';

    try {
        const response = await fetch('api_testimonials.php');
        const data = await response.json();
        container.innerHTML = '';

        const displayData = data.length > 0 ? data : [
            {
                name: 'Andi Pratama',
                role: 'Wisatawan Jakarta',
                rating: 5,
                text: '"Mobilnya bersih dan wangi. Pelayanan admin sangat ramah dan fast response. Recommended buat yang cari rental di Bumiayu."',
                image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
            },
            {
                name: 'Siti Aminah',
                role: 'Warga Lokal',
                rating: 5,
                text: '"Sewa buat acara nikahan keluarga, unit Xpander-nya mulus banget kaya baru. Harga juga bersahabat."',
                image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png'
            }
        ];

        displayData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'review-card glass-panel reveal';
            card.style.transitionDelay = `${index * 0.1}s`;
            card.innerHTML = `
            <div class="car-rating">
                <i class="ri-star-fill"></i> ${item.rating}.0 <span class="review-count">Pelanggan Puas</span>
            </div>
            <p class="review-text">${item.text}</p>
            <div class="user-profile">
                <div class="avatar"><img src="${item.image}" alt="User"></div>
                <div class="user-info">
                    <h4>${item.name}</h4>
                    <span style="font-size: 0.85rem; opacity: 0.7;">${item.role || 'Pelanggan'}</span>
                </div>
            </div>
        `;
            container.appendChild(card);
        });

        window.dispatchEvent(new Event('scroll'));

    } catch (error) {
        console.error('Gagal memuat testimoni:', error);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Gagal memuat testimoni.</p>';
    }
});

// --- DARK MODE LOGIC ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
        themeIcon.classList.replace('ri-moon-line', 'ri-sun-line');
    } else {
        themeIcon.classList.replace('ri-sun-line', 'ri-moon-line');
    }
}

const currentTheme = localStorage.getItem('theme') || 'light';
setTheme(currentTheme);

themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    setTheme(theme === 'dark' ? 'light' : 'dark');
});

// --- NAVBAR SCROLL EFFECT ---
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- MOBILE MENU ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.replace('ri-menu-line', 'ri-close-line');
    } else {
        icon.classList.replace('ri-close-line', 'ri-menu-line');
    }
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.querySelector('i').classList.replace('ri-close-line', 'ri-menu-line');
    });
});

// --- FILTERING SYSTEM & TABS ---
function switchSearchTab(mode) {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (mode === 'lepas-kunci') {
        buttons[0].classList.add('active');
    } else {
        buttons[1].classList.add('active');
    }
}

function filterSelection(category) {
    const cards = document.querySelectorAll('.car-card');
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 50);
        } else {
            card.style.display = 'none';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
        }
    });
}

// --- BOOKING SYSTEM & MODAL CALCULATOR ---
let tempBookingUrl = "";
let tempTelegramMsg = "";

function openModal() {
    document.getElementById('bookingModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('bookingModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.getElementById('btnConfirmWA').addEventListener('click', () => {
    if (tempBookingUrl !== "") {
        sendTelegramNotif(tempTelegramMsg);
        window.open(tempBookingUrl, '_blank');
        closeModal();
    }
});

function bookingWA(carName, buttonElement) {
    const card = buttonElement.closest('.car-card');
    const carId = card.getAttribute('data-id');
    const carData = globalCarsData.find(c => c.id === carId);
    const hargaPerHari = carData ? carData.price * 1000 : 0;

    const isLepasKunci = document.querySelector('.search-tabs .tab-btn:first-child').classList.contains('active');
    const layanan = isLepasKunci ? "Lepas Kunci" : "Dengan Sopir";
    const biayaSopirPerHari = isLepasKunci ? 0 : 150000;

    let lokasi = document.getElementById('lokasi').value || "Belum ditentukan";
    let tglMulai = document.getElementById('tgl-mulai').value;
    let jamMulai = document.getElementById('jam-mulai').value || "09:00";
    let tglSelesai = document.getElementById('tgl-selesai').value;
    let jamSelesai = document.getElementById('jam-selesai').value || "09:00";

    let durasiHari = 1;
    let tanggalTampil = "Belum ditentukan";

    if (tglMulai && tglSelesai) {
        const date1 = new Date(tglMulai);
        const date2 = new Date(tglSelesai);
        const diffTime = date2 - date1;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) durasiHari = diffDays;
        tanggalTampil = `${tglMulai} s/d ${tglSelesai}`;
    }

    const totalHargaMobil = hargaPerHari * durasiHari;
    const totalBiayaSopir = biayaSopirPerHari * durasiHari;
    const estimasiTotal = totalHargaMobil + totalBiayaSopir;

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

    document.getElementById('modalCarName').innerText = carName;
    document.getElementById('modalService').innerText = layanan;
    document.getElementById('modalDuration').innerText = `${durasiHari} Hari`;
    document.getElementById('modalDate').innerText = tanggalTampil;
    document.getElementById('modalTotalPrice').innerText = formatRupiah(estimasiTotal);

    const phone = "6283170520797";
    const hour = new Date().getHours();
    let greeting = "Selamat pagi";
    if (hour >= 11 && hour < 15) greeting = "Selamat siang";
    else if (hour >= 15 && hour < 18) greeting = "Selamat sore";
    else if (hour >= 18 || hour < 4) greeting = "Selamat malam";

    const message = `${greeting} Admin King's Rental 👋\n\nSaya ingin menyewa unit *${carName}*.\n\n*📋 Detail Rencana Sewa:*\n- Layanan: ${layanan}\n- Durasi: ${durasiHari} Hari\n- Tanggal: ${tanggalTampil}\n- Waktu: ${jamMulai} - ${jamSelesai}\n- Lokasi Penjemputan: ${lokasi}\n\n*💰 Rincian Biaya:*\n- Sewa Mobil (${durasiHari}x): ${formatRupiah(totalHargaMobil)}\n- Biaya Sopir (${durasiHari}x): ${isLepasKunci ? '0 (Tanpa Sopir)' : formatRupiah(totalBiayaSopir)}\n*Total Estimasi: ${formatRupiah(estimasiTotal)}*\n\nApakah unit ini tersedia untuk tanggal tersebut?`;

    tempBookingUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    tempTelegramMsg = `🚨 *PROSPEK SEWA BARU! (OTW WHATSAPP)*\n\n*Mobil:* ${carName}\n*Layanan:* ${layanan}\n*Tanggal:* ${tanggalTampil}\n*Durasi:* ${durasiHari} Hari\n*Estimasi Pendapatan:* ${formatRupiah(estimasiTotal)}\n\n_Pelanggan sedang menuju ruang chat WhatsApp kamu sekarang! Siap-siap balas._`;

    openModal();
}

function fokusKePencarian() {
    document.querySelector('.search-box').scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('lokasi').focus();
}

function filterMobil() {
    const tglMulai = document.getElementById('tgl-mulai').value;
    if (!tglMulai) {
        alert("Mohon isi Tanggal Mulai Rental terlebih dahulu!");
        document.getElementById('tgl-mulai').focus();
        return;
    }

    const armadaSection = document.getElementById('armada');
    armadaSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const grid = document.getElementById('carsGrid');
    let loadingDiv = document.querySelector('.searching-overlay');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.className = 'searching-overlay';
        loadingDiv.innerHTML = '<div class="spinner"></div><p style="font-weight:600; color:var(--text-main);">Mencari armada tersedia...</p>';
        grid.style.position = 'relative';
        grid.appendChild(loadingDiv);
    }
    loadingDiv.classList.add('active');

    setTimeout(() => {
        loadingDiv.classList.remove('active');

        const cards = document.querySelectorAll('.car-card');
        let mobilTersedia = 0;

        cards.forEach(card => {
            if (card.classList.contains('unavailable')) {
                card.style.display = 'none';
            } else {
                card.style.display = 'flex';
                mobilTersedia++;
            }
        });

        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        buttons[0].classList.add('active');

        if (mobilTersedia === 0) {
            alert("Maaf, semua unit mobil kami sedang disewa untuk tanggal tersebut. Silakan hubungi Admin untuk info lebih lanjut.");
        }
    }, 1500);
}

// --- SCROLL REVEAL ANIMATION ---
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener("scroll", reveal);
reveal();

// --- SUBMIT REVIEW SYSTEM ---
let currentRating = 0;

function setRating(n) {
    currentRating = n;
    document.getElementById('reviewRating').value = n;

    for (let i = 1; i <= 5; i++) {
        const star = document.getElementById(`star-${i}`);
        if (i <= n) {
            star.style.color = '#fbbf24';
        } else {
            star.style.color = '#cbd5e1';
        }
    }
    document.getElementById('ratingError').style.display = 'none';
}

async function submitReview() {
    if (currentRating === 0) {
        document.getElementById('ratingError').style.display = 'block';
        return;
    }

    const name = document.getElementById('reviewName').value;
    const role = document.getElementById('reviewRole').value || 'Pelanggan';
    const text = document.getElementById('reviewText').value;

    const payload = {
        action: 'add',
        id: 'rev_' + Date.now(),
        name: name,
        role: role,
        rating: parseInt(currentRating),
        text: text,
        image: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png',
        status: 'pending'
    };

    try {
        const response = await fetch('api_admin_testimonials.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            sendTelegramNotif(`🔔 *REVIEW BARU MASUK!*\n\n*Nama:* ${name}\n*Rating:* ${'⭐'.repeat(currentRating)}\n*Ulasan:* "${text}"\n\n_Segera cek Dashboard Admin untuk menyetujui ulasan ini._`);
            showToast('Terima kasih! Ulasan berhasil dikirim.');
            document.querySelector('#tulis-review form').reset();
            setRating(0);
        } else {
            alert('Gagal mengirim ulasan: ' + result.message);
        }
    } catch (error) {
        console.error('Error submit review:', error);
        alert('Terjadi kesalahan jaringan saat mengirim ulasan.');
    }
}

// --- DYNAMIC CAR RENDERING & AVAILABILITY ---
const defaultCars = [
    {
        id: 'avanza',
        name: 'All New Avanza',
        category: 'silver',
        price: 350,
        image: 'ToyotaAvanza.jpg',
        rating: '4.8 (12 Review)',
        specs: { seat: '7 Seat', trans: 'Manual', fuel: 'Bensin', other: '2 Bag' },
        status: 'available'
    },
    {
        id: 'xenia',
        name: 'All New Xenia',
        category: 'silver',
        price: 350,
        image: 'allNewXenia.jpg',
        rating: '4.9 (18 Review)',
        specs: { seat: '7 Seat', trans: 'Manual', fuel: 'Bensin', other: '2 Bag' },
        status: 'available'
    },
    {
        id: 'brio',
        name: 'Honda Brio',
        category: 'silver',
        price: 300,
        image: 'HondaBrio.jpg',
        rating: '4.8 (56 Review)',
        specs: { seat: '5 Seat', trans: 'Matic', fuel: 'Hemat', other: 'BT' },
        status: 'available'
    },
    {
        id: 'brv',
        name: 'Honda BR-V N7x',
        category: 'gold',
        price: 400,
        image: 'HondaBRVN7.jpg',
        rating: '4.7 (80 Review)',
        specs: { seat: '7 Seat', trans: 'Manual', fuel: 'Bensin', other: '3 Bag' },
        status: 'available'
    },
    {
        id: 'xpander_ult',
        name: 'Mitsubishi Xpander Ultimate',
        category: 'gold',
        price: 400,
        image: 'MistubishiXpanderUltimate.jpg',
        rating: '4.9 (42 Review)',
        specs: { seat: '7 Seat', trans: 'Matic', fuel: 'Bensin', other: 'Smart' },
        status: 'available'
    },
    {
        id: 'xpander_sport',
        name: 'Mitsubishi Xpander Sport',
        category: 'gold',
        price: 400,
        image: 'MistubishiXpanderSport.jpg',
        rating: '4.8 (38 Review)',
        specs: { seat: '7 Seat', trans: 'Matic', fuel: 'Bensin', other: 'Audio' },
        status: 'available'
    }
];

let globalCarsData = [];

async function renderCars() {
    const container = document.getElementById('carsGrid');

    container.innerHTML = Array(3).fill(`
    <div class="skel-card">
        <div class="skeleton" style="width: 100%; height: 200px; border-radius: 12px;"></div>
        <div class="skeleton" style="width: 60%; height: 24px; margin-top: 10px;"></div>
        <div class="skeleton" style="width: 100%; height: 60px;"></div>
        <div class="skeleton" style="width: 100%; height: 40px; border-radius: 50px; margin-top: auto;"></div>
    </div>
`).join('');

    try {
        const response = await fetch('api_cars.php');
        globalCarsData = await response.json();

        container.innerHTML = '';

        if (globalCarsData.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted);">Belum ada armada yang tersedia di Database.</p>';
            return;
        }

        globalCarsData.forEach(car => {
            const isAvailable = car.status === 'available';

            const card = document.createElement('div');
            card.className = `car-card glass-panel reveal ${isAvailable ? '' : 'unavailable'}`;
            card.setAttribute('data-category', car.category);
            card.setAttribute('data-id', car.id);

            const specsHtml = `
            <div class="spec-item"><i class="ri-user-line"></i> ${car.specs.seat}</div>
            <div class="spec-item"><i class="ri-settings-4-line"></i> ${car.specs.trans}</div>
            <div class="spec-item"><i class="ri-gas-station-line"></i> ${car.specs.fuel}</div>
            <div class="spec-item"><i class="ri-briefcase-line"></i> ${car.specs.other}</div>
        `;

            let badgeHtml = '';
            if (car.id === 'avanza') badgeHtml = '<span class="badge">Best Seller</span>';
            if (car.id === 'xenia') badgeHtml = '<span class="badge" style="background: var(--accent);">Premium</span>';

            let imgSrc = car.image;
            if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http') && !imgSrc.startsWith('assets/')) {
                imgSrc = 'assets/cars/' + imgSrc;
            }

            card.innerHTML = `
            <div class="car-image">
                ${badgeHtml}
                <img src="${imgSrc}" alt="${car.name}">
            </div>
            <div class="car-content">
                <div class="car-header">
                    <div class="car-title">
                        <h3>${car.name}</h3>
                        <div class="car-rating">
                            <i class="ri-star-fill"></i> 
                            ${typeof car.rating === 'string' && car.rating.includes('(') ? car.rating.split(' ')[0] : (car.rating || '5.0')}
                            <span class="review-count">${typeof car.rating === 'string' && car.rating.includes('(') ? '(' + car.rating.split('(')[1] : ''}</span>
                        </div>
                    </div>
                </div>
                <div class="car-specs">
                    ${specsHtml}
                </div>
                <div class="car-footer">
                    <div class="price" style="display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2;">
                        <span style="font-size: 0.85rem; font-weight: 400; color: var(--text-main);">Start From</span>
                        <span style="font-size: 1.2rem; font-weight: 800; color: var(--accent);">Rp ${car.price}.000</span>
                    </div>
                    <button class="btn btn-outline" style="padding: 8px 20px;" ${!isAvailable ? 'disabled' : ''}
                        onclick="bookingWA('${car.name}', this)">${isAvailable ? 'Pesan' : 'TIDAK TERSEDIA'}</button>
                </div>
            </div>
        `;
            container.appendChild(card);
        });

        reveal();

    } catch (error) {
        console.error('Gagal memuat API:', error);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--danger);">Gagal terhubung ke Database Server.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderCars();
});

window.addEventListener('storage', (e) => {
    if (e.key === 'kings_cars_data' || e.key === 'kings_carStatus') {
        renderCars();
    }
});

window.addEventListener('focus', renderCars);

// --- SMART DATE VALIDATION ---
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    const startInput = document.getElementById('tgl-mulai');
    const endInput = document.getElementById('tgl-selesai');

    if (startInput) {
        startInput.addEventListener('focus', function () {
            this.setAttribute('min', today);
        });

        startInput.addEventListener('change', function () {
            if (endInput && endInput.value && endInput.value < this.value) {
                endInput.value = this.value;
            }
        });
    }

    if (endInput) {
        endInput.addEventListener('focus', function () {
            const minDate = startInput.value || today;
            this.setAttribute('min', minDate);
        });
    }
});

// --- TYPEWRITER EFFECT ---
class TypeWriter {
    constructor(txtElement, words, wait = 3000) {
        this.txtElement = txtElement;
        this.words = words;
        this.txt = '';
        this.wordIndex = 0;
        this.wait = parseInt(wait, 10);
        this.isDeleting = false;

        let span = this.txtElement.querySelector('.txt');
        if (!span) {
            span = document.createElement('span');
            span.className = 'txt';
            this.txtElement.appendChild(span);
        }
        this.txtSpan = span;
        this.type();
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.txtSpan.textContent = this.txt || '\u00A0';

        let typeSpeed = 100;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const txtElement = document.querySelector('.txt-type');
    if (txtElement) {
        const words = JSON.parse(txtElement.getAttribute('data-words'));
        const wait = txtElement.getAttribute('data-wait');
        new TypeWriter(txtElement, words, wait);
    }
});

function sendTelegramNotif(message) {
    const botToken = '8323531306:AAGaEpVpXEzjlJ5FQRoJd18s4TyPyxYL150';
    const chatId = '7752579306';

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        })
    }).catch(error => console.error('Error kirim Telegram:', error));
}

// --- 3D PARALLAX HERO IMAGE ---
const heroSection = document.querySelector('.hero');
const heroImageContainer = document.querySelector('.hero-image');

if (heroSection && heroImageContainer) {
    heroSection.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 900) {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 40;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 40;

            heroImageContainer.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });

    heroSection.addEventListener('mouseleave', () => {
        if (window.innerWidth > 900) {
            heroImageContainer.style.transition = 'transform 0.5s ease';
            heroImageContainer.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
        }
    });

    heroSection.addEventListener('mouseenter', () => {
        if (window.innerWidth > 900) {
            heroImageContainer.style.transition = 'transform 0.1s ease-out';
        }
    });
}

// --- PRELOADER ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('preloader-hidden');

            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600);
        }, 800);
    }
});

function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `<i class="ri-checkbox-circle-fill"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// --- COUNTER ANIMATION ---
const counters = document.querySelectorAll('.counter');
const speed = 100;

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

const statObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        animateCounters();
        statObserver.disconnect();
    }
});

const counterElement = document.querySelector('.counter');
if (counterElement) {
    statObserver.observe(counterElement);
}