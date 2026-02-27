import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import type { JSX } from "react";
import { useState } from "react";
import { saveUser, setLoggedIn } from "../components/localAuth";

export default function Signup(): JSX.Element {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-neutral-400">Start your Aura workspace.</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Field label="Name">
            <Input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
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
              if (!name || !email || !password) return alert("Please fill all fields");
              saveUser({ name, email, password });
              setLoggedIn(email);
              nav("/app/generation");
            }}
          >
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
