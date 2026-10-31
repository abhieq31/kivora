"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted">Please try again. If it keeps happening, let us know.</p>
      <button onClick={reset} className="btn mt-6">Try again</button>
    </div>
  );
}
