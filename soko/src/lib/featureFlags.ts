// Central place for feature flags. Flip a flag here when a feature is
// ready to go live — never scatter "if (true)" toggles around the app.

// The paid promotion system (Boost/Featured listings) is built but not
// live yet: no payment flow exists for sellers to actually buy a spot.
// Flip this to true once payments are wired up.
export const FEATURED_MARKETPLACE_ENABLED = false;