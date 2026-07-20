import { ComingSoon } from '../../components/coming-soon/ComingSoon';

/**
 * Home's "Link Security" shortcut destination.
 *
 * Distinct from Security Access (app/security/access.tsx), which is a
 * real, working screen reachable from Login/Sign Up for someone
 * *entering* a code they were given to link their own device as a
 * guard. Home's "Link Security" is the opposite direction - a Conduit
 * owner/operator *generating* a code/QR to hand to a guard - and that
 * generation flow doesn't exist until Task 5 (Security Officer
 * System). Routing Home's shortcut into the code-entry screen would be
 * wrong (different action, different audience), so this stays a
 * clearly-labeled Coming Soon stub instead, per the Constitution's
 * "Coming Soon instead of hidden" rule.
 */
export default function LinkSecurityComingSoon() {
  return <ComingSoon title="Link Security" />;
}
