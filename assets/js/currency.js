/**
 * King's Rental Bumiayu - Multi-Currency Engine
 * Handles exchange rates, Intl.NumberFormat formatting, conversion, and DOM updates.
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'kings_currency';
    const CACHE_RATES_KEY = 'kings_exchange_rates';
    const CACHE_TIME_KEY = 'kings_rates_timestamp';
    const CACHE_EXPIRY_MS = 6 * 60 * 60 * 1000; // 6 hours

    // Currencies configuration
    const CURRENCIES = {
        IDR: {
            code: 'IDR',
            symbol: 'Rp',
            name: 'Indonesian Rupiah',
            locale: 'id-ID',
            fractionDigits: 0,
            flag: '🇮🇩'
        },
        USD: {
            code: 'USD',
            symbol: '$',
            name: 'US Dollar',
            locale: 'en-US',
            fractionDigits: 2,
            flag: '🇺🇸'
        },
        EUR: {
            code: 'EUR',
            symbol: '€',
            name: 'Euro',
            locale: 'de-DE',
            fractionDigits: 2,
            flag: '🇪🇺'
        },
        SGD: {
            code: 'SGD',
            symbol: 'S$',
            name: 'Singapore Dollar',
            locale: 'en-SG',
            fractionDigits: 2,
            flag: '🇸🇬'
        },
        JPY: {
            code: 'JPY',
            symbol: '¥',
            name: 'Japanese Yen',
            locale: 'ja-JP',
            fractionDigits: 0,
            flag: '🇯🇵'
        },
        MYR: {
            code: 'MYR',
            symbol: 'RM',
            name: 'Malaysian Ringgit',
            locale: 'ms-MY',
            fractionDigits: 2,
            flag: '🇲🇾'
        },
        GBP: {
            code: 'GBP',
            symbol: '£',
            name: 'British Pound',
            locale: 'en-GB',
            fractionDigits: 2,
            flag: '🇬🇧'
        },
        AUD: {
            code: 'AUD',
            symbol: 'A$',
            name: 'Australian Dollar',
            locale: 'en-AU',
            fractionDigits: 2,
            flag: '🇦🇺'
        }
    };

    // Fallback static exchange rates (Base: 1 IDR)
    // Updated with reliable benchmark rates
    const FALLBACK_RATES = {
        IDR: 1,
        USD: 0.0000625,   // 1 USD ~ 16,000 IDR
        EUR: 0.0000575,   // 1 EUR ~ 17,400 IDR
        SGD: 0.0000833,   // 1 SGD ~ 12,000 IDR
        JPY: 0.00943,     // 1 JPY ~ 106 IDR
        MYR: 0.000285,    // 1 MYR ~ 3,500 IDR
        GBP: 0.0000488,   // 1 GBP ~ 20,500 IDR
        AUD: 0.0000952    // 1 AUD ~ 10,500 IDR
    };

    let activeRates = { ...FALLBACK_RATES };
    let currentCurrency = localStorage.getItem(STORAGE_KEY) || 'IDR';

    // Ensure valid currency
    if (!CURRENCIES[currentCurrency]) {
        currentCurrency = 'IDR';
    }

    /**
     * Try to fetch fresh exchange rates asynchronously from a public reliable API.
     * Falls back silently to cached or static rates if offline or blocked.
     */
    async function initExchangeRates() {
        const cachedRates = localStorage.getItem(CACHE_RATES_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedRates && cachedTime && (now - parseInt(cachedTime, 10) < CACHE_EXPIRY_MS)) {
            try {
                const parsed = JSON.parse(cachedRates);
                activeRates = { ...FALLBACK_RATES, ...parsed };
                return;
            } catch (e) {
                // Ignore parse errors, re-fetch
            }
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);

            // Open-access free exchange rates API with base IDR
            const res = await fetch('https://open.er-api.com/v6/latest/IDR', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data && data.rates) {
                    const fetchedRates = {};
                    Object.keys(CURRENCIES).forEach(code => {
                        if (data.rates[code]) {
                            fetchedRates[code] = data.rates[code];
                        }
                    });
                    activeRates = { ...FALLBACK_RATES, ...fetchedRates };
                    localStorage.setItem(CACHE_RATES_KEY, JSON.stringify(fetchedRates));
                    localStorage.setItem(CACHE_TIME_KEY, now.toString());
                    // Re-render prices once new rates arrive
                    updateAllPrices();
                }
            }
        } catch (err) {
            // Offline / timeout -> fallback to static rates gracefully
            activeRates = { ...FALLBACK_RATES };
        }
    }

    /**
     * Normalize IDR price: handles both 350 and 350000 formats.
     * In this project, car prices are commonly stored as 350 (meaning 350,000 IDR).
     */
    function normalizeIdr(price) {
        const num = parseFloat(price) || 0;
        return num < 10000 ? num * 1000 : num;
    }

    /**
     * Convert an IDR amount into a target currency.
     */
    function convert(idrAmount, targetCurrency = currentCurrency) {
        const normalized = normalizeIdr(idrAmount);
        const rate = activeRates[targetCurrency] || FALLBACK_RATES[targetCurrency] || 1;
        return normalized * rate;
    }

    /**
     * Format any number into the target currency using Intl.NumberFormat.
     */
    function format(amount, currencyCode = currentCurrency) {
        const conf = CURRENCIES[currencyCode] || CURRENCIES.IDR;
        const locale = conf.locale || 'id-ID';

        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: conf.code,
                minimumFractionDigits: conf.fractionDigits,
                maximumFractionDigits: conf.fractionDigits
            }).format(amount);
        } catch (e) {
            // Fallback manual formatting if browser Intl lacks the locale
            const rounded = conf.fractionDigits > 0 
                ? amount.toFixed(conf.fractionDigits) 
                : Math.round(amount).toLocaleString('id-ID');
            return `${conf.symbol} ${rounded}`;
        }
    }

    /**
     * Convenience function: Converts IDR amount to target currency and formats it.
     */
    function convertAndFormat(idrAmount, targetCurrency = currentCurrency) {
        const converted = convert(idrAmount, targetCurrency);
        return format(converted, targetCurrency);
    }

    /**
     * Set active currency, save to localStorage, update DOM elements and trigger event.
     */
    function setCurrency(currencyCode) {
        if (!CURRENCIES[currencyCode]) {
            console.warn(`[CurrencyManager] Unsupported currency: ${currencyCode}`);
            return;
        }

        currentCurrency = currencyCode;
        localStorage.setItem(STORAGE_KEY, currencyCode);

        // Update all price tags with data-price-idr attribute
        updateAllPrices();

        // Update switcher buttons UI
        updateSwitcherUI();

        // Dispatch custom event for dynamic components (e.g. quickview modal, total price)
        window.dispatchEvent(new CustomEvent('currencyChanged', {
            detail: {
                currency: currencyCode,
                info: CURRENCIES[currencyCode],
                format: (amt) => convertAndFormat(amt, currencyCode)
            }
        }));
    }

    /**
     * Scan DOM for elements with data-price-idr or data-price-raw and update their display
     */
    function updateAllPrices() {
        // Elements with specific data-price-idr
        document.querySelectorAll('[data-price-idr]').forEach(el => {
            const rawIdr = el.getAttribute('data-price-idr');
            if (rawIdr !== null && rawIdr !== '') {
                const suffix = el.getAttribute('data-price-suffix') || '';
                const prefix = el.getAttribute('data-price-prefix') || '';
                el.innerText = `${prefix}${convertAndFormat(rawIdr)}${suffix}`;
            }
        });

        // Dynamic elements like modal total if exists
        const modalTotal = document.getElementById('modalTotalPrice');
        if (modalTotal && modalTotal.hasAttribute('data-current-total-idr')) {
            const totalIdr = modalTotal.getAttribute('data-current-total-idr');
            modalTotal.innerText = convertAndFormat(totalIdr);
        }

        // Quickview price if open
        const qvPrice = document.getElementById('qvPrice');
        if (qvPrice && qvPrice.hasAttribute('data-current-price-idr')) {
            const idr = qvPrice.getAttribute('data-current-price-idr');
            qvPrice.innerText = convertAndFormat(idr);
        }
    }

    /**
     * Update current currency label in switcher UI elements
     */
    function updateSwitcherUI() {
        const currentConf = CURRENCIES[currentCurrency];
        
        // Update any currency badge/text display in navbar
        document.querySelectorAll('.curr-current-flag').forEach(el => {
            el.innerText = currentConf.flag;
        });
        document.querySelectorAll('.curr-current-code').forEach(el => {
            el.innerText = currentConf.code;
        });
        document.querySelectorAll('.curr-current-symbol').forEach(el => {
            el.innerText = currentConf.symbol;
        });

        // Update active checkmarks in dropdown
        document.querySelectorAll('.currency-option').forEach(btn => {
            const code = btn.getAttribute('data-currency');
            if (code === currentCurrency) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Public API
    window.CurrencyManager = {
        getCurrency: () => currentCurrency,
        getCurrencyInfo: (code = currentCurrency) => CURRENCIES[code] || CURRENCIES.IDR,
        getAllCurrencies: () => CURRENCIES,
        setCurrency,
        convert,
        format,
        convertAndFormat,
        normalizeIdr,
        updateAllPrices,
        updateSwitcherUI
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initExchangeRates();
            updateSwitcherUI();
            updateAllPrices();
        });
    } else {
        initExchangeRates();
        updateSwitcherUI();
        updateAllPrices();
    }

})(window);
