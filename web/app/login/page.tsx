import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{ background: "var(--md-background)" }}
    >
      <div className="w-full max-w-[400px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: "var(--md-primary-container)",
              color: "var(--md-on-primary-container)",
              boxShadow: "var(--md-elev-2)",
            }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="md-headline-small" style={{ color: "var(--md-on-background)" }}>
            就活トラッカー
          </h1>
          <p className="md-body-medium mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
            選考状況を一元管理
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--md-surface-container-lowest)",
            borderRadius: "var(--md-shape-xl)",
            boxShadow: "var(--md-elev-1)",
          }}
        >
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
