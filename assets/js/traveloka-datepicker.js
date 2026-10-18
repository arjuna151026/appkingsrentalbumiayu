/**
 * ==========================================================================
 * TRAVELOKA STYLE DATE RANGE PICKER COMPONENT
 * Sesuai ATURAN KETAT:
 * - Tidak mengubah id/name/alur data sistem asli.
 * - Nilai dikirim ke input asli dengan format "YYYY-MM-DD" + dispatchEvent change/input.
 * - Feature flag USE_NEW_DATEPICKER untuk kemudahan rollback sewaktu-waktu.
 * ==========================================================================
 */

// 1. FEATURE FLAG (Ubah ke false jika ingin kembali 100% ke tampilan lama)
const USE_NEW_DATEPICKER = true;
window.USE_NEW_DATEPICKER = USE_NEW_DATEPICKER;

(function () {
    if (!USE_NEW_DATEPICKER) return;

    document.addEventListener('DOMContentLoaded', () => {
        // Ambil elemen asli di DOM
        const startInput = document.getElementById('tgl-mulai');
        const endInput = document.getElementById('tgl-selesai');
        const searchBox = document.querySelector('.search-box');

        if (!startInput || !endInput || !searchBox) {
            console.warn("Traveloka Datepicker: Form pencarian tidak ditemukan di halaman ini.");
            return;
        }

        // ==========================================
        // KONSTANTA & NAMA BULAN / HARI INDONESIA
        // ==========================================
        const MONTH_NAMES = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const WEEKDAYS_HEADER = [
            { label: 'Sen', isSunday: false },
            { label: 'Sel', isSunday: false },
            { label: 'Rab', isSunday: false },
            { label: 'Kam', isSunday: false },
            { label: 'Jum', isSunday: false },
            { label: 'Sab', isSunday: false },
            { label: 'Min', isSunday: true }
        ];

        // Format tanggal hari ini dalam format YYYY-MM-DD
        const now = new Date();
        const todayStr = formatDateISO(now);

        // State internal picker
        let startDate = startInput.value || '';
        let endDate = endInput.value || '';
        let viewDate = startDate ? new Date(startDate) : new Date();
        viewDate.setDate(1); // Mulai dari tanggal 1

        let isOpen = false;
        let activeTarget = 'mulai'; // 'mulai' atau 'selesai'

        // ==========================================
        // 2. ATURAN #3: PERTAHANKAN INPUT ASLI
        // Sembunyikan secara visual, lalu buat trigger UI
        // ==========================================
        startInput.classList.add('tv-hidden-accessible');
        endInput.classList.add('tv-hidden-accessible');

        // Buat elemen trigger untuk Tanggal Mulai
        const triggerMulai = document.createElement('div');
        triggerMulai.className = 'tv-date-trigger-wrap';
        triggerMulai.id = 'tv-trigger-mulai';
        triggerMulai.innerHTML = `
            <div class="tv-date-display ${startDate ? '' : 'empty'}">
                <i class="ri-calendar-2-line"></i>
                <span class="tv-date-text">${formatDisplayDate(startDate) || 'Pilih Tanggal'}</span>
            </div>
        `;
        startInput.parentNode.insertBefore(triggerMulai, startInput);

        // Buat elemen trigger untuk Tanggal Selesai
        const triggerSelesai = document.createElement('div');
        triggerSelesai.className = 'tv-date-trigger-wrap';
        triggerSelesai.id = 'tv-trigger-selesai';
        triggerSelesai.innerHTML = `
            <div class="tv-date-display ${endDate ? '' : 'empty'}">
                <i class="ri-calendar-event-line"></i>
                <span class="tv-date-text">${formatDisplayDate(endDate) || 'Pilih Tanggal'}</span>
            </div>
        `;
        endInput.parentNode.insertBefore(triggerSelesai, endInput);

        // ==========================================
        // 3. BUAT POPOVER KALENDER TRAVELOKA
        // ==========================================
        const popover = document.createElement('div');
        popover.className = 'tv-datepicker-popover';
        popover.id = 'tvDatepickerPopover';
        popover.innerHTML = `
            <div class="tv-popover-top-info">
                <span>Pilih: <strong id="tvPickerGuide">Tanggal Mulai Rental</strong></span>
                <button type="button" class="tv-popover-close-btn" id="tvCloseBtn" title="Tutup">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="tv-months-wrapper" id="tvMonthsWrapper">
                <!-- Render 2 Bulan di sini -->
            </div>
            <div class="tv-popover-footer">
                <span class="tv-duration-badge" id="tvDurationBadge">Rentang belum dipilih</span>
                <button type="button" class="tv-btn-done" id="tvBtnDone">Selesai</button>
            </div>
        `;

        // Masukkan popover ke dalam search-box agar posisinya relatif terhadap form
        searchBox.style.position = 'relative';
        searchBox.appendChild(popover);

        // ==========================================
        // 4. FUNGSI RENDER DUA BULAN BERDAMPINGAN
        // ==========================================
        function renderCalendar() {
            const wrapper = document.getElementById('tvMonthsWrapper');
            wrapper.innerHTML = '';

            // Bulan 1: viewDate
            const month1 = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
            // Bulan 2: viewDate + 1 bulan
            const month2 = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

            wrapper.appendChild(createMonthCard(month1, true, false));
            wrapper.appendChild(createMonthCard(month2, false, true));

            updateGuideAndBadge();
        }

        function createMonthCard(firstDayOfMonth, showPrevArrow, showNextArrow) {
            const year = firstDayOfMonth.getFullYear();
            const month = firstDayOfMonth.getMonth();

            const card = document.createElement('div');
            card.className = 'tv-month-card';

            // Header Bulan + Navigasi
            const header = document.createElement('div');
            header.className = 'tv-month-header';

            // Tombol Prev (Hanya di bulan kiri)
            let prevBtnHtml = '';
            if (showPrevArrow) {
                // Jangan izinkan navigasi ke bulan sebelum bulan sekarang jika sudah bulan berjalan
                const isCurrentMonth = (year === now.getFullYear() && month === now.getMonth());
                prevBtnHtml = `
                    <button type="button" class="tv-nav-arrow" id="tvPrevMonth" ${isCurrentMonth ? 'disabled' : ''}>
                        <i class="ri-arrow-left-s-line"></i>
                    </button>
                `;
            } else {
                prevBtnHtml = `<div style="width: 34px;"></div>`;
            }

            // Tombol Next (Hanya di bulan kanan)
            let nextBtnHtml = '';
            if (showNextArrow) {
                nextBtnHtml = `
                    <button type="button" class="tv-nav-arrow" id="tvNextMonth">
                        <i class="ri-arrow-right-s-line"></i>
                    </button>
                `;
            } else {
                nextBtnHtml = `<div style="width: 34px;"></div>`;
            }

            header.innerHTML = `
                ${prevBtnHtml}
                <div class="tv-month-title">${MONTH_NAMES[month]} ${year}</div>
                ${nextBtnHtml}
            `;
            card.appendChild(header);

            // Baris Nama Hari (Sen - Min)
            const weekdaysRow = document.createElement('div');
            weekdaysRow.className = 'tv-weekdays-row';
            WEEKDAYS_HEADER.forEach(d => {
                const el = document.createElement('div');
                el.className = `tv-weekday ${d.isSunday ? 'sunday' : ''}`;
                el.textContent = d.label;
                weekdaysRow.appendChild(el);
            });
            card.appendChild(weekdaysRow);

            // Grid Tanggal
            const daysGrid = document.createElement('div');
            daysGrid.className = 'tv-days-grid';

            // Menentukan hari pertama bulan (0 = Minggu, 1 = Senin, dst)
            // Kalender kita mulai dari Senin (Senin = 0, Minggu = 6)
            let firstDayIndex = firstDayOfMonth.getDay() - 1;
            if (firstDayIndex === -1) firstDayIndex = 6; // Jika Minggu

            // Kotak kosong sebelum tanggal 1
            for (let i = 0; i < firstDayIndex; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'tv-day-cell empty';
                daysGrid.appendChild(emptyCell);
            }

            // Jumlah hari dalam bulan ini
            const totalDays = new Date(year, month + 1, 0).getDate();

            for (let day = 1; day <= totalDays; day++) {
                const dateObj = new Date(year, month, day);
                const dateStr = formatDateISO(dateObj);
                const dayOfWeek = dateObj.getDay(); // 0 = Minggu

                const cell = document.createElement('div');
                cell.className = 'tv-day-cell';
                if (dayOfWeek === 0) cell.classList.add('is-sunday');

                // Cek apakah tanggal sudah lewat (Aturan min date)
                const isPast = dateStr < todayStr;
                if (isPast) cell.classList.add('disabled');

                // Cek apakah "Hari ini"
                const isToday = (dateStr === todayStr);
                if (isToday) cell.classList.add('is-today');

                // Cek seleksi Range
                const isStart = (dateStr === startDate);
                const isEnd = (dateStr === endDate);
                const inRange = (startDate && endDate && dateStr > startDate && dateStr < endDate);

                if (isStart) {
                    cell.classList.add('is-start');
                    if (endDate && endDate > startDate) cell.classList.add('has-range-end');
                }
                if (isEnd) {
                    cell.classList.add('is-end');
                    if (startDate && endDate > startDate) cell.classList.add('has-range-start');
                }
                if (inRange) {
                    cell.classList.add('in-range');
                }

                // Tombol Tanggal (Touch Target min 44x44px)
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'tv-day-btn';
                btn.disabled = isPast;

                let innerContent = '';
                if (isToday) {
                    innerContent += `<span class="tv-today-tag">Hari ini</span>`;
                }
                innerContent += `<span class="tv-day-num">${day}</span>`;
                btn.innerHTML = innerContent;

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleDateClick(dateStr);
                });

                cell.appendChild(btn);
                daysGrid.appendChild(cell);
            }

            card.appendChild(daysGrid);
            return card;
        }

        // ==========================================
        // 5. LOGIKA KLIK TANGGAL (RANGE MODE)
        // ==========================================
        function handleDateClick(clickedDate) {
            // Skenario 1: Belum ada tanggal mulai, atau sudah memilih keduanya (mulai dari awal lagi)
            if (!startDate || (startDate && endDate)) {
                startDate = clickedDate;
                endDate = '';
                activeTarget = 'selesai';
                syncInputsAndEvents();
                renderCalendar();
            }
            // Skenario 2: Tanggal mulai sudah ada, menunggu tanggal selesai
            else if (startDate && !endDate) {
                // Jika user klik tanggal yang lebih awal dari startDate, jadikan itu startDate baru
                if (clickedDate < startDate) {
                    startDate = clickedDate;
                    endDate = '';
                    activeTarget = 'selesai';
                } else {
                    // Berhasil memilih rentang!
                    endDate = clickedDate;
                    activeTarget = 'selesai';
                    syncInputsAndEvents();
                    renderCalendar();

                    // Tutup popover otomatis setelah selesai memilih rentang (jeda 300ms agar animasi kelihatan)
                    setTimeout(() => {
                        closePopover();
                    }, 300);
                    return;
                }
                syncInputsAndEvents();
                renderCalendar();
            }
        }

        // ==========================================
        // 6. ATURAN #1, #2, #3: SINKRONISASI KE INPUT ASLI
        // ==========================================
        function syncInputsAndEvents() {
            // Update teks display di trigger
            const displayMulaiText = triggerMulai.querySelector('.tv-date-text');
            const displayMulaiWrap = triggerMulai.querySelector('.tv-date-display');
            if (startDate) {
                displayMulaiText.textContent = formatDisplayDate(startDate);
                displayMulaiWrap.classList.remove('empty');
            } else {
                displayMulaiText.textContent = 'Pilih Tanggal';
                displayMulaiWrap.classList.add('empty');
            }

            const displaySelesaiText = triggerSelesai.querySelector('.tv-date-text');
            const displaySelesaiWrap = triggerSelesai.querySelector('.tv-date-display');
            if (endDate) {
                displaySelesaiText.textContent = formatDisplayDate(endDate);
                displaySelesaiWrap.classList.remove('empty');
            } else {
                displaySelesaiText.textContent = 'Pilih Tanggal';
                displaySelesaiWrap.classList.add('empty');
            }

            // NILAI DIKIRIM KE INPUT ASLI TETAP DALAM FORMAT "YYYY-MM-DD"
            if (startInput.value !== startDate) {
                startInput.value = startDate;
                startInput.dispatchEvent(new Event('input', { bubbles: true }));
                startInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            if (endInput.value !== endDate) {
                endInput.value = endDate;
                endInput.dispatchEvent(new Event('input', { bubbles: true }));
                endInput.dispatchEvent(new Event('change', { bubbles: true }));
            }

            updateGuideAndBadge();
        }

        function updateGuideAndBadge() {
            const guide = document.getElementById('tvPickerGuide');
            const badge = document.getElementById('tvDurationBadge');

            if (!guide || !badge) return;

            if (!startDate) {
                guide.textContent = 'Tanggal Mulai Rental';
                badge.textContent = 'Rentang belum dipilih';
            } else if (startDate && !endDate) {
                guide.textContent = 'Tanggal Selesai Rental';
                badge.textContent = `Mulai: ${formatDisplayDate(startDate)}`;
            } else if (startDate && endDate) {
                guide.textContent = 'Rentang Terpilih';
                const d1 = new Date(startDate);
                const d2 = new Date(endDate);
                const diffDays = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) || 1;
                badge.textContent = `Durasi: ${diffDays} Hari (${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)})`;
            }
        }

        // ==========================================
        // 7. BUKA & TUTUP POPOVER
        // ==========================================
        function openPopover(target = 'mulai') {
            activeTarget = target;
            if (target === 'selesai' && startDate) {
                // Jika klik tanggal selesai dan sudah ada tanggal mulai
                viewDate = new Date(startDate);
            } else if (startDate) {
                viewDate = new Date(startDate);
            } else {
                viewDate = new Date();
            }
            viewDate.setDate(1);

            renderCalendar();
            popover.classList.add('active');
            isOpen = true;
        }

        function closePopover() {
            popover.classList.remove('active');
            isOpen = false;
        }

        // Event Trigger Klik
        triggerMulai.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen && activeTarget === 'mulai') {
                closePopover();
            } else {
                openPopover('mulai');
            }
        });

        triggerSelesai.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isOpen && activeTarget === 'selesai') {
                closePopover();
            } else {
                openPopover('selesai');
            }
        });

        // Buka popover saat input asli difokuskan oleh skrip (misal: validasi filterMobil)
        startInput.addEventListener('focus', () => openPopover('mulai'));
        endInput.addEventListener('focus', () => openPopover('selesai'));

        // Navigasi Bulan (Event Delegation)
        popover.addEventListener('click', (e) => {
            e.stopPropagation(); // Mencegah trigger close saat klik di dalam popover

            const prevBtn = e.target.closest('#tvPrevMonth');
            const nextBtn = e.target.closest('#tvNextMonth');
            const closeBtn = e.target.closest('#tvCloseBtn') || e.target.closest('#tvBtnDone');

            if (prevBtn) {
                viewDate.setMonth(viewDate.getMonth() - 1);
                renderCalendar();
            } else if (nextBtn) {
                viewDate.setMonth(viewDate.getMonth() + 1);
                renderCalendar();
            } else if (closeBtn) {
                closePopover();
            }
        });

        // Tutup saat klik di luar popover
        document.addEventListener('click', (e) => {
            if (isOpen && !popover.contains(e.target) && !triggerMulai.contains(e.target) && !triggerSelesai.contains(e.target)) {
                closePopover();
            }
        });

        // Tutup saat tombol ESC ditekan
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                closePopover();
            }
        });

        // ==========================================
        // 8. HELPER FUNCTIONS
        // ==========================================
        function formatDateISO(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }

        function formatDisplayDate(dateStr) {
            if (!dateStr) return '';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            const d = new Date(parts[0], parts[1] - 1, parts[2]);
            const dayName = DAY_NAMES_SHORT[d.getDay()];
            const dayNum = d.getDate();
            const monthName = MONTH_NAMES[d.getMonth()].substr(0, 3);
            const year = d.getFullYear();
            return `${dayName}, ${dayNum} ${monthName} ${year}`;
        }

        // Initial sync jika input asli sudah punya value dari awal
        syncInputsAndEvents();
    });
})();
