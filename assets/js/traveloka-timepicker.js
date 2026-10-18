/**
 * ==========================================================================
 * TRAVELOKA STYLE TWO-COLUMN TIME PICKER COMPONENT
 * Sesuai ATURAN KETAT:
 * - Tidak mengubah id/name/alur data sistem asli (#jam-mulai, #jam-selesai).
 * - Format input asli tetap berformat 24 jam "HH:mm" (misal: "09:00", "13:30").
 * - Format tampilan di field menggunakan format titik "09.00", "13.30".
 * - Dua kolom: Jam (angka 0-23 tanpa nol di depan) & Menit (0 dan 30).
 * - Titik biru (#0194F3) di kiri item terpilih, hover & active bg #F1F3F3.
 * - Tombol teks "Selesai" di kanan bawah.
 * - Pemilihan jam atau menit langsung memperbarui nilai & memicu event input/change.
 * - Auto-scroll ke jam terpilih saat popover dibuka.
 * - Feature flag USE_NEW_TIMEPICKER = true untuk kemudahan rollback sewaktu-waktu.
 * ==========================================================================
 */

// 1. FEATURE FLAG (Ubah ke false jika ingin kembali 100% ke tampilan lama)
const USE_NEW_TIMEPICKER = true;
window.USE_NEW_TIMEPICKER = USE_NEW_TIMEPICKER;

(function () {
    if (!USE_NEW_TIMEPICKER) return;

    document.addEventListener('DOMContentLoaded', () => {
        const jamMulaiInput = document.getElementById('jam-mulai');
        const jamSelesaiInput = document.getElementById('jam-selesai');

        if (!jamMulaiInput && !jamSelesaiInput) return;

        // Helper: Format tanggal ISO YYYY-MM-DD
        function getTodayISO() {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // Helper: Parse string "HH:mm" -> { hours: number, minutes: number }
        function parseTimeString(timeStr) {
            let h = 9;
            let m = 0;
            if (timeStr && timeStr.includes(':')) {
                const parts = timeStr.split(':');
                h = parseInt(parts[0], 10) || 0;
                m = parseInt(parts[1], 10) || 0;
            }
            return {
                hours: Math.min(23, Math.max(0, h)),
                minutes: m >= 30 ? 30 : 0
            };
        }

        // Helper: Format angka jam/menit menjadi string tampilan "09.00"
        function formatDisplay(h, m) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            return `${hh}.${mm}`;
        }

        // Helper: Format angka jam/menit menjadi value input DOM "09:00"
        function formatValue(h, m) {
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            return `${hh}:${mm}`;
        }

        let currentActivePopover = null;
        let currentActiveTrigger = null;

        function closeAllTimePopovers() {
            document.querySelectorAll('.tv-timepicker-popover').forEach(pop => {
                pop.classList.remove('active');
            });
            document.querySelectorAll('.tv-time-trigger-wrap').forEach(trg => {
                trg.classList.remove('active');
                trg.setAttribute('aria-expanded', 'false');
            });
            currentActivePopover = null;
            currentActiveTrigger = null;
        }

        // Inisialisasi time picker pada input elemen
        function initTwoColumnTimePicker(inputEl, labelTitle, targetType) {
            if (!inputEl) return;

            // Default value jika belum ada
            if (!inputEl.value) {
                inputEl.value = '09:00';
            }

            let { hours: curHours, minutes: curMinutes } = parseTimeString(inputEl.value);

            // Sembunyikan input asli secara visual tapi tetap di DOM
            inputEl.classList.add('tv-hidden-accessible');

            // 1. Buat elemen trigger tampilan
            const triggerWrap = document.createElement('div');
            triggerWrap.className = 'tv-time-trigger-wrap';
            triggerWrap.setAttribute('tabindex', '0');
            triggerWrap.setAttribute('role', 'button');
            triggerWrap.setAttribute('aria-haspopup', 'dialog');
            triggerWrap.setAttribute('aria-expanded', 'false');
            triggerWrap.setAttribute('aria-label', `Pilih ${labelTitle}`);

            const displayEl = document.createElement('div');
            displayEl.className = 'tv-time-display';
            displayEl.innerHTML = `
                <i class="ri-time-line"></i>
                <span class="tv-time-text">${formatDisplay(curHours, curMinutes)}</span>
            `;
            triggerWrap.appendChild(displayEl);

            inputEl.parentNode.insertBefore(triggerWrap, inputEl);

            // 2. Buat popover dua kolom
            const popover = document.createElement('div');
            popover.className = 'tv-timepicker-popover';
            popover.setAttribute('role', 'dialog');
            popover.setAttribute('aria-label', `Pilihan ${labelTitle}`);

            popover.innerHTML = `
                <div class="tv-time-columns-wrap">
                    <!-- Kolom Jam -->
                    <div class="tv-time-col">
                        <div class="tv-time-col-title">Jam</div>
                        <div class="tv-time-col-box tv-col-hours" role="listbox" aria-label="Pilih Jam"></div>
                    </div>
                    <!-- Kolom Menit -->
                    <div class="tv-time-col">
                        <div class="tv-time-col-title">Menit</div>
                        <div class="tv-time-col-box tv-col-minutes" role="listbox" aria-label="Pilih Menit"></div>
                    </div>
                </div>
                <div class="tv-timepicker-footer">
                    <button type="button" class="tv-time-btn-done">Selesai</button>
                </div>
            `;

            const hoursBox = popover.querySelector('.tv-col-hours');
            const minutesBox = popover.querySelector('.tv-col-minutes');
            const doneBtn = popover.querySelector('.tv-time-btn-done');

            inputEl.parentNode.appendChild(popover);

            // Render isi kolom Jam dan Menit
            function renderColumns() {
                const parsed = parseTimeString(inputEl.value);
                curHours = parsed.hours;
                curMinutes = parsed.minutes;

                // Cek batasan minimum hari ini
                const tglMulaiInput = document.getElementById('tgl-mulai');
                const tglSelesaiInput = document.getElementById('tgl-selesai');
                const todayISO = getTodayISO();

                const now = new Date();
                const currentHourNow = now.getHours();
                const currentMinuteNow = now.getMinutes();

                let isStartDateToday = false;
                if (tglMulaiInput && tglMulaiInput.value === todayISO) {
                    isStartDateToday = true;
                }

                // 1. Render Jam (0 sampai 23, tanpa nol di depan)
                hoursBox.innerHTML = '';
                for (let h = 0; h < 24; h++) {
                    let isHourDisabled = false;

                    // Aturan batas jam mulai pada hari ini
                    if (targetType === 'mulai' && isStartDateToday) {
                        if (h < currentHourNow) {
                            isHourDisabled = true;
                        }
                    }

                    // Aturan batas jam selesai jika tanggal sama
                    if (targetType === 'selesai' && tglMulaiInput && tglSelesaiInput) {
                        if (tglMulaiInput.value && tglMulaiInput.value === tglSelesaiInput.value) {
                            const jamMulaiParsed = parseTimeString(jamMulaiInput ? jamMulaiInput.value : '09:00');
                            if (h < jamMulaiParsed.hours) {
                                isHourDisabled = true;
                            }
                        }
                    }

                    const isSelected = h === curHours;
                    const item = document.createElement('button');
                    item.type = 'button';
                    item.className = `tv-time-col-item ${isSelected ? 'selected' : ''} ${isHourDisabled ? 'disabled' : ''}`;
                    item.setAttribute('role', 'option');
                    item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                    item.dataset.hour = String(h);
                    item.textContent = String(h); // Tampil tanpa nol di depan (0, 1, 2, ... 23)

                    if (isHourDisabled) {
                        item.disabled = true;
                    }

                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isHourDisabled) return;
                        updateTime(h, curMinutes);
                        renderColumns();
                    });

                    hoursBox.appendChild(item);
                }

                // 2. Render Menit (pilihan 0 dan 30)
                minutesBox.innerHTML = '';
                const minuteOptions = [0, 30];
                minuteOptions.forEach(m => {
                    let isMinuteDisabled = false;

                    // Jika hari ini dan jam yang dipilih adalah jam sekarang, disable menit yang sudah lewat
                    if (targetType === 'mulai' && isStartDateToday && curHours === currentHourNow) {
                        if (m <= currentMinuteNow) {
                            isMinuteDisabled = true;
                        }
                    }

                    // Jika jam selesai di hari dan jam yang sama dengan jam mulai
                    if (targetType === 'selesai' && tglMulaiInput && tglSelesaiInput) {
                        if (tglMulaiInput.value && tglMulaiInput.value === tglSelesaiInput.value) {
                            const jamMulaiParsed = parseTimeString(jamMulaiInput ? jamMulaiInput.value : '09:00');
                            if (curHours === jamMulaiParsed.hours && m < jamMulaiParsed.minutes) {
                                isMinuteDisabled = true;
                            }
                        }
                    }

                    const isSelected = m === curMinutes;
                    const item = document.createElement('button');
                    item.type = 'button';
                    item.className = `tv-time-col-item ${isSelected ? 'selected' : ''} ${isMinuteDisabled ? 'disabled' : ''}`;
                    item.setAttribute('role', 'option');
                    item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
                    item.dataset.minute = String(m);
                    item.textContent = String(m); // Tampil 0 dan 30

                    if (isMinuteDisabled) {
                        item.disabled = true;
                    }

                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (isMinuteDisabled) return;
                        updateTime(curHours, m);
                        renderColumns();
                    });

                    minutesBox.appendChild(item);
                });
            }

            // Fungsi update waktu: langsung update tampilan dan nilai input asli
            function updateTime(h, m) {
                curHours = h;
                curMinutes = m;

                const disp = formatDisplay(h, m);
                const val = formatValue(h, m);

                // Update teks di field trigger ("09.00")
                displayEl.querySelector('.tv-time-text').textContent = disp;

                // Update nilai input asli di DOM ("09:00")
                inputEl.value = val;

                // Picu event input dan change agar kode sistem/booking tetap berjalan normal
                inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                inputEl.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // Buka Popover
            function openPopover() {
                closeAllTimePopovers();

                // Tutup datepicker jika sedang terbuka
                const datepickerPopover = document.getElementById('tvDatepickerPopover');
                if (datepickerPopover) {
                    datepickerPopover.classList.remove('active');
                    datepickerPopover.style.display = 'none';
                }

                renderColumns();

                popover.classList.add('active');
                triggerWrap.classList.add('active');
                triggerWrap.setAttribute('aria-expanded', 'true');
                currentActivePopover = popover;
                currentActiveTrigger = triggerWrap;

                // Penyesuaian agar popover tidak overflow keluar layar kanan
                popover.style.left = '0';
                popover.style.right = 'auto';
                const rect = popover.getBoundingClientRect();
                if (rect.right > window.innerWidth - 12) {
                    popover.style.left = 'auto';
                    popover.style.right = '0';
                }

                // Auto-scroll pada kolom Jam ke jam yang sedang terpilih
                requestAnimationFrame(() => {
                    const selectedHourItem = hoursBox.querySelector('.tv-time-col-item.selected');
                    if (selectedHourItem) {
                        selectedHourItem.scrollIntoView({ block: 'nearest' });
                    }
                });
            }

            // Tutup Popover
            function closePopover() {
                popover.classList.remove('active');
                triggerWrap.classList.remove('active');
                triggerWrap.setAttribute('aria-expanded', 'false');
                if (currentActivePopover === popover) {
                    currentActivePopover = null;
                    currentActiveTrigger = null;
                }
            }

            // Event klik pada trigger
            triggerWrap.addEventListener('click', (e) => {
                e.stopPropagation();
                if (popover.classList.contains('active')) {
                    closePopover();
                } else {
                    openPopover();
                }
            });

            // Tombol "Selesai" menutup popover
            doneBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closePopover();
                triggerWrap.focus();
            });

            // Navigasi keyboard pada trigger
            triggerWrap.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!popover.classList.contains('active')) {
                        openPopover();
                    }
                    const selectedHour = hoursBox.querySelector('.tv-time-col-item.selected:not(.disabled)');
                    if (selectedHour) selectedHour.focus();
                } else if (e.key === 'Escape') {
                    closePopover();
                }
            });

            // Navigasi keyboard di dalam popover
            popover.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closePopover();
                    triggerWrap.focus();
                    return;
                }

                // Keyboard panah atas / bawah pada list item
                if (e.target.classList.contains('tv-time-col-item')) {
                    const currentBox = e.target.closest('.tv-time-col-box');
                    if (!currentBox) return;

                    const activeItems = Array.from(currentBox.querySelectorAll('.tv-time-col-item:not(.disabled)'));
                    const curIdx = activeItems.indexOf(e.target);

                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextIdx = (curIdx + 1) % activeItems.length;
                        activeItems[nextIdx].focus();
                        activeItems[nextIdx].scrollIntoView({ block: 'nearest' });
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevIdx = (curIdx - 1 + activeItems.length) % activeItems.length;
                        activeItems[prevIdx].focus();
                        activeItems[prevIdx].scrollIntoView({ block: 'nearest' });
                    } else if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.target.click();
                    }
                }
            });

            // Sinkronisasi programmatic change pada input asli
            inputEl.addEventListener('change', () => {
                const p = parseTimeString(inputEl.value);
                displayEl.querySelector('.tv-time-text').textContent = formatDisplay(p.hours, p.minutes);
            });

            inputEl.addEventListener('focus', () => {
                openPopover();
            });
        }

        initTwoColumnTimePicker(jamMulaiInput, 'Waktu Mulai', 'mulai');
        initTwoColumnTimePicker(jamSelesaiInput, 'Waktu Selesai', 'selesai');

        // Klik di luar menutup popover
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tv-time-trigger-wrap') && !e.target.closest('.tv-timepicker-popover')) {
                closeAllTimePopovers();
            }
        });

        // Esc global menutup popover
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && currentActivePopover) {
                closeAllTimePopovers();
            }
        });
    });
})();
