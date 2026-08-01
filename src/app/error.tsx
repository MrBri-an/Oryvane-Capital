"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application route error", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-neutral-600">Please try again.</p>
        <button className="mt-6 rounded bg-neutral-900 px-4 py-2 text-white" onClick={reset} type="button">
          Try again
        </button>
      </div>
    </main>
  );
}
