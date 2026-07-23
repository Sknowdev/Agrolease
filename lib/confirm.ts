import { Alert, Platform } from 'react-native';

/**
 * Real bug fix (found live): `react-native-web`'s `Alert.alert` is a
 * complete no-op (`static alert() {}` - see
 * node_modules/react-native-web/src/exports/Alert/index.js). Every
 * confirmation dialog built with `Alert.alert(title, message, [{
 * onPress: ... }, { onPress: destructiveAction }])` silently did
 * nothing on web - not just "no visible dialog," the destructive
 * action's `onPress` callback itself never fired at all, since
 * nothing ever calls it. This broke Delete Conduit (My Conduits' 3-dot
 * menu), the Farm Boundary "Skip for now" confirmation, and Delete
 * Account (AppShell's hamburger menu) identically - all three were
 * reported as "the button doesn't do anything" for the same root
 * cause, on web specifically (this is a real Expo Router web
 * limitation, not a device/simulator-specific bug - native iOS/Android
 * builds use RN's real `Alert.alert`, which is unaffected and works
 * correctly as-is).
 *
 * `confirmAction` is a drop-in replacement for the destructive/two-
 * button confirm pattern that actually works on both platforms: native
 * keeps using the real `Alert.alert` (better UX, matches OS
 * conventions), web falls back to the browser's own `window.confirm`
 * (a real, working native browser dialog - not styled to match the
 * app, but functionally correct, which is what matters here).
 */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  options?: { confirmLabel?: string; cancelLabel?: string; destructive?: boolean }
) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    const confirmed = typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`);
    if (confirmed) onConfirm();
    return;
  }

  Alert.alert(title, message, [
    { text: options?.cancelLabel ?? 'Cancel', style: 'cancel' },
    {
      text: options?.confirmLabel ?? 'OK',
      style: options?.destructive === false ? 'default' : 'destructive',
      onPress: onConfirm,
    },
  ]);
}

/**
 * Same root cause as `confirmAction` above, for the simpler single-
 * button "show a message" case (error messages, success
 * confirmations like "Copied," etc.) - `Alert.alert(title, message)`
 * with no button array is ALSO a complete no-op on web, not just the
 * multi-button confirm case. This was the actual root cause of "Login
 * just spins and doesn't tell the user what's wrong" - `login.tsx`
 * DID call `Alert.alert('Sign in failed', error.message)` on a wrong
 * password, but on web that call did genuinely nothing, silently,
 * with no error and no fallback - not a missing error-handling code
 * path, a real platform gap in how errors were ever surfaced. Every
 * `Alert.alert` call across the app (error messages, "Copied" success
 * toasts, etc.) has the same issue on web and should use this instead.
 */
export function notify(title: string, message?: string) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
