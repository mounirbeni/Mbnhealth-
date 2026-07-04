import Link from "next/link";
import { Activity } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — MBN Health",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">MBN Health</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
          <p>
            MBN Health (&quot;we&quot;, &quot;us&quot;) provides a multi-tenant clinic management platform and a
            connected patient portal. This policy explains what data we collect, how it is used, and how it is kept
            separate between clinics.
          </p>

          <h2>What we collect</h2>
          <p>Depending on how you use MBN Health, we process:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Account information: name, email, phone, and password (stored as a salted hash, never in plain text).</li>
            <li>Clinical and administrative data entered by a clinic: appointments, medical records, prescriptions, invoices, and related notes.</li>
            <li>Patient-portal data: the clinics you search for, the appointments you book, and messages exchanged with a clinic through MBN Health.</li>
            <li>Technical data: IP address, browser/device information, and audit logs of sign-ins and key actions, used for security and troubleshooting.</li>
          </ul>

          <h2>Data isolation between clinics</h2>
          <p>
            MBN Health is a multi-tenant platform. Every clinic&apos;s data — patients, appointments, records, staff —
            is strictly scoped to that clinic and is never visible to, or shared with, any other clinic on the
            platform. The patient portal is the one deliberate exception: it lets a single patient account book with
            multiple clinics, but each clinic still only ever sees its own patients and appointments.
          </p>

          <h2>How we use data</h2>
          <p>We use collected data to:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Provide and operate the platform (scheduling, records, billing, communication).</li>
            <li>Authenticate accounts and protect against unauthorized access.</li>
            <li>Send transactional communications such as appointment confirmations, reminders, and password resets.</li>
            <li>Maintain audit trails required for clinical and administrative accountability.</li>
          </ul>

          <h2>Data sharing</h2>
          <p>
            We do not sell personal data. Data is shared only with the clinic you interact with, and with service
            providers strictly necessary to operate the platform (for example, hosting, database, and email
            delivery), each bound to protect the data they process on our behalf.
          </p>

          <h2>Data retention and security</h2>
          <p>
            Passwords are hashed with Argon2 and never stored in plain text. Access to clinical data is governed by
            role-based permissions within each clinic. Data is retained for as long as the account or clinic remains
            active, or as required by applicable healthcare record-keeping obligations.
          </p>

          <h2>Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data by contacting the clinic you
            registered with (for clinic staff and patients of a specific clinic), or{" "}
            <a href="mailto:privacy@mbnhealth.com" className="text-primary hover:underline">
              privacy@mbnhealth.com
            </a>{" "}
            for platform-level accounts.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a href="mailto:privacy@mbnhealth.com" className="text-primary hover:underline">
              privacy@mbnhealth.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
