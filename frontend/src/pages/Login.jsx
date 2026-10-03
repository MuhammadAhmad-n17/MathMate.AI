import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("All fields are required.");
    setError("");
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-900/20 blur-[150px] rounded-full"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-indigo-800/10 blur-[150px] rounded-full"></div>
      </div>
      <Card className="w-full max-w-md z-10 border-gray-800 bg-gray-900/80 backdrop-blur-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400 tracking-tight">
            MathMate<span className="text-cyan-400">.AI</span>
          </h1>
          <p className="text-gray-400 mt-2">Welcome back. Enter your credentials.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Button className="w-full mt-6" type="submit" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-gray-500 mt-8 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
