// src/pages/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Loader2, ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { login, resetPassword } from "../lib/appwrite";
import { toast } from "react-toastify";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Password visibility state
  const [showForgotPassword, setShowForgotPassword] = useState(false); // Toggle forgot password UI
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          autoClose: 2000,
        });
        navigate("/admin");
      } else {
        toast.error("Invalid email or password");
        setError("Invalid email or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient-x">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl transition-all duration-300 hover:shadow-2xl hover:bg-white/15">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="bg-white/20 p-3 sm:p-4 rounded-full mb-3 sm:mb-4 animate-pulse">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent text-center">
            Admin Portal
          </h1>
        </div>

        {!showForgotPassword ? (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 sm:pl-12 pr-4 py-4 sm:py-6 bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-2 focus:ring-white/20 rounded-xl transition-all text-sm sm:text-base"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 sm:pl-12 pr-12 py-4 sm:py-6 bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-2 focus:ring-white/20 rounded-xl transition-all text-sm sm:text-base"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-400/20 border border-red-400/30 rounded-lg text-red-100 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-4 sm:py-6 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-base sm:text-lg font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl border border-white/20 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Loading...</span>
                </div>
              ) : (
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Unlock Dashboard
                </span>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-white/80 hover:text-white text-sm sm:text-base underline transition-colors"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          /* Forgot Password UI */
          <div className="space-y-4 sm:space-y-6">
            <p className="text-white/90 text-sm sm:text-base text-center">
              Enter your email to receive a password reset link.
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-4 sm:py-6 bg-white/5 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-2 focus:ring-white/20 rounded-xl transition-all text-sm sm:text-base"
                required
              />
            </div>
            <Button
              type="button"
              onClick={async () => {
                try {
                  const resetUrl = `${window.location.origin}/reset-password`; // ডায়নামিক URL

                  await resetPassword(email, resetUrl);
                  toast.success("Password reset link sent to your email!");
                  setShowForgotPassword(false);
                } catch (error) {
                  toast.error("Failed to send reset link.");
                  setError("Failed to send reset link. Please try again.");
                }
              }}
              className="w-full py-4 sm:py-6 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-base sm:text-lg font-semibold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl border border-white/20"
            >
              Send Reset Link
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-white/80 hover:text-white text-sm sm:text-base underline transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};