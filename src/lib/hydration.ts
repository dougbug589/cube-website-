// Set once the app has hydrated in the browser. Components can use it to tell
// a full page load (server HTML must match, so render everything) from an
// in-app navigation (free to render in stages for a faster first frame).
let hydrated = false;
export const markHydrated = () => {
  hydrated = true;
};
export const isHydrated = () => hydrated;
