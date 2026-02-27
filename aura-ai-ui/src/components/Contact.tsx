// Contact.tsx
import type { JSX } from "react";
import { useState } from "react";
import GradientButton from "./GradientButton";

// Define a type for the form data for type safety
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
    // Full-width section for background and page padding
    <section className="w-full bg-black py-20 px-[104px]">
      {/* Constrained width container for the title */}
      <div className="mx-auto max-w-[1440px]">
        <h2 className="font-bricolage text-center text-[36px] leading-[40px] font-bold text-white mb-16">
          Get In Touch
        </h2>
      </div>

      {/* Main fixed-size container for the contact content */}
      <div
        className="
          mx-auto
          w-[896px] max-w-[896px]
          h-[566px]
          flex
        "
      >
        {/* Grid layout inside the fixed container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full">
          {/* LEFT COLUMN: Contact Information */}
          <div className="flex flex-col justify-center">
            {/* Subtitle with specific height */}
            <h3 className="h-7 text-xl font-semibold text-white leading-7 overflow-hidden">
              We'd love to hear from you
            </h3>
            <p className="text-sm leading-relaxed text-white/65 mt-4">
              Whether you have a question about features, pricing, or anything
              else, our team is ready to answer all your questions.
            </p>

            <div className="space-y-4 mt-8">
              {/* Email */}
              <div className="flex items-center gap-4">
                <span className="text-2xl text-violet-400">✉</span>
                <a
                  href="mailto:hello@auraaai.com"
                  className="text-sm text-white/80 hover:text-white transition"
                >
                  hello@auraaai.com
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4">
                <span className="text-2xl text-violet-400">📞</span>
                <a
                  href="tel:+15551234567"
                  className="text-sm text-white/80 hover:text-white transition"
                >
                  +1 (555) 123 - 4567
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Contact Form with custom styling */}
          <div
            className="
              flex items-center justify-center
              w-[392px] h-[418px]
              p-8
              rounded-2xl
            "
            style={{
              border: "1px solid #C6A6F71A",
              background:
                "linear-gradient(135deg, rgba(43, 20, 76, 0.3) 0%, rgba(83, 44, 134, 0.2) 100%)",
            }}
          >
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Name Input */}
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your Name"
                required
                className="
                  w-full
                  px-4 py-2
                  bg-white/10 border border-white/20 rounded-lg
                  text-sm text-white placeholder-white/50
                  focus:outline-none focus:ring-2 focus:ring-violet-500
                  transition
                "
              />

              {/* Email Input */}
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your Email"
                required
                className="
                  w-full
                  px-4 py-2
                  bg-white/10 border border-white/20 rounded-lg
                  text-sm text-white placeholder-white/50
                  focus:outline-none focus:ring-2 focus:ring-violet-500
                  transition
                "
              />

              {/* Message Textarea */}
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Your Message"
                rows={4}
                required
                className="
                  w-full
                  px-4 py-2
                  bg-white/10 border border-white/20 rounded-lg
                  text-sm text-white placeholder-white/50 resize-none
                  focus:outline-none focus:ring-2 focus:ring-violet-500
                  transition
                "
              />

              {/* Submit Button */}
              <GradientButton
                type="submit"
                className="
                  w-full
                  rounded-lg bg-violet-700/60 px-4 py-2
                  text-sm font-semibold text-white
                  shadow-lg shadow-violet-900/30
                  hover:bg-violet-700
                  transition
                "
              >
                Send Message
              </GradientButton>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}