import { Image, StyleSheet, Text, View } from 'react-native';

/**
 * Default landing screen from Task 1 scaffolding.
 *
 * Deliberately minimal - no auth, no dashboard, no business logic.
 * Confirms the app boots and the real root /logo.png (not
 * web/public/logo.png) renders correctly. Task 2 replaces this with the
 * real auth/profile flow.
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <Image source={require('../logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>AgroLease</Text>
      <Text style={styles.subtitle}>Project scaffolding - Task 1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});
