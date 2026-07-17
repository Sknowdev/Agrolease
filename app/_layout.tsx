import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Root layout for the AgroLease mobile app.
 *
 * Task 1 scope only: this wires up Expo Router's default stack navigator
 * with no auth flow, no tab bar, no business logic. Auth, dashboards, and
 * gate logging are Task 2 onward - see task_folder/Task-01-Scaffolding-Database.md.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'AgroLease' }} />
      </Stack>
    </>
  );
}
