import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  UserPlus,
  LogIn,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AuthViewProps {
  mode: "login" | "signup";
}

export default function AuthView({ mode }: AuthViewProps) {
  const navigate = useNavigate();
  const { login, signup, isLoading, error } = useAuth();
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!email.trim() || !password.trim()) {
      setValidationError("Please fill in all fields");
      return;
    }

    if (isSignup) {
      if (password !== confirmPassword) {
        setValidationError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setValidationError("Password must be at least 6 characters");
        return;
      }
      if (!name.trim()) {
        setValidationError("Please enter your name");
        return;
      }
    }

    try {
      if (isSignup) {
        await signup(email, password, name);
        navigate("/onboarding");
      } else {
        await login(email, password);
        navigate("/");
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary mb-2">Tax FYP</h1>
          <p className="text-on-surface-variant">
            {isSignup
              ? "Create your account to get started"
              : "Welcome back! Sign in to continue"}
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl shadow-taxfyp border border-outline-variant/15 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserPlus
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                    size={18}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Bello Yahaya"
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                    size={18}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {(error || validationError) && (
              <div className="flex items-center gap-2 text-error text-sm bg-error-container/20 p-3 rounded-xl">
                <AlertCircle size={16} />
                {validationError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full premium-gradient text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isSignup ? (
                <>
                  Create Account <ArrowRight size={20} />
                </>
              ) : (
                <>
                  Sign In <LogIn size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to={isSignup ? "/login" : "/signup"}
              className="text-primary text-sm font-semibold hover:underline"
            >
              {isSignup
                ? "Already have an account? Sign in"
                : "Don't have an account? Create one"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
