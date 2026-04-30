import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import type { JSX } from "react";

const API_URL = "https://auraai-backend-6a8n.onrender.com";

export default function Signup(): JSX.Element {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    alert("Account created successfully. Please log in.");
    nav("/Login");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-neutral-400">Start your Aura workspace.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSignup}>
          <Field label="Name">
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>

        <div className="mt-4 text-sm text-neutral-400">
          Already have an account?{" "}
          <Link className="text-white underline" to="/login">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label className="block">
      <div className="text-sm text-neutral-300">{props.label}</div>
      <div className="mt-2">{props.children}</div>
    </label>
  );
}