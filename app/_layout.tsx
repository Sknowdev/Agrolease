import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '../hooks/useAuth';

/**
 * Root layout for the AgroLease mobile app.
 *
 * Task 2 scope: wraps the whole app in AuthProvider (session state used
 * by Splash's routing and every screen's authenticated API calls), and
 * handles the agrolease://link/{code} deep link - both the Security
 * Access flow's explicit requirement ("Deep link agrolease://link/{code}
 * lands here directly, code pre-filled") and Google/email-recovery
 * OAuth redirects landing back on agrolease:// (see login.tsx/
 * signup.tsx's redirectTo and forgot-password's email recovery flow).
 * Screen-level auth guarding (e.g. blocking /home without a session) is
 * intentionally NOT done here via a redirect-on-every-navigation guard -
 * Splash (app/index.tsx) is the single source of truth for "where does
 * a user land based on session state," matching the brief's own
 * wording ("Splash routes correctly...based on session state"). Adding
 * a second, competing guard here would risk fighting Splash's own
 * routing on every navigation.
 */
export default function RootLayout() {
  useEffect(() => {
    function handleDeepLink(url: string) {
      const { hostname, path, queryParams } = Linking.parse(url);
      // agrolease://link/{code} - Linking.parse reports this as
      // hostname="link", path="{code}" for a two-segment custom-scheme
      // URL with no leading slash ambiguity.
      if (hostname === 'link' && path) {
        router.push({ pathname: '/security/access', params: { code: path } });
        return;
      }
      // agrolease://conduit/{id} - Task 3, Step 7's Accept Invitation
      // deep link. Same parsing shape as the link-code deep link above:
      // hostname="conduit", path="{conduitId}". Lands on Accept
      // Invitation with the Conduit ID pre-filled/looked-up, same
      // pattern as Security Access's own code param.
      if (hostname === 'conduit' && path) {
        router.push({ pathname: '/conduit/accept', params: { conduitId: path } });
        return;
      }
      // Any other agrolease:// redirect (Google OAuth, email recovery
      // magic link) just needs the app foregrounded - Supabase's own
      // client picks up the session from the URL fragment automatically
      // once the app is active; nothing further to route here.
      void queryParams;
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const subscription = Linking.addEventListener('url', (event) => handleDeepLink(event.url));
    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="verification" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="home" />
        <Stack.Screen name="conduits" />
        <Stack.Screen name="conduit/side" />
        <Stack.Screen name="conduit/land" />
        <Stack.Screen name="conduit/boundary" />
        <Stack.Screen name="conduit/expiry" />
        <Stack.Screen name="conduit/generated" />
        <Stack.Screen name="conduit/accept" />
        <Stack.Screen name="conduit/edit-land" />
        <Stack.Screen name="conduit/edit" />
        <Stack.Screen name="conduit/[id]" />
        <Stack.Screen name="recent-activity" />
        <Stack.Screen name="profile/index" />
        <Stack.Screen name="profile/edit" />
        <Stack.Screen name="profile/password" />
        <Stack.Screen name="security/access" />
        <Stack.Screen name="security/details" />
        <Stack.Screen name="security/waiting" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-verification" />
        <Stack.Screen name="new-password" />
        <Stack.Screen name="coming-soon/messages" />
        <Stack.Screen name="coming-soon/browse-listings" />
        <Stack.Screen name="coming-soon/link-security" />
      </Stack>
    </AuthProvider>
  );
}
