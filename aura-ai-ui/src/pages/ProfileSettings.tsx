import type { JSX } from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SafeImage from "../components/SafeImage";

type Tab = "profile" | "history";

type UsedModel = {
  _id?: string;
  title: string;
  method: string;
  imageBase64?: string;
  imageUrl?: string;
  mimeType?: string;
  createdAt?: string;
  direction?: string | null;
  groupId?: string | null;
};

export default function ProfileSettings(): JSX.Element {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [defaultModel, setDefaultModel] = useState("");

  const [history, setHistory] = useState<UsedModel[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://auraai-backend-6a8n.onrender.com/api/models/history", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        let serverHistory: UsedModel[] = [];
        if (res.ok) {
          const data = await res.json();
          // Backend returns { data: [...], page, limit, total, totalPages }
          const items = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          serverHistory = items.map((item: any) => ({
            _id: item._id,
            title: item.title || "Untitled",
            method: item.method || "Unknown",
            imageUrl: item.imageUrl, // HTTP URL served from DB via /api/images/:id
            mimeType: item.mimeType || "image/png",
            direction: item.direction || null,
            groupId: item.groupId || null,
            createdAt: item.createdAt,
          }));
        }

        // Also load locally saved generation history
        let localHistory: UsedModel[] = [];
        try {
          const localRaw = localStorage.getItem("aura_generation_history");
          if (localRaw) {
            const localData = JSON.parse(localRaw);
            localHistory = localData.map((entry: { id?: string; image?: string; method?: string; title?: string; createdAt?: string; type?: string }) => ({
              _id: entry.id,
              title: entry.title || "Untitled",
              method: entry.method || "Unknown",
              // Local entries may have HTTP URLs or data URLs
              imageUrl: entry.image?.startsWith("http") ? entry.image : undefined,
              imageBase64: entry.image?.startsWith("data:") ? entry.image.replace(/^data:[^;]+;base64,/, "") : (entry.image && !entry.image.startsWith("http") ? entry.image : undefined),
              mimeType: entry.image?.startsWith("data:image/png") ? "image/png" : entry.image?.startsWith("data:image/jpeg") ? "image/jpeg" : "image/png",
              createdAt: entry.createdAt,
            }));
          }
        } catch {
          // Silently fail
        }

        // Merge: avoid duplicates by ID/time, server items first (they have proper imageUrl)
        const seenIds = new Set<string>();
        const merged: UsedModel[] = [];

        // Server history takes priority (has imageUrl from DB)
        for (const item of serverHistory) {
          const key = item._id || item.createdAt || Math.random().toString();
          if (!seenIds.has(key)) {
            seenIds.add(key);
            merged.push(item);
          }
        }

        // Add local items that aren't in server
        for (const item of localHistory) {
          const key = item._id || item.createdAt || Math.random().toString();
          if (!seenIds.has(key)) {
            seenIds.add(key);
            merged.push(item);
          }
        }

        setHistory(merged);
      } catch {
        // Try loading just local history as fallback
        try {
          const localRaw = localStorage.getItem("aura_generation_history");
          if (localRaw) {
            const localData = JSON.parse(localRaw);
            const localHistory: UsedModel[] = localData.map((entry: { id?: string; image?: string; method?: string; title?: string; createdAt?: string; type?: string }) => ({
              _id: entry.id,
              title: entry.title || "Untitled",
              method: entry.method || "Unknown",
              imageUrl: entry.image?.startsWith("http") ? entry.image : undefined,
              imageBase64: entry.image?.startsWith("data:") ? entry.image.replace(/^data:[^;]+;base64,/, "") : (entry.image && !entry.image.startsWith("http") ? entry.image : undefined),
              mimeType: entry.image?.startsWith("data:image/png") ? "image/png" : entry.image?.startsWith("data:image/jpeg") ? "image/jpeg" : "image/png",
              createdAt: entry.createdAt,
            }));
            setHistory(localHistory);
          } else {
            setHistory([]);
          }
        } catch {
          setHistory([]);
        }
      }
    }

    loadHistory();

    const savedProfile = localStorage.getItem("aura_profile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFirstName(profile.firstName ?? "");
        setLastName(profile.lastName ?? "");
        setEmail(profile.email ?? "");
        setBio(profile.bio ?? "");
        setEmailNotifications(profile.emailNotifications ?? true);
        setDarkMode(profile.darkMode ?? true);
        setDefaultModel(profile.defaultModel ?? "");
        setAvatar(profile.avatar || null);
      } catch {
        localStorage.removeItem("aura_profile");
      }
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  function saveProfile(): void {
    localStorage.setItem(
      "aura_profile",
      JSON.stringify({
        firstName,
        lastName,
        email,
        bio,
        emailNotifications,
        darkMode,
        defaultModel,
        avatar,
      })
    );

    alert("Profile saved");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#161616",
        color: "#EDEDED",
        fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
      }}
    >
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          background: "#2B144C",
          padding: "32px 36px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "linear-gradient(135deg,#C6A6F7,#532C86)",
              display: "grid",
              placeItems: "center",
            }}
          >
            ✎
          </div>
          <div style={{ fontSize: 22 }}>Aura AI</div>
        </div>

        <nav style={{ marginTop: 70, display: "flex", flexDirection: "column", gap: 16 }}>
          <SideButton icon="⌂" label="Home" onClick={() => nav("/app/generation")} />
          <SideButton icon="✣" label="Generate" onClick={() => nav("/app/generate-ai-model")} />
          <SideButton icon="▰" label="History" active={tab === "history"} onClick={() => setTab("history")} />
          <SideButton icon="●" label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
        </nav>

        <div style={{ flex: 1 }} />

        <div
          style={{
            border: "1px solid rgba(198,166,247,.25)",
            background: "rgba(198,166,247,.08)",
            borderRadius: 10,
            padding: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Avatar size={34} src={avatar ?? undefined} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>
              {firstName || lastName ? `${firstName} ${lastName}`.trim() : "New User"}
            </div>
            <div style={{ fontSize: 10, opacity: 0.6 }}>Free Plan</div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ padding: "42px 42px", overflowY: "auto" }}>
        {tab === "profile" ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 30 }}>Profile Settings</h1>
                <p style={{ margin: "8px 0 0", color: "rgba(237,237,237,.55)" }}>
                  Manage your account and preferences
                </p>
              </div>

              <button
                onClick={saveProfile}
                style={{
                  height: 48,
                  padding: "0 24px",
                  borderRadius: 9,
                  border: "none",
                  background: "linear-gradient(135deg,#C6A6F7,#532C86)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ▣ Save Changes
              </button>
            </div>

            <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr 330px", gap: 32 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <Panel title="Personal Information">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <Field label="First Name">
                      <Input value={firstName} onChange={setFirstName} placeholder="Enter first name" />
                    </Field>
                    <Field label="Last Name">
                      <Input value={lastName} onChange={setLastName} placeholder="Enter last name" />
                    </Field>
                  </div>

                  <Field label="Email Address">
                    <Input value={email} onChange={setEmail} placeholder="Enter email address" />
                  </Field>

                  <Field label="Bio">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      style={inputStyle({ height: 96, padding: "16px" })}
                    />
                  </Field>
                </Panel>

                <Panel title="Preferences">
                  <ToggleRow
                    title="Email Notifications"
                    subtitle="Receive updates about your projects"
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                  />

                  <ToggleRow
                    title="Dark Mode"
                    subtitle="Use dark theme interface"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />

                  <Field label="Default AI Model">
                    <Input value={defaultModel} onChange={setDefaultModel} placeholder="Select default model" />
                  </Field>
                </Panel>

                <Panel title="Security">
                  <ActionRow icon="🔒" title="Change Password" onClick={() => alert("Change password modal later")} />
                  <ActionRow icon="🛡" title="Two-Factor Authentication" subtitle="Add extra security to your account" onClick={() => alert("2FA setup later")} />
                </Panel>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <Panel>
                  <div style={{ textAlign: "center" }}>
                    <Avatar size={86} src={avatar ?? undefined} />
                    <h3 style={{ margin: "16px 0 0" }}>
                      {firstName || lastName ? `${firstName} ${lastName}`.trim() : "New User"}
                    </h3>
                    <p style={{ margin: 0, color: "rgba(237,237,237,.65)" }}>Free Plan</p>

                    <div
                      style={{
                        marginTop: 18,
                        padding: "12px",
                        borderRadius: 9,
                        background: "rgba(198,166,247,.16)",
                        fontSize: 13,
                      }}
                    >
                      Complete your profile to get started
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        marginTop: 16,
                        height: 42,
                        width: "100%",
                        borderRadius: 9,
                        border: "1px solid rgba(198,166,247,.35)",
                        background: "rgba(83,44,134,.25)",
                        color: "#EDEDED",
                        cursor: "pointer",
                      }}
                    >
                      Change Avatar
                    </button>
                  </div>
                </Panel>

                <Panel title="Usage Statistics">
                  <Stat label="Generations Used" value="0 / 1000" percent={0} />
                  <Stat label="Storage Used" value="0 / 10 GB" percent={0} />
                </Panel>
              </div>
            </div>
          </>
        ) : (
          <HistoryView history={history} />
        )}
      </main>
    </div>
  );
}

function HistoryView({ history }: { history: UsedModel[] }): JSX.Element {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 30 }}>My Work</h1>
      <p style={{ margin: "8px 0 32px", color: "rgba(237,237,237,.55)" }}>
        Your generated images are saved here from your account database.
      </p>

      {history.length === 0 ? (
        <Panel>
          <div style={{ textAlign: "center", padding: "50px 20px", color: "rgba(237,237,237,.5)" }}>
            No generated images yet.
          </div>
        </Panel>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {history.map((item, index) => {
            // Prefer imageUrl (HTTP URL from DB), fall back to base64 data URL
            const imageSrc = item.imageUrl || (item.imageBase64 ? `data:${item.mimeType || "image/png"};base64,${item.imageBase64}` : null);
            return (
              <div
                key={item._id ?? index}
                style={{
                  borderRadius: 12,
                  background: "rgba(43,20,76,.75)",
                  border: "1px solid rgba(198,166,247,.16)",
                  padding: 14,
                }}
              >
                {imageSrc && (
                  <SafeImage
                    src={imageSrc}
                    alt={item.title}
                    fallbackIcon="🖼️"
                    style={{
                      width: "100%",
                      height: 220,
                      objectFit: "contain",
                      borderRadius: 10,
                      background: "#161616",
                    }}
                  />
                )}

                <strong style={{ display: "block", marginTop: 12 }}>
                  {item.title}
                </strong>

                <div style={{ marginTop: 6, color: "rgba(237,237,237,.55)", fontSize: 13 }}>
                  Method: {item.method}
                </div>

                {item.createdAt && (
                  <div style={{ marginTop: 4, color: "rgba(237,237,237,.4)", fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SideButton(props: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      onClick={props.onClick}
      style={{
        height: 48,
        border: "none",
        borderRadius: 10,
        background: props.active ? "rgba(198,166,247,.13)" : "transparent",
        color: "#EDEDED",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 16px",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 15,
        opacity: props.active ? 1 : 0.75,
      }}
    >
      <span>{props.icon}</span>
      {props.label}
    </button>
  );
}

function Panel(props: { title?: string; children: React.ReactNode }): JSX.Element {
  return (
    <section
      style={{
        borderRadius: 14,
        border: "1px solid rgba(198,166,247,.12)",
        background: "rgba(43,20,76,.45)",
        padding: 24,
      }}
    >
      {props.title && (
        <h2 style={{ margin: "0 0 22px", fontSize: 18, color: "#C6A6F7" }}>{props.title}</h2>
      )}
      <div style={{ display: "grid", gap: 18 }}>{props.children}</div>
    </section>
  );
}

function Field(props: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label>
      <div style={{ fontSize: 13, marginBottom: 8, color: "rgba(237,237,237,.82)" }}>
        {props.label}
      </div>
      {props.children}
    </label>
  );
}

function Input(props: { value: string; onChange: (value: string) => void; placeholder?: string }): JSX.Element {
  return (
    <input
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder ?? ""}
      style={inputStyle()}
    />
  );
}

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%",
    minHeight: 46,
    borderRadius: 9,
    border: "1px solid rgba(198,166,247,.12)",
    background: "#161616",
    color: "#EDEDED",
    padding: "0 16px",
    outline: "none",
    boxSizing: "border-box",
    ...extra,
  };
}

function ToggleRow(props: {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: () => void;
}): JSX.Element {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 14 }}>{props.title}</div>
        <div style={{ fontSize: 12, color: "rgba(237,237,237,.45)" }}>{props.subtitle}</div>
      </div>

      <button
        onClick={props.onChange}
        style={{
          width: 42,
          height: 22,
          borderRadius: 999,
          border: "none",
          background: props.checked ? "#C6A6F7" : "rgba(237,237,237,.2)",
          cursor: "pointer",
          padding: 3,
          display: "flex",
          justifyContent: props.checked ? "flex-end" : "flex-start",
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            display: "block",
          }}
        />
      </button>
    </div>
  );
}

function ActionRow(props: {
  icon: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      onClick={props.onClick}
      style={{
        border: "none",
        background: "rgba(22,22,22,.25)",
        color: "#EDEDED",
        borderRadius: 10,
        padding: "18px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <span>
        {props.icon} {props.title}
        {props.subtitle && (
          <div style={{ marginLeft: 24, fontSize: 12, color: "rgba(237,237,237,.45)" }}>
            {props.subtitle}
          </div>
        )}
      </span>
      <span>›</span>
    </button>
  );
}

function Stat(props: { label: string; value: string; percent: number }): JSX.Element {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span>{props.label}</span>
        <strong>{props.value}</strong>
      </div>

      <div
        style={{
          marginTop: 9,
          height: 7,
          borderRadius: 999,
          background: "rgba(22,22,22,.5)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${props.percent}%`,
            height: "100%",
            background: "linear-gradient(90deg,#C6A6F7,#532C86)",
          }}
        />
      </div>
    </div>
  );
}

function Avatar({ size, src }: { size: number; src?: string }): JSX.Element {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: src
          ? `url(${src}) center/cover`
          : "radial-gradient(circle at 40% 30%, #EDEDED 0%, #C6A6F7 28%, #532C86 65%, #2B144C 100%)",
        margin: "0 auto",
      }}
    />
  );
}