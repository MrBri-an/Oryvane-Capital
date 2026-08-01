import Link from "next/link";

type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RoutePlaceholder({ eyebrow, title, description }: RoutePlaceholderProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 max-w-xl text-neutral-600">{description}</p>
        <Link className="mt-8 inline-block text-sm underline" href="/">Oryvane Capital</Link>
      </section>
    </main>
  );
}
