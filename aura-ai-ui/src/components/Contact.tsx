// Contact.tsx
import type { JSX } from "react";
import { useState } from "react";

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function Contact(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Thank you for your message! We will get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section
      className="w-full py-20 px-[104px]"
      style={{
        background: "linear-gradient(135deg, #161616 0%, rgba(43, 20, 76, 0.5) 100%)",
      }}
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          className="text-center text-[36px] leading-[40px] font-bold mb-4"
          style={{ color: "#C6A6F7" }}
        >
          Get In Touch
        </h2>
        <p
          className="text-center text-[16px] leading-[26px] mb-16 mx-auto max-w-[600px]"
          style={{ color: "#E5E5E5" }}
        >
          Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
        </p>
      </div>

      <div className="mx-auto max-w-[1100px] flex flex-col lg:flex-row gap-16 items-stretch">
        {/* LEFT COLUMN: Contact Information */}
        <div className="flex-1 flex flex-col justify-center min-w-[300px]">
          <h3
            className="text-xl font-semibold mb-4"
            style={{ color: "#FFFFFF" }}
          >
            We'd love to hear from you
          </h3>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "#E5E5E5" }}
          >
            Reach out to us through any of the channels below. We typically respond within 24 hours.
          </p>

          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#2D2A3D",
                  borderRadius: 12,
                  color: "#C6A6F7",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                ✉
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                  Email
                </div>
                <a
                  href="mailto:hello@auraaai.com"
                  className="text-sm hover:underline"
                  style={{ color: "#E5E5E5" }}
                >
                  hello@auraaai.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#2D2A3D",
                  borderRadius: 12,
                  color: "#C6A6F7",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                📞
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                  Phone
                </div>
                <a
                  href="tel:+15551234567"
                  className="text-sm hover:underline"
                  style={{ color: "#E5E5E5" }}
                >
                  +1 (555) 123 - 4567
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#2D2A3D",
                  borderRadius: 12,
                  color: "#C6A6F7",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                📍
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                  Location
                </div>
                <span className="text-sm" style={{ color: "#E5E5E5" }}>
                  San Francisco, CA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Contact Form */}
        <div
          className="flex-1 p-8"
          style={{
            backgroundColor: "#1E1B2E",
            border: "1px solid #2D2A3D",
            borderRadius: 16,
          }}
        >
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Name Input */}
            <div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your Name"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  backgroundColor: "#1E1B2E",
                  border: "1px solid #2D2A3D",
                  borderRadius: 8,
                  color: "#E5E5E5",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C6A6F7";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#2D2A3D";
                }}
              />
            </div>

            {/* Email Input */}
            <div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your Email"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  backgroundColor: "#1E1B2E",
                  border: "1px solid #2D2A3D",
                  borderRadius: 8,
                  color: "#E5E5E5",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C6A6F7";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#2D2A3D";
                }}
              />
            </div>

            {/* Message Textarea */}
            <div>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Your Message"
                rows={5}
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  backgroundColor: "#1E1B2E",
                  border: "1px solid #2D2A3D",
                  borderRadius: 8,
                  color: "#E5E5E5",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  minHeight: 140,
                  transition: "border-color 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#C6A6F7";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#2D2A3D";
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px 24px",
                background: "linear-gradient(135deg, #C6A6F7 0%, #532C86 100%)",
                border: "none",
                borderRadius: 8,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(198, 166, 247, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}