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
        <p><b>Rent agreements:</b> the names, addresses and terms you enter are visible only to the two parties of that agreement. Don&apos;t enter Aadhaar or PAN numbers — they belong only on the stamped copy you sign. Home-diary entries and reviews are shared between both parties; a tenant&apos;s average rating of an owner appears on that owner&apos;s rental listings.</p>
        <p><b>Agreement review:</b> if you upload an agreement for an automated fairness review, the file is sent to our AI provider to produce the review and is not stored by Nakshly.</p>
        <p><b>Photos:</b> listing photos are resized on your device before upload and stored on Vercel Blob; they are public once your listing is live.</p>
        <p><b>Storage:</b> data is stored on servers with encryption in transit; passwords are hashed with scrypt.</p>
      </article>
      <Footer />
    </>
  );
}
