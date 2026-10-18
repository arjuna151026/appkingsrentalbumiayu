/**
 * King's Rental Bumiayu - Internationalization (i18n) Engine
 * Manages multilingual UI, loads JSON translation files, updates DOM, and handles persistence.
 */

(function (window) {
    'use strict';

    const STORAGE_KEY = 'kings_lang';
    const DEFAULT_LANG = 'id';

    const SUPPORTED_LANGS = {
        id: { code: 'id', name: 'Bahasa Indonesia', shortName: 'ID', flag: '🇮🇩', dir: 'ltr' },
        en: { code: 'en', name: 'English', shortName: 'EN', flag: '🇬🇧', dir: 'ltr' },
        es: { code: 'es', name: 'Español', shortName: 'ES', flag: '🇪🇸', dir: 'ltr' },
        ja: { code: 'ja', name: '日本語', shortName: 'JA', flag: '🇯🇵', dir: 'ltr' },
        zh: { code: 'zh', name: '中文', shortName: 'ZH', flag: '🇨🇳', dir: 'ltr' }
    };

    const translationCache = {};
    let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

    if (!SUPPORTED_LANGS[currentLang]) {
        currentLang = DEFAULT_LANG;
    }

    /**
     * Fetch translation JSON file for a given language
     */
    async function loadTranslation(lang) {
        if (translationCache[lang]) {
            return translationCache[lang];
        }

        try {
            const response = await fetch(`assets/lang/${lang}.json?v=${Date.now()}`);
            if (!response.ok) {
                throw new Error(`Failed to load translation: ${lang} (HTTP ${response.status})`);
            }
            const data = await response.json();
            translationCache[lang] = data;
            return data;
        } catch (error) {
            console.warn(`[i18n] Error loading translation for "${lang}":`, error);
            // Fallback to Indonesian if other language fails
            if (lang !== DEFAULT_LANG && translationCache[DEFAULT_LANG]) {
                return translationCache[DEFAULT_LANG];
            }
            return null;
        }
    }

    /**
     * Resolve nested dot notation in object: "hero.title" -> obj.hero.title
     */
    function resolveKey(obj, path) {
        if (!obj || !path) return null;
        return path.split('.').reduce((prev, curr) => {
            return (prev && prev[curr] !== undefined) ? prev[curr] : null;
        }, obj);
    }

    /**
     * Translate a key with optional interpolation: t('nav.helloUser', { name: 'Budi' })
     */
    function t(key, params = {}) {
        const dict = translationCache[currentLang] || translationCache[DEFAULT_LANG];
        let val = resolveKey(dict, key);

        if (val === null || val === undefined) {
            // Try fallback dictionary
            val = resolveKey(translationCache[DEFAULT_LANG], key) || key;
        }

        if (typeof val === 'string' && params && typeof params === 'object') {
            Object.keys(params).forEach(param => {
                val = val.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
            });
        }

        return val;
    }

    /**
     * Apply translations to all matching DOM elements
     */
    function applyTranslations() {
        const dict = translationCache[currentLang];
        if (!dict) return;

        // Set HTML lang attribute
        document.documentElement.lang = currentLang;

        // Elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = t(key);
            if (translation !== null && translation !== undefined && translation !== key) {
                // If element has data-i18n-html="true", set innerHTML, else textContent
                if (el.getAttribute('data-i18n-html') === 'true') {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        // Placeholders: data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = t(key);
            if (translation && translation !== key) {
                el.placeholder = translation;
            }
        });

        // Titles: data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = t(key);
            if (translation && translation !== key) {
                el.title = translation;
            }
        });

        // Hero Typewriter Words: data-i18n-words
        const heroTypeEl = document.querySelector('.txt-type[data-i18n-words]');
        if (heroTypeEl) {
            const key = heroTypeEl.getAttribute('data-i18n-words');
            const wordsVal = t(key);
            if (wordsVal) {
                heroTypeEl.setAttribute('data-words', wordsVal);
                // Restart TypeWriter instance if available
                if (window.heroTypeWriterInstance) {
                    try {
                        const parsedWords = typeof wordsVal === 'string' ? JSON.parse(wordsVal) : wordsVal;
                        window.heroTypeWriterInstance.words = parsedWords;
                        window.heroTypeWriterInstance.txt = '';
                        window.heroTypeWriterInstance.wordIndex = 0;
                        window.heroTypeWriterInstance.isDeleting = false;
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }

        // Update Switcher UI
        updateSwitcherUI();
    }

    /**
     * Update dropdown UI to reflect current language
     */
    function updateSwitcherUI() {
        const langInfo = SUPPORTED_LANGS[currentLang] || SUPPORTED_LANGS[DEFAULT_LANG];

        // Active flag & code in switcher trigger button
        document.querySelectorAll('.lang-current-flag').forEach(el => {
            el.innerText = langInfo.flag;
        });
        document.querySelectorAll('.lang-current-code').forEach(el => {
            el.innerText = langInfo.shortName;
        });
        document.querySelectorAll('.lang-current-name').forEach(el => {
            el.innerText = langInfo.name;
        });

        // Active state in dropdown items
        document.querySelectorAll('.language-option').forEach(btn => {
            const code = btn.getAttribute('data-lang');
            if (code === currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Switch active language
     */
    async function setLanguage(lang) {
        if (!SUPPORTED_LANGS[lang]) {
            console.warn(`[i18n] Unsupported language: ${lang}`);
            return;
        }

        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);

        await loadTranslation(lang);
        applyTranslations();

        // Dispatch language change event for other scripts
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: {
                lang: lang,
                info: SUPPORTED_LANGS[lang],
                t: t
            }
        }));
    }

    /**
     * Initialize i18n
     */
    async function init() {
        // Preload default language first as fallback
        await loadTranslation(DEFAULT_LANG);
        if (currentLang !== DEFAULT_LANG) {
            await loadTranslation(currentLang);
        }
        applyTranslations();
    }

    // Public API
    window.i18n = {
        init,
        t,
        setLanguage,
        getLanguage: () => currentLang,
        getLanguageInfo: (lang = currentLang) => SUPPORTED_LANGS[lang] || SUPPORTED_LANGS[DEFAULT_LANG],
        getSupportedLanguages: () => SUPPORTED_LANGS,
        applyTranslations,
        updateSwitcherUI
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
