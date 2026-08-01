import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Link className="mt-4 inline-block underline" href="/">Return home</Link>
      </div>
    </main>
  );
}
