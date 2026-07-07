/**
 * Footer contact/social icon row.
 *
 * Design intent (per instruction): the visible link text stays a clean
 * handle-style label ("@instagram", "@x", "@facebook") rather than the raw
 * URL, and the phone/email/WhatsApp links are icon-only with no visible
 * number or address in the text. The real destination is only ever in the
 * href - this is standard, honest link behavior (browsers still show the
 * destination in the status bar/tooltip on hover, which is expected and
 * not something to try to suppress).
 *
 * Icons are small inline SVGs (no icon library dependency) drawn in the
 * site's existing minimal, single-color line-icon style, matching
 * ThemeToggle/MobileMenu rather than importing colorful brand logos.
 */

// The WhatsApp message is built with encodeURIComponent rather than the
// raw copy-pasted query string, which left the apostrophe in "I'd"
// un-percent-encoded. Functionally WhatsApp handles both, but this is the
// technically correct form.
const WHATSAPP_MESSAGE =
  "Hello AgroLease, I'd like to enquire about your machinery leasing plans.";

export const SOCIAL_LINKS = [
  {
    name: 'whatsapp',
    href: `https://wa.me/2349164512665?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
    ariaLabel: 'Chat with AgroLease on WhatsApp',
    label: null,
    external: true,
  },
  {
    name: 'phone',
    href: 'tel:+2349164512665',
    ariaLabel: 'Call AgroLease',
    label: null,
    external: false,
  },
  {
    name: 'email',
    href: 'mailto:contact@agrolease.xyz',
    ariaLabel: 'Email AgroLease',
    label: null,
    external: false,
  },
  {
    name: 'instagram',
    href: 'https://instagram.com/agrolease.official',
    ariaLabel: 'AgroLease on Instagram',
    label: '@instagram',
    external: true,
  },
  {
    name: 'x',
    href: 'https://x.com/agrolease',
    ariaLabel: 'AgroLease on X',
    label: '@X',
    external: true,
  },
  {
    name: 'facebook',
    href: 'https://www.facebook.com/profile.php?id=61571477546059',
    ariaLabel: 'AgroLease on Facebook',
    label: '@facebook',
    external: true,
  },
] as const;

function IconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <IconWrapper>
      <path d="M7 17l-1.5 3.2c-.15.3.15.6.45.45L9 19.2" />
      <path d="M20 12a8 8 0 1 1-3.2-6.4" />
      <path d="M20 12a8 8 0 0 0-8-8" />
      <path d="M9.5 9.3c.3-.6.9-.9 1.4-.4l.9.9c.3.3.3.7.1 1-.4.6-.3 1.3.2 1.8l.9.9c.5.5 1.2.6 1.8.2.3-.2.7-.2 1 .1l.9.9c.5.5.2 1.1-.4 1.4-1.4.7-3.1.3-4.4-.9l-2-2c-1.2-1.3-1.6-3-.9-4.4Z" />
    </IconWrapper>
  );
}

function PhoneIcon() {
  return (
    <IconWrapper>
      <path d="M6.6 10.8a13 13 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 9.5 9.5 0 0 0 3 .48 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 9.5 9.5 0 0 0 .48 3 1 1 0 0 1-.25 1z" />
    </IconWrapper>
  );
}

function MailIcon() {
  return (
    <IconWrapper>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 13l8.5-6.5" />
    </IconWrapper>
  );
}

function InstagramIcon() {
  return (
    <IconWrapper>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" />
    </IconWrapper>
  );
}

function XIcon() {
  return (
    <IconWrapper>
      <path d="M4 4l16 16" />
      <path d="M20 4 4 20" />
    </IconWrapper>
  );
}

function FacebookIcon() {
  return (
    <IconWrapper>
      <path d="M14 21v-7h2.5l.5-3H14V9c0-.8.3-1.5 1.7-1.5H17V4.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.4V11H7.5v3H10v7z" />
    </IconWrapper>
  );
}

const ICONS: Record<(typeof SOCIAL_LINKS)[number]['name'], () => React.ReactElement> = {
  whatsapp: WhatsAppIcon,
  phone: PhoneIcon,
  email: MailIcon,
  instagram: InstagramIcon,
  x: XIcon,
  facebook: FacebookIcon,
};

export function SocialLinks() {
  return (
    <ul aria-label="Contact and social links" className="flex flex-wrap items-center gap-4">
      {SOCIAL_LINKS.map((link) => {
        const Icon = ICONS[link.name];
        return (
          <li key={link.name}>
            <a
              href={link.href}
              aria-label={link.ariaLabel}
              title={link.ariaLabel}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="flex items-center gap-1.5 text-foreground/70 hover:text-brand-green-light transition-colors"
            >
              <Icon />
              {link.label && <span className="text-sm">{link.label}</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
