import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Sign in" };

export default function Page({ searchParams }: PageProps<"/login">) {
  return (
    <div className="flex flex-1 items-center justify-center bg-paper px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <LogoMark className="h-10 w-10" />
        <h1 className="mt-4 text-2xl font-bold">Welcome back</h1>
        <p className="mb-6 mt-1 text-sm text-muted">Save homes and searches, message owners and agents, and track your home&apos;s value.</p>
        <Suspense fallback={null}>
          <Inner searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function Inner({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const n = (await searchParams).next;
  const next = typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/";
  return <AuthForm mode="login" next={next} />;
}
