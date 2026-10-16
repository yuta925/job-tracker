import Link from "next/link";

export function AuthPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{ background: "var(--md-background)" }}
    >
      <section
        className="w-full max-w-[420px] rounded-3xl p-6 sm:p-8"
        style={{
          background: "var(--md-surface-container-lowest)",
          boxShadow: "var(--md-elev-1)",
        }}
      >
        <h1 className="md-headline-small">{title}</h1>
        <p
          className="md-body-medium mt-3 mb-6"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          {description}
        </p>
        {children}
        <Link className="md-btn md-btn-text mt-5" href="/login">
          ログインに戻る
        </Link>
      </section>
    </main>
  );
}
