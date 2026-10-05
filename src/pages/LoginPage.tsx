import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LockIcon } from "../components/ui/icons";

const MANIFEST_TICKER = [
  "PROBLEM",
  "SOLUTION",
  "TO DO",
  "PROGRESS",
  "STATUS",
  "KPI",
  "DUE DATE",
];

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand panel */}
      <div className="relative bg-ledger flex flex-col justify-between overflow-hidden md:w-3/5 min-h-[240px] md:min-h-screen p-8 md:p-16">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gold-400 rounded-sm">
            <svg
              className="w-5 h-5 text-ink-950"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink-300">
            Barokah Perkasa Group
          </span>
        </div>

        <div className="max-w-lg">
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink-50 leading-tight mb-4">
            Issue
            <br />
            Tracker
          </h1>
          <p className="text-ink-300 text-lg">
            One ledger for every business unit's problems, solutions, and
            progress toward close.
          </p>
        </div>

        {/* Manifest ticker */}
        <div className="hidden md:block overflow-hidden mask-fade-x">
          <div className="ticker-track flex items-center gap-4 w-max font-mono text-xs uppercase tracking-widest text-ink-500">
            {[...MANIFEST_TICKER, ...MANIFEST_TICKER].map((label, i) => (
              <span key={i} className="flex items-center gap-4 shrink-0">
                {label}
                <span className="text-ink-700">&middot;</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sign-in panel */}
      <div className="flex-1 flex items-center justify-center bg-ink-950 p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-ink-50 mb-1">
            Sign In
          </h2>
          <p className="text-ink-400 text-sm mb-8">
            Enter your credentials to access your business unit.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink-200 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-ink-900 border border-ink-700 rounded-sm text-ink-50 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink-200 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-ink-900 border border-ink-700 rounded-sm text-ink-50 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-ink-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded-sm border-ink-600 text-gold-400 focus:ring-gold-400"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-gold-400 hover:text-gold-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {error && <ErrorBanner message={error} />}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-ink-950"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LockIcon className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-ink-500 text-xs mt-8 font-mono uppercase tracking-widest">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
