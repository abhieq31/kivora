import type { Metadata } from "next";
import { Footer } from "@/components/footer";

export const metadata: Metadata = { title: "Terms of use" };

export default function Page() {
  return (
    <>
      <article className="mx-auto max-w-3xl space-y-4 px-4 py-12 leading-relaxed">
        <h1 className="text-4xl font-extrabold tracking-tight">Terms of use</h1>
        <p className="text-sm text-muted">Template for review by counsel before launch.</p>
        <p>Nakshly is a listing and information platform. We are not a party to any sale, purchase or rental agreement between users, and we are not a real estate agent under RERA.</p>
        <p>By posting a listing you confirm that you own the property or are authorised to list it, that the information is accurate, and that under-construction projects display their RERA registration number.</p>
        <p>Nakshly Estimates, market trends and calculators are informational and not financial, legal or valuation advice.</p>
        <p>You must not post fake or duplicate listings, misrepresent your role (for example an agent posting as an owner), scrape the platform, or use contact details for spam.</p>
        <p>We may remove listings or accounts that break these terms. These terms are governed by the laws of India.</p>
        <p><b>Agreements and paperwork.</b> Nakshly&apos;s agreement template and state guides are general information, not legal advice. You are responsible for the terms you agree, for paying stamp duty and registration where required, and for police tenant registration. Fixed-fee services are performed by Nakshly or its partners and are payable after delivery.</p>
        <p><b>Reviews.</b> Only parties to an agreement both accepted on Nakshly can review each other. Reviews must be truthful and about the tenancy; we may remove abusive or false reviews.</p>
      </article>
      <Footer />
    </>
  );
}
