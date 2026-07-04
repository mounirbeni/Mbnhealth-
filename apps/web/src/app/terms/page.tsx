import Link from "next/link";
import { Activity } from "lucide-react";

export const metadata = {
  title: "Terms of Service — MBN Health",
};

export default function TermsOfServicePage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern access to and use of MBN Health, a clinic management
            platform and its connected patient portal. By creating an account or using the platform, you agree to
            these Terms.
          </p>

          <h2>Accounts</h2>
          <p>
            Clinic accounts are created by an authorized representative of the clinic and are responsible for the
            accuracy of information entered and for managing access granted to staff members. Patient accounts are
            personal and must not be shared.
          </p>

          <h2>Subscription plans</h2>
          <p>
            MBN Health is offered under tiered subscription plans (Starter, Professional, Enterprise), each with
            defined limits on staff, doctor, and patient records. Continued use beyond a trial period requires an
            active paid subscription. Plan limits and pricing are described at the time of signup and in your clinic
            settings.
          </p>

          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Use the platform to store or process data you are not authorized to handle.</li>
            <li>Attempt to access another clinic&apos;s data or bypass account isolation controls.</li>
            <li>Interfere with the platform&apos;s operation or attempt to circumvent security measures.</li>
            <li>Use the platform for any unlawful purpose.</li>
          </ul>

          <h2>Clinical responsibility</h2>
          <p>
            MBN Health is a record-keeping and scheduling tool. Clinics and healthcare providers remain solely
            responsible for the clinical decisions, diagnoses, and treatment recorded or communicated through the
            platform.
          </p>

          <h2>Availability and changes</h2>
          <p>
            We aim to keep the platform available and reliable but do not guarantee uninterrupted service. Features
            may be added, changed, or removed as the platform evolves; material changes to paid functionality will be
            communicated in advance where reasonably possible.
          </p>

          <h2>Termination</h2>
          <p>
            Either party may terminate a subscription as described in the billing settings. Upon termination, a
            clinic&apos;s data may be retained for a limited period to allow export before deletion, subject to
            applicable record-keeping requirements.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            The platform is provided &quot;as is&quot;. To the maximum extent permitted by law, MBN Health is not
            liable for indirect or consequential damages arising from use of the platform.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these Terms can be sent to{" "}
            <a href="mailto:legal@mbnhealth.com" className="text-primary hover:underline">
              legal@mbnhealth.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
