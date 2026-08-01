"use client";

export default function RootGlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", textAlign: "center" }}>
          <div>
            <h1>Oryvane Capital is temporarily unavailable</h1>
            <button onClick={reset} type="button">Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
