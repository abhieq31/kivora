import type { Metadata } from "next";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <>
      <article className="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
        <h1 className="text-4xl font-extrabold tracking-tight">Privacy policy</h1>
        <p className="text-sm text-muted">Template aligned with the Digital Personal Data Protection Act, 2023 — have it reviewed before launch.</p>
        <p><b>What we collect:</b> account details (name, email, password hash), phone numbers you enter in contact forms, renter profiles you choose to fill, listings and photos you post, and basic usage logs.</p>
        <p><b>Why:</b> to run your account, pass your enquiry to the specific owner, agent or builder you contacted, show landlords the renter profile you applied with, and keep the platform safe.</p>
        <p><b>Sharing:</b> your phone number goes only to the lister you contact. We do not sell personal data.</p>
        <p><b>Your rights:</b> you can access, correct or delete your data and withdraw consent by writing to the grievance officer. We respond within the timelines set by law.</p>
        <p><b>Storage:</b> data is stored on servers with encryption in transit; passwords are hashed with scrypt.</p>
      </article>
      <Footer />
    </>
  );
}
