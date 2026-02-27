import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import type { JSX } from "react";
import { useState } from "react";
import { getUser, setLoggedIn } from "../components/localAuth";

export default function Login(): JSX.Element {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-neutral-400">Log in to your workspace.</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Field label="Email">
            <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button
            type="submit"
            className="w-full"
            onClick={() => {
              const user = getUser();
              if (!user) return alert("No user found. Please sign up first.");
              if (user.email !== email || user.password !== password) return alert("Invalid email or password");
              setLoggedIn(email);
              nav("/app/generation");
            }}
          >
            Log in
          </Button>
        </form>

        <div className="mt-4 text-sm text-neutral-400">
          No account?{" "}
          <Link className="text-white underline" to="/signup">
            Sign up
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
