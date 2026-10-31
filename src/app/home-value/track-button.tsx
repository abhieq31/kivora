"use client";

import { useActionState } from "react";
import { trackHome } from "@/lib/actions/owner";
import { Notice, Submit } from "@/components/form-bits";

export function TrackHomeButton({ fields }: { fields: Record<string, string> }) {
  const [state, action] = useActionState(trackHome, null);
  return (
    <form action={action}>
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <Submit pendingText="Saving…">Track this home&apos;s value</Submit>
      <Notice state={state} />
    </form>
  );
}
