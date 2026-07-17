/**
 * Design tokens for the AgroLease mobile app.
 *
 * Task 1 left this as an intentionally minimal placeholder (single
 * flat white/black scheme). Task 2 is the first task building real
 * screens, so real brand tokens land here now - matched to
 * app_refrence.png's visual language (dark green header/auth
 * background, lighter green accent buttons, white rounded content
 * cards, leaf logo) and to what the brief's screens actually need.
 *
 * Per the Constitution, no logo/icon work happens here - this file
 * only defines colors/spacing, it doesn't touch logo.png or app.json.
 */
export const Colors = {
  // Deep green - auth screens' background, main app header
  primaryDark: '#0F3D2E',
  primaryDarker: '#0A2A20',
  // Lighter, brighter green - CTAs, active states, accents
  accent: '#4CAF6D',
  accentDark: '#3A9457',
  // Neutral surface tones
  background: '#ffffff',
  surface: '#F5F7F5',
  card: '#ffffff',
  border: '#E2E8E4',
  // Text
  text: '#111111',
  textOnDark: '#ffffff',
  muted: '#6B7A72',
  mutedOnDark: 'rgba(255,255,255,0.72)',
  // Status
  danger: '#D9534F',
  warning: '#E0A93A',
  success: '#3A9457',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};
