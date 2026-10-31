import type { Metadata } from "next";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <>
      <article className="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms of use</h1>
        <p className="text-sm text-muted">Template for review by counsel before launch.</p>
        <p>Kivora is a listing and information platform. We are not a party to any sale, purchase or rental agreement between users, and we are not a real estate agent under RERA.</p>
        <p>By posting a listing you confirm that you own the property or are authorised to list it, that the information is accurate, and that under-construction projects display their RERA registration number.</p>
        <p>Kivora Estimates, market trends and calculators are informational and not financial, legal or valuation advice.</p>
        <p>You must not post fake or duplicate listings, misrepresent your role (for example an agent posting as an owner), scrape the platform, or use contact details for spam.</p>
        <p>We may remove listings or accounts that break these terms. These terms are governed by the laws of India.</p>
      </article>
      <Footer />
    </>
  );
}
