"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Inline styles kept as a plain object map so
   the component has zero extra dependencies.
   The design uses the existing dark-mode palette
   (#09090b background, zinc shades for surfaces).
───────────────────────────────────────────── */

const ACCENT = "#6366f1"; // indigo-500 – primary brand accent
const ACCENT_LIGHT = "#818cf8"; // indigo-400

type Section = {
  id: string;
  icon: string;
  title: string;
  content: React.ReactNode;
};

// ── Reusable sub-components ──────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        background: `${ACCENT}22`,
        color: ACCENT_LIGHT,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.05em",
        border: `1px solid ${ACCENT}44`,
      }}
    >
      {children}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#18181b" : "#141417",
        border: `1px solid ${hovered ? ACCENT + "55" : "#27272a"}`,
        borderRadius: 14,
        padding: "20px 22px",
        transition: "all 0.25s ease",
        cursor: "default",
        boxShadow: hovered ? `0 0 18px ${ACCENT}22` : "none",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: "#f4f4f5",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.65 }}>
        {body}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  index,
}: {
  section: Section;
  index: number;
}) {
  const [open, setOpen] = useState(index < 2); // first two sections open by default
  return (
    <div
      id={section.id}
      style={{
        background: "#111113",
        border: "1px solid #27272a",
        borderRadius: 18,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        scrollMarginTop: 90,
      }}
    >
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: 14,
          padding: "20px 26px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          borderBottom: open ? "1px solid #27272a" : "none",
        }}
      >
        <span
          style={{
            fontSize: 26,
            width: 46,
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${ACCENT}18`,
            borderRadius: 12,
            flexShrink: 0,
          }}
        >
          {section.icon}
        </span>
        <span
          style={{
            flex: 1,
            fontWeight: 700,
            fontSize: 17,
            color: "#f4f4f5",
          }}
        >
          {section.title}
        </span>
        <span
          style={{
            color: "#52525b",
            fontSize: 20,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
          }}
        >
          ▾
        </span>
      </button>

      {/* Body */}
      {open && (
        <div
          style={{
            padding: "22px 26px 26px",
            color: "#a1a1aa",
            fontSize: 14.5,
            lineHeight: 1.8,
          }}
        >
          {section.content}
        </div>
      )}
    </div>
  );
}

// ── Content ──────────────────────────────────

const SECTIONS: Section[] = [
  // 1 – Overview
  {
    id: "overview",
    icon: "📋",
    title: "1. Overview & Scope",
    content: (
      <>
        <p>
          This Privacy Policy (&quot;Policy&quot;) applies to the{" "}
          <strong style={{ color: "#f4f4f5" }}>NyikaRise</strong> mobile
          application (&quot;App&quot;), website (nyikarise.org), and all
          associated services (collectively, &quot;Services&quot;) operated by
          the NyikaRise development team based in{" "}
          <strong style={{ color: "#f4f4f5" }}>Harare, Zimbabwe</strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          NyikaRise is a social communication platform that offers real-time
          chat, live updates, community feeds, job listings, accommodation
          listings, and lost-and-found services primarily for the Zimbabwean
          community and diaspora.
        </p>
        <p style={{ marginTop: 12 }}>
          By downloading, installing, or using the App in any way, you agree to
          the collection and use of information in accordance with this Policy.
          If you do not agree, please discontinue use of the Services
          immediately.
        </p>
        <p style={{ marginTop: 12 }}>
          <strong style={{ color: "#f4f4f5" }}>
            Effective Date:{" "}
          </strong>{" "}
          26 April 2026 &nbsp;|&nbsp;{" "}
          <strong style={{ color: "#f4f4f5" }}>Last Updated:</strong> 26 April
          2026
        </p>
      </>
    ),
  },

  // 2 – Information We Collect
  {
    id: "information-collected",
    icon: "🗂️",
    title: "2. Information We Collect",
    content: (
      <>
        <p>We collect the following categories of information:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20, display: "grid", gap: 8 }}>
          {[
            "Account data – display name, username, email address, phone number, and profile photo.",
            "Identity verification data – government-issued ID, residential address, and date of birth (where you voluntarily submit for account verification).",
            "Communication data – messages, media files, voice recordings, and chat metadata (timestamps, read receipts, delivery reports).",
            "Feed & social data – posts, comments, reactions, shares, and live-update interactions.",
            "Device & technical data – IP address, device model, OS version, push-notification tokens, crash logs.",
            "Location data – only when you explicitly enable location features (e.g. accommodation or lost-and-found proximity search); never collected in the background.",
            "Usage analytics – feature usage patterns, session length, and error logs (anonymised).",
          ].map((item, i) => (
            <li key={i} style={{ color: "#a1a1aa" }}>
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },

  // 3 – User Records & Data Management
  {
    id: "user-records",
    icon: "🗄️",
    title: "3. User Records & Data Management",
    content: (
      <>
        <p>
          We maintain secure records of your account activity including
          registration details, login history, transaction records, and
          in-app interactions. These records are stored on encrypted servers and
          are only accessible to authorised NyikaRise personnel and automated
          systems.
        </p>

        <h4
          style={{
            color: "#f4f4f5",
            marginTop: 18,
            marginBottom: 8,
            fontWeight: 700,
          }}
        >
          📤 Right to Deletion
        </h4>
        <p>
          You have the right to request the permanent deletion of your account
          and all associated personal data at any time. To exercise this right:
        </p>
        <ol style={{ marginTop: 10, paddingLeft: 20, display: "grid", gap: 6 }}>
          <li>Open the NyikaRise mobile app.</li>
          <li>
            Navigate to <strong style={{ color: "#f4f4f5" }}>Profile → Settings → Account → Delete Account</strong>.
          </li>
          <li>
            Confirm your identity and submit the deletion request. Your account
            and data will be permanently erased within{" "}
            <strong style={{ color: "#f4f4f5" }}>30 days</strong>.
          </li>
        </ol>
        <p style={{ marginTop: 12 }}>
          Note: some anonymised usage data may be retained for legal compliance
          and fraud prevention purposes as required by Zimbabwean law, but it
          will not be linked to your identity.
        </p>
      </>
    ),
  },

  // 4 – Password Security
  {
    id: "password-security",
    icon: "🔐",
    title: "4. Password & Credential Security",
    content: (
      <>
        <p>
          Your passwords are{" "}
          <strong style={{ color: "#f4f4f5" }}>never stored in plain text</strong>
          . NyikaRise uses industry-standard{" "}
          <strong style={{ color: "#f4f4f5" }}>one-way cryptographic hashing</strong>{" "}
          (bcrypt with a high work factor) to store passwords. This means:
        </p>
        <ul style={{ marginTop: 12, paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>
            Even NyikaRise staff cannot read or retrieve your original password.
          </li>
          <li>
            If our database were ever compromised, attackers would only obtain
            irreversible hash values — your actual password remains protected.
          </li>
          <li>
            Passwords are salted before hashing to prevent rainbow-table and
            dictionary attacks.
          </li>
          <li>
            All password transmission between your device and our servers is
            protected with{" "}
            <strong style={{ color: "#f4f4f5" }}>TLS 1.3 encryption</strong>.
          </li>
        </ul>
        <p style={{ marginTop: 14 }}>
          We recommend using a strong, unique password and enabling two-factor
          authentication (2FA) where available.
        </p>
      </>
    ),
  },

  // 5 – Chat Privacy
  {
    id: "chat-privacy",
    icon: "💬",
    title: "5. Chat & Messaging Privacy",
    content: (
      <>
        <p>
          NyikaRise is built around secure communication. Here is how we protect
          your conversations:
        </p>

        <h4 style={{ color: "#f4f4f5", marginTop: 16, marginBottom: 8, fontWeight: 700 }}>
          🛡️ Who Can See Your Chats
        </h4>
        <p>
          Direct messages are visible only to the participants of that
          conversation. Group messages are visible only to group members. Our
          staff do not access message content unless legally compelled to do so.
        </p>

        <h4 style={{ color: "#f4f4f5", marginTop: 16, marginBottom: 8, fontWeight: 700 }}>
          🚫 Blocking & Privacy Controls
        </h4>
        <ul style={{ paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Block any user</strong> – blocked users
            cannot send you messages, view your profile, or see your online
            status.
          </li>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Hide sensitive contact info</strong> –
            you can choose to hide your phone number and/or email address from
            other users in{" "}
            <strong style={{ color: "#f4f4f5" }}>
              Profile → Privacy Settings
            </strong>
            . By default, these fields are private.
          </li>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Control your last seen & status</strong>{" "}
            – choose who can see when you were last active (Everyone / Contacts
            Only / Nobody).
          </li>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Read receipts</strong> – you can disable
            read receipts so others cannot see when you have read their messages
            (note: disabling this also hides their read receipts from you).
          </li>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Profile photo visibility</strong> –
            restrict who can see your profile picture (Everyone / Contacts Only
            / Nobody).
          </li>
        </ul>

        <h4 style={{ color: "#f4f4f5", marginTop: 16, marginBottom: 8, fontWeight: 700 }}>
          🔒 Message Retention
        </h4>
        <p>
          Messages are stored on our servers to enable multi-device sync and
          message history. You may delete individual messages or entire
          conversations at any time from within the app. Deleted messages are
          permanently removed from our servers within 7 days.
        </p>
      </>
    ),
  },

  // 6 – Report & Safety
  {
    id: "reporting",
    icon: "🚨",
    title: "6. Reporting Abuse & Safety",
    content: (
      <>
        <p>
          NyikaRise is committed to maintaining a safe environment. We provide a
          built-in reporting system accessible from every chat, profile, feed
          post, and comment.
        </p>

        <h4 style={{ color: "#f4f4f5", marginTop: 16, marginBottom: 8, fontWeight: 700 }}>
          📨 How to Report
        </h4>
        <ol style={{ paddingLeft: 20, display: "grid", gap: 6 }}>
          <li>
            Tap the <strong style={{ color: "#f4f4f5" }}>⋮ (three-dot menu)</strong> on any
            message, post, or user profile.
          </li>
          <li>
            Select <strong style={{ color: "#f4f4f5" }}>Report</strong> and choose the
            category (spam, harassment, inappropriate content, fake account,
            etc.).
          </li>
          <li>Add optional details and submit.</li>
        </ol>

        <h4 style={{ color: "#f4f4f5", marginTop: 16, marginBottom: 8, fontWeight: 700 }}>
          ⏱️ Response Time
        </h4>
        <p>
          Our moderation team reviews every report and responds within a{" "}
          <strong style={{ color: "#f4f4f5" }}>24-hour window</strong>. For severe
          violations (e.g. threats of violence or child safety concerns), we
          prioritise immediate review. You will receive an in-app notification
          and email update on the outcome of your report.
        </p>

        <h4 style={{ color: "#f4f4f5", marginTop: 16, marginBottom: 8, fontWeight: 700 }}>
          🔏 Reporter Confidentiality
        </h4>
        <p>
          Your identity as a reporter is always confidential. The reported user
          is never told who submitted the report.
        </p>
      </>
    ),
  },

  // 7 – Feeds & Live Updates
  {
    id: "feeds-live",
    icon: "📡",
    title: "7. Feeds, Live Updates & Public Content",
    content: (
      <>
        <p>
          NyikaRise includes a community feed and live-update features. Please
          be aware of the following privacy implications:
        </p>
        <ul style={{ marginTop: 12, paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>
            Posts made to the <strong style={{ color: "#f4f4f5" }}>Public feed</strong> are
            visible to all NyikaRise users and may be indexed. Think before you
            post personal information publicly.
          </li>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Friends-only or private posts</strong> are
            visible only to approved contacts.
          </li>
          <li>
            Live updates and broadcasts may be recorded and stored for replay.
            You are notified before a live session is started by another
            participant.
          </li>
          <li>
            You can delete any post or comment you have made at any time; it
            will be removed from the feed within minutes.
          </li>
          <li>
            Reactions and interactions (likes, comments, shares) may be visible
            to other users depending on your privacy settings.
          </li>
        </ul>
      </>
    ),
  },

  // 8 – Data Sharing
  {
    id: "data-sharing",
    icon: "🤝",
    title: "8. Data Sharing & Third Parties",
    content: (
      <>
        <p>
          We do <strong style={{ color: "#f4f4f5" }}>not sell</strong> your personal data
          to third parties. We may share data only in the following limited
          circumstances:
        </p>
        <ul style={{ marginTop: 12, paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Service providers</strong> – cloud
            infrastructure (storage, CDN, push notifications) that process data
            strictly on our behalf and under confidentiality agreements.
          </li>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Legal obligations</strong> – if required
            by Zimbabwean law, court order, or regulatory authority.
          </li>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Safety</strong> – to prevent imminent
            harm or investigate fraudulent activity.
          </li>
          <li>
            <strong style={{ color: "#f4f4f5" }}>Business transfer</strong> – in the event
            of a merger or acquisition, user data would transfer to the
            successor entity under the same privacy protections.
          </li>
        </ul>
      </>
    ),
  },

  // 9 – Data Retention
  {
    id: "data-retention",
    icon: "⏳",
    title: "9. Data Retention",
    content: (
      <>
        <p>We retain your personal data for as long as:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>Your account remains active and the data is necessary to provide Services.</li>
          <li>Required by applicable law or regulatory obligation.</li>
          <li>Necessary for legitimate business purposes (e.g. dispute resolution, fraud prevention).</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Upon account deletion, personal data is purged from active systems
          within <strong style={{ color: "#f4f4f5" }}>30 days</strong> and from
          encrypted backups within{" "}
          <strong style={{ color: "#f4f4f5" }}>90 days</strong>.
        </p>
      </>
    ),
  },

  // 10 – Children
  {
    id: "children",
    icon: "🧒",
    title: "10. Children's Privacy",
    content: (
      <>
        <p>
          NyikaRise is intended for users aged{" "}
          <strong style={{ color: "#f4f4f5" }}>16 years and older</strong>. We do not
          knowingly collect personal data from children under 16. If you believe
          a child under 16 has created an account, please contact us immediately
          at{" "}
          <a
            href="mailto:privacy@nyikarise.org"
            style={{ color: ACCENT_LIGHT, textDecoration: "underline" }}
          >
            privacy@nyikarise.org
          </a>{" "}
          and we will promptly delete the account and all associated data.
        </p>
      </>
    ),
  },

  // 11 – Your Rights
  {
    id: "your-rights",
    icon: "⚖️",
    title: "11. Your Rights",
    content: (
      <>
        <p>Depending on your jurisdiction, you may have the following rights:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20, display: "grid", gap: 8 }}>
          {[
            "Right to access – request a copy of the personal data we hold about you.",
            "Right to rectification – correct inaccurate or incomplete data.",
            "Right to erasure – request deletion of your personal data ('right to be forgotten').",
            "Right to data portability – receive your data in a machine-readable format.",
            "Right to object – object to certain types of processing (e.g. marketing).",
            "Right to restrict processing – request that we limit how we use your data.",
            "Right to withdraw consent – where processing is based on consent, you may withdraw it at any time without affecting lawfulness of prior processing.",
          ].map((right, i) => (
            <li key={i}>{right}</li>
          ))}
        </ul>
        <p style={{ marginTop: 14 }}>
          To exercise any of these rights, contact us at{" "}
          <a
            href="mailto:privacy@nyikarise.org"
            style={{ color: ACCENT_LIGHT, textDecoration: "underline" }}
          >
            privacy@nyikarise.org
          </a>
          . We will respond within{" "}
          <strong style={{ color: "#f4f4f5" }}>30 days</strong>.
        </p>
      </>
    ),
  },

  // 12 – Security
  {
    id: "security",
    icon: "🛡️",
    title: "12. Security Measures",
    content: (
      <>
        <p>
          We implement appropriate technical and organisational measures to
          protect your data, including:
        </p>
        <ul style={{ marginTop: 12, paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>TLS 1.3 encrypted data transmission for all API communications.</li>
          <li>AES-256 encryption for data stored on our servers.</li>
          <li>Bcrypt one-way hashing with salt for password storage.</li>
          <li>Role-based access control limiting staff access to personal data.</li>
          <li>Regular security audits and penetration testing.</li>
          <li>Automated anomaly detection and brute-force protection on login endpoints.</li>
          <li>Multi-factor authentication options for user accounts.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Despite these measures, no system is 100% secure. You use the Services
          at your own risk and we encourage you to use a strong, unique password
          and keep your device secure.
        </p>
      </>
    ),
  },

  // 13 – Cookies & Tracking
  {
    id: "cookies",
    icon: "🍪",
    title: "13. Cookies & Tracking Technologies",
    content: (
      <>
        <p>
          Our website (nyikarise.org) uses strictly necessary cookies for session
          management and authentication. We do not use advertising or tracking
          cookies. The mobile app does not use browser cookies; session tokens
          are stored securely in the device keystore.
        </p>
        <p style={{ marginTop: 12 }}>
          Anonymous analytics (e.g. page views, feature usage) may be collected
          to improve the product. This data cannot be used to identify you
          personally.
        </p>
      </>
    ),
  },

  // 14 – Policy Changes
  {
    id: "policy-changes",
    icon: "📝",
    title: "14. Changes to This Policy",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time. When we make
          material changes, we will:
        </p>
        <ul style={{ marginTop: 10, paddingLeft: 20, display: "grid", gap: 6 }}>
          <li>Post the updated Policy with a new &quot;Last Updated&quot; date on this page.</li>
          <li>Send an in-app notification to all active users.</li>
          <li>For significant changes, send an email to your registered address.</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Continued use of the Services after changes constitutes acceptance of
          the revised Policy.
        </p>
      </>
    ),
  },

  // 15 – Contact
  {
    id: "contact",
    icon: "📞",
    title: "15. Contact Us",
    content: (
      <>
        <p>
          If you have questions, concerns, or requests relating to this Privacy
          Policy, please reach out to the NyikaRise team:
        </p>
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 10,
          }}
        >
          {[
            { label: "📧 Privacy Email", value: "privacy@nyikarise.org", href: "mailto:privacy@nyikarise.org" },
            { label: "🌐 Website", value: "nyikarise.org", href: "https://nyikarise.org" },
            { label: "📱 WhatsApp / Phone", value: "+263 787 604 187", href: "tel:+263787604187" },
            { label: "📍 Location", value: "Harare, Zimbabwe", href: undefined },
          ].map(({ label, value, href }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#18181b",
                borderRadius: 10,
                padding: "12px 16px",
                border: "1px solid #27272a",
              }}
            >
              <span style={{ color: "#71717a", fontSize: 13, minWidth: 150 }}>
                {label}
              </span>
              {href ? (
                <a
                  href={href}
                  style={{
                    color: ACCENT_LIGHT,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  {value}
                </a>
              ) : (
                <span style={{ color: "#f4f4f5", fontWeight: 600 }}>{value}</span>
              )}
            </div>
          ))}
        </div>
      </>
    ),
  },
];

// ── Quick-nav labels ─────────────────────────
const NAV_LABELS = [
  { id: "overview", label: "Overview" },
  { id: "user-records", label: "User Records" },
  { id: "password-security", label: "Passwords" },
  { id: "chat-privacy", label: "Chat Privacy" },
  { id: "reporting", label: "Reporting" },
  { id: "feeds-live", label: "Feeds & Live" },
  { id: "data-sharing", label: "Data Sharing" },
  { id: "your-rights", label: "Your Rights" },
  { id: "security", label: "Security" },
  { id: "contact", label: "Contact" },
];

// ── Page ─────────────────────────────────────

export default function PrivacyPage() {
  return (
    <>
      {/* SEO */}
      <title>Privacy & Policy – NyikaRise</title>
      <meta
        name="description"
        content="NyikaRise Privacy Policy. Learn how we collect, use, and protect your personal data in the NyikaRise chat and social app."
      />

      {/* Background */}
      <div
        style={{
          minHeight: "100vh",
          background: "#09090b",
          color: "#a1a1aa",
          fontFamily: "var(--font-geist-sans), Arial, sans-serif",
        }}
      >
        {/* ── Hero banner ─────────────────────── */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid #27272a",
          }}
        >
          {/* Gradient blob */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse 70% 60% at 50% -10%, ${ACCENT}33 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 860,
              margin: "0 auto",
              padding: "80px 24px 64px",
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Back link */}
            <div style={{ marginBottom: 28, textAlign: "left" }}>
              <Link
                href="/"
                style={{
                  color: "#71717a",
                  fontSize: 13,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                ← Back to Home
              </Link>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Badge>Legal Document</Badge>
            </div>

            <h1
              style={{
                fontSize: "clamp(32px, 6vw, 52px)",
                fontWeight: 800,
                color: "#f4f4f5",
                lineHeight: 1.15,
                margin: "0 0 16px",
                letterSpacing: "-0.02em",
              }}
            >
              Privacy &amp;{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Policy
              </span>
            </h1>

            <p
              style={{
                fontSize: 17,
                maxWidth: 620,
                margin: "0 auto 36px",
                lineHeight: 1.7,
                color: "#71717a",
              }}
            >
              NyikaRise is a chat &amp; social platform built in Zimbabwe. This
              policy explains what data we collect, how we keep it safe, and the
              controls you have over your information.
            </p>

            {/* Meta chips */}
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: "📅", text: "Effective: 26 April 2026" },
                { icon: "🇿🇼", text: "Governed by Zimbabwean Law" },
                { icon: "📱", text: "Applies to Mobile App & Website" },
              ].map(({ icon, text }) => (
                <span
                  key={text}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    color: "#71717a",
                    background: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: 999,
                    padding: "5px 14px",
                  }}
                >
                  {icon} {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick summary cards ──────────────── */}
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "52px 24px 0",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#52525b",
              marginBottom: 16,
            }}
          >
            Key Highlights
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 14,
              marginBottom: 52,
            }}
          >
            <InfoCard
              icon="🔐"
              title="One-Way Password Hashing"
              body="Passwords are bcrypt-hashed with unique salts. Even we cannot read them."
            />
            <InfoCard
              icon="🗑️"
              title="Delete Your Data Anytime"
              body="Request account deletion from the mobile app. Data erased within 30 days."
            />
            <InfoCard
              icon="🚫"
              title="Block Anyone"
              body="Instantly block users from seeing your phone number, email, and messages."
            />
            <InfoCard
              icon="🚨"
              title="24-Hour Report Response"
              body="Our safety team reviews every report within 24 hours."
            />
            <InfoCard
              icon="🔒"
              title="TLS 1.3 Encrypted"
              body="All data between your device and our servers is encrypted in transit."
            />
            <InfoCard
              icon="🚫📢"
              title="No Data Selling"
              body="We never sell your personal information to advertisers or third parties."
            />
          </div>

          {/* ── Quick-nav strip ───────────────── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 40,
            }}
          >
            {NAV_LABELS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                style={{
                  fontSize: 13,
                  color: "#71717a",
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: 8,
                  padding: "5px 13px",
                  textDecoration: "none",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = ACCENT_LIGHT;
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = ACCENT + "66";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#71717a";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#27272a";
                }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* ── Section accordion ────────────── */}
          <div style={{ display: "grid", gap: 14, paddingBottom: 80 }}>
            {SECTIONS.map((section, i) => (
              <SectionCard key={section.id} section={section} index={i} />
            ))}
          </div>
        </div>

        {/* ── Footer ──────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid #27272a",
            padding: "36px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: "#52525b", marginBottom: 8 }}>
            © {new Date().getFullYear()} NyikaRise. Developed in{" "}
            <strong style={{ color: "#71717a" }}>Zimbabwe 🇿🇼</strong>.
          </p>
          <p style={{ fontSize: 13, color: "#52525b" }}>
            Questions?{" "}
            <a
              href="tel:+263787604187"
              style={{ color: ACCENT_LIGHT, textDecoration: "none" }}
            >
              +263 787 604 187
            </a>{" "}
            &nbsp;|&nbsp;{" "}
            <a
              href="mailto:privacy@nyikarise.org"
              style={{ color: ACCENT_LIGHT, textDecoration: "none" }}
            >
              privacy@nyikarise.org
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
