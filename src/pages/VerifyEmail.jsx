import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { verifyEmail } from "../api/auth.api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [formData, setFormData] = useState({ email: emailFromQuery, otp: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await verifyEmail(formData);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">QuizFlow AI</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Verify your email</h1>
          <p className="text-sm text-gray-500 mb-6">
            We've sent a 6-digit code to your email. Enter it below to activate your account.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-green-50 border border-green-100 text-sm text-green-600">
              Email verified! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">OTP Code</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
                maxLength={6}
                placeholder="123456"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm tracking-widest text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Wrong email?{" "}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
              Go back
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;