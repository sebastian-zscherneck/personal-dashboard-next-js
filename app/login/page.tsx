"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { HexLogo } from "@/components/icons/hex-logo";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-[#E0FF00] blur-xl opacity-20 animate-pulse-hex" />
            <HexLogo size={48} className="text-white relative" />
          </div>
          <h1 className="text-sm font-semibold tracking-tight uppercase text-white">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1">Self-Employment Admin</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1B2124] border border-white/10 text-white placeholder-gray-500 focus:border-[#E0FF00] focus:outline-none transition-colors"
                style={{
                  clipPath:
                    "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
                }}
                placeholder="Enter password"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full group relative px-8 py-3 bg-[#E0FF00] text-black transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              clipPath:
                "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
            }}
          >
            <div className="flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-tight">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </div>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[10px] text-gray-600 mt-8">
          Single-user dashboard. No account needed.
        </p>
      </div>
    </div>
  );
}
