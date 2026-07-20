import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '../../constants/colors';
import { apiDelete } from '../../lib/apiClient';
import { supabase } from '../../lib/supabaseClient';

/**
 * Shared main-app shell (green header + scrollable white body) used by
 * every post-auth screen: Welcome, Home, My Conduits, Profile, Edit
 * Profile. Matches app_refrence.png's real Home mockup
 * (EA7D67AE-...png): circular avatar top-left, hamburger icon
 * top-right, and the title/subtitle centered as its own block in the
 * middle of the header - NOT anchored next to the avatar. The avatar
 * and hamburger are positioned absolutely at the header's edges so the
 * greeting text block can center against the header's full width,
 * matching the reference exactly rather than centering only in the
 * leftover space between two flex siblings.
 *
 * The hamburger opens a real menu (Logout, Delete Account) - per
 * explicit instruction, not a dead icon. Full navigation-drawer
 * contents (Settings, etc.) are a later task's concern; these two
 * account-level actions are genuinely usable today, not placeholders.
 */
export function AppShell({
  title,
  subtitle,
  children,
  avatarUri,
  onMenuPress,
  /**
   * Extra bottom padding reserved for a floating, absolutely-positioned
   * bottom tab bar (see app/home.tsx's BottomTabBar) so the last card
   * in the scroll view never sits underneath it. Screens without a tab
   * bar (Profile, Edit Profile) leave this at 0.
   */
  bottomInset = 0,
  /**
   * Shows a back arrow in place of the avatar (top-left) that calls
   * router.back() - for screens reached by pushing on top of a tab
   * (Profile, Edit Profile), which otherwise have no way back besides
   * the browser/OS back gesture. Home/My Conduits (top-level tabs) leave
   * this false and show the avatar instead, per the reference.
   */
  showBackButton = false,
  /**
   * Hides the hamburger menu (top-right) entirely - used on the Profile
   * screen itself, where "My Profile" / Log Out / Delete Account in a
   * menu would be redundant with being on that screen already. Every
   * other screen keeps the real, working hamburger menu.
   */
  hideMenu = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Profile avatar shown top-left of the header, per the reference. Falls back to a person icon if omitted. */
  avatarUri?: string | null;
  /** Optional extra handler run before the menu opens (e.g. analytics) - the menu itself always opens on tap. */
  onMenuPress?: () => void;
  bottomInset?: number;
  showBackButton?: boolean;
  hideMenu?: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function openMenu() {
    onMenuPress?.();
    setIsMenuOpen(true);
  }

  async function handleLogout() {
    setIsMenuOpen(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Could not log out', error.message);
      return;
    }
    router.replace('/login');
  }

  function handleDeleteAccountPress() {
    setIsMenuOpen(false);
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account and profile. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDeleteAccount },
      ]
    );
  }

  async function confirmDeleteAccount() {
    try {
      await apiDelete('/v1/profiles/me');
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (err) {
      Alert.alert(
        'Could not delete account',
        err instanceof Error ? err.message : 'Please try again.'
      );
    }
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {showBackButton ? (
            <Pressable
              onPress={() => router.back()}
              style={styles.avatarCircle}
              hitSlop={8}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
          ) : (
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={22} color="#fff" />
              )}
            </View>
          )}
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
          </View>
          {hideMenu ? (
            <View style={styles.menuButton} />
          ) : (
            <Pressable
              onPress={openMenu}
              style={styles.menuButton}
              hitSlop={8}
              accessibilityLabel="Menu"
            >
              <Ionicons name="menu" size={26} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>
      <View style={styles.bodyWrap}>
        <ScrollView
          style={styles.body}
          contentContainerStyle={[styles.bodyContent, { paddingBottom: Spacing.lg + bottomInset }]}
        >
          {children}
        </ScrollView>
      </View>

      {hideMenu ? null : (
        <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
          <Pressable style={styles.menuOverlay} onPress={() => setIsMenuOpen(false)}>
            <View style={styles.menuPanel}>
              <MenuItem
                icon={<Ionicons name="person-outline" size={18} color={Colors.text} />}
                label="My Profile"
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/profile');
                }}
              />
              <MenuItem
                icon={<Ionicons name="log-out-outline" size={18} color={Colors.text} />}
                label="Log Out"
                onPress={handleLogout}
              />
              <View style={styles.menuDivider} />
              <MenuItem
                icon={<Ionicons name="trash-outline" size={18} color={Colors.danger} />}
                label="Delete Account"
                labelColor={Colors.danger}
                onPress={handleDeleteAccountPress}
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

function MenuItem({
  icon,
  label,
  labelColor,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      {icon}
      <Text style={[styles.menuItemLabel, labelColor ? { color: labelColor } : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.primaryDark },
  header: {
    backgroundColor: Colors.primaryDark,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    // Absolute-positioned side elements + a full-width centered text
    // block is what actually reproduces the reference: the greeting
    // sits in the true horizontal center of the header, not centered
    // only within the space left over between the avatar and the
    // hamburger (which would visibly drift left, as it did before).
    position: 'relative',
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  avatarCircle: {
    position: 'absolute',
    left: Spacing.lg,
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  headerTextBlock: {
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textOnDark,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.mutedOnDark,
    fontSize: 14,
    marginTop: 4,
  },
  menuButton: {
    position: 'absolute',
    right: Spacing.lg,
    top: 4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The body's own rounded top corners overlap slightly upward into
  // the green header (negative marginTop) so there's exactly one
  // curved seam, not two adjacent rectangles meeting at a hard edge
  // (the "white cap with a black line" artifact from stacking a
  // separate rounded-corner filler block on top of the ScrollView).
  bodyWrap: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    marginTop: -Spacing.lg,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
  },
  menuPanel: {
    marginTop: 70,
    marginRight: Spacing.lg,
    minWidth: 200,
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    boxShadow: '0px 8px 24px rgba(0,0,0,0.18)',
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
});
