"use client";

import { useActionState, useRef } from "react";
import { replyToThread } from "@/lib/actions/homes";
import { Notice, Submit } from "@/components/form-bits";

export function Reply({ inquiryId }: { inquiryId: number }) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState(async (prev: Awaited<ReturnType<typeof replyToThread>>, fd: FormData) => {
    const r = await replyToThread(prev, fd);
    if (r?.ok) ref.current?.reset();
    return r;
  }, null);
  return (
    <form ref={ref} action={action} className="mt-6 space-y-2">
      <input type="hidden" name="inquiry_id" value={inquiryId} />
      <textarea name="body" rows={3} className="input" placeholder="Write a reply…" required />
      {state?.error && <Notice state={state} />}
      <Submit pendingText="Sending…">Send</Submit>
    </form>
  );
}
