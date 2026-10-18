/**
 * King's Rental Bumiayu - Switcher Controller
 * Connects the Language & Currency Switcher UI with i18n.js and currency.js
 */

(function () {
    'use strict';

    function initSwitcher() {
        const langDropdown = document.getElementById('langDropdown');
        const currDropdown = document.getElementById('currDropdown');
        const langTrigger = document.getElementById('langTrigger');
        const currTrigger = document.getElementById('currTrigger');
        const langMenu = document.getElementById('langMenu');
        const currMenu = document.getElementById('currMenu');

        // Close all dropdowns
        function closeAllDropdowns() {
            if (langDropdown) langDropdown.classList.remove('open');
            if (currDropdown) currDropdown.classList.remove('open');
        }

        // Toggle Language Dropdown
        if (langTrigger && langDropdown) {
            langTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = langDropdown.classList.contains('open');
                closeAllDropdowns();
                if (!isOpen) langDropdown.classList.add('open');
            });
        }

        // Toggle Currency Dropdown
        if (currTrigger && currDropdown) {
            currTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = currDropdown.classList.contains('open');
                closeAllDropdowns();
                if (!isOpen) currDropdown.classList.add('open');
            });
        }

        // Populate Language Options dynamically
        if (langMenu && window.i18n) {
            const languages = window.i18n.getSupportedLanguages();
            const currentLang = window.i18n.getLanguage();

            let langHtml = `
                <div class="switch-menu-header" data-i18n="switcher.langLabel">PILIH BAHASA</div>
            `;

            Object.keys(languages).forEach(code => {
                const item = languages[code];
                const isActive = code === currentLang;
                langHtml += `
                    <button type="button" class="switch-option language-option ${isActive ? 'active' : ''}" data-lang="${code}">
                        <div class="switch-option-left">
                            <span class="opt-flag">${item.flag}</span>
                            <div class="opt-text">
                                <span class="opt-name">${item.name}</span>
                                <span class="opt-sub">${item.shortName}</span>
                            </div>
                        </div>
                        <i class="ri-check-line check-icon"></i>
                    </button>
                `;
            });

            langMenu.innerHTML = langHtml;

            // Add Click Events to language options
            langMenu.querySelectorAll('.language-option').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selectedLang = btn.getAttribute('data-lang');
                    if (window.i18n) {
                        window.i18n.setLanguage(selectedLang);
                    }
                    closeAllDropdowns();
                });
            });
        }

        // Populate Currency Options dynamically
        if (currMenu && window.CurrencyManager) {
            const currencies = window.CurrencyManager.getAllCurrencies();
            const currentCurr = window.CurrencyManager.getCurrency();

            let currHtml = `
                <div class="switch-menu-header" data-i18n="switcher.currLabel">PILIH MATA UANG</div>
            `;

            Object.keys(currencies).forEach(code => {
                const item = currencies[code];
                const isActive = code === currentCurr;
                currHtml += `
                    <button type="button" class="switch-option currency-option ${isActive ? 'active' : ''}" data-currency="${code}">
                        <div class="switch-option-left">
                            <span class="opt-symbol-badge">${item.symbol}</span>
                            <div class="opt-text">
                                <span class="opt-name">${item.code} - ${item.symbol}</span>
                                <span class="opt-sub">${item.name}</span>
                            </div>
                        </div>
                        <i class="ri-check-line check-icon"></i>
                    </button>
                `;
            });

            currMenu.innerHTML = currHtml;

            // Add Click Events to currency options
            currMenu.querySelectorAll('.currency-option').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selectedCurr = btn.getAttribute('data-currency');
                    if (window.CurrencyManager) {
                        window.CurrencyManager.setCurrency(selectedCurr);
                    }
                    closeAllDropdowns();
                });
            });
        }

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.switch-dropdown')) {
                closeAllDropdowns();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllDropdowns();
            }
        });

        // Connect Mobile Switcher Selects if present
        const mobileLangSelect = document.getElementById('mobileLangSelect');
        const mobileCurrSelect = document.getElementById('mobileCurrSelect');

        if (mobileLangSelect && window.i18n) {
            mobileLangSelect.value = window.i18n.getLanguage();
            mobileLangSelect.addEventListener('change', (e) => {
                window.i18n.setLanguage(e.target.value);
            });
            window.addEventListener('languageChanged', (e) => {
                mobileLangSelect.value = e.detail.lang;
            });
        }

        if (mobileCurrSelect && window.CurrencyManager) {
            mobileCurrSelect.value = window.CurrencyManager.getCurrency();
            mobileCurrSelect.addEventListener('change', (e) => {
                window.CurrencyManager.setCurrency(e.target.value);
            });
            window.addEventListener('currencyChanged', (e) => {
                mobileCurrSelect.value = e.detail.currency;
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSwitcher);
    } else {
        initSwitcher();
    }
})();
