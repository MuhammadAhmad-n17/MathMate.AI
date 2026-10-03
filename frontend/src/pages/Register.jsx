import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { authService } from "../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return setError("All fields are required.");
    setError("");
    setLoading(true);

    try {
      await authService.register({ username, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-cyan-900/10 blur-[150px] rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-indigo-900/20 blur-[150px] rounded-full"></div>
      </div>
      <Card className="w-full max-w-md z-10 border-gray-800 bg-gray-900/80 backdrop-blur-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-400 tracking-tight">
            Join MathMate<span className="text-indigo-400">.AI</span>
          </h1>
          <p className="text-gray-400 mt-2">Unlock the future of learning.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johndoe" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Button className="w-full mt-6" type="submit" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-500 mt-8 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}
