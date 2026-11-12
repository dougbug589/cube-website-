// Shared by the root layout (server) and SplashScreen (client).
export const SPLASH_KEY = 'cube-splash-seen';

/**
 * Inlined at the top of <body>. Runs before first paint and decides whether
 * the splash should show, so a returning page never flashes it.
 * Adds `no-splash` (already seen this session, reduced motion, or admin) or
 * `splash-pending` (show it) to <html>.
 */
export const SPLASH_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem('${SPLASH_KEY}')||window.matchMedia('(prefers-reduced-motion: reduce)').matches||location.pathname.indexOf('/admin')===0){d.classList.add('no-splash');}else{d.classList.add('splash-pending');}}catch(e){document.documentElement.classList.add('no-splash');}})();`;
