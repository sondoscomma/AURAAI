import type { JSX } from "react";
import { useState } from "react";

/**
 * Validate an image source is valid.
 * - For data URLs: checks that the base64 portion is substantial (>100 chars)
 * - For HTTP URLs (from DB image endpoint): checks it's a valid URL
 * - For relative paths, blob: URLs: checks minimum length
 */
export function isValidImageSrc(src: string | null | undefined): boolean {
  if (!src || typeof src !== "string") return false;
  // Accept data URLs with substantial base64 content
  if (src.startsWith("data:image/")) {
    const base64Part = src.split(",")[1];
    return !!base64Part && base64Part.length > 100;
  }
  // Accept HTTP(S) URLs from the backend image endpoint
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src.length > 10;
  }
  // Accept regular URLs (relative paths like /assets/..., blob:)
  if (src.startsWith("/") || src.startsWith("blob:")) {
    return src.length > 5;
  }
  return false;
}

/**
 * Validate that a string is a valid base64 data URL from the API.
 * Must start with "data:image/" and have substantial base64 content.
 */
export function isValidBase64Image(src: string | null | undefined): boolean {
  if (!src || typeof src !== "string") return false;
  // HTTP URLs from the DB image endpoint are always valid
  if (src.startsWith("http://") || src.startsWith("https://")) return true;
  if (!src.startsWith("data:image/")) return false;
  const base64Part = src.split(",")[1];
  return !!base64Part && base64Part.length > 100;
}

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  style: React.CSSProperties;
  fallbackIcon?: string;
  className?: string;
}

/**
 * Safely display an image with:
 * - Loading state (shows "Loading..." placeholder)
 * - Error state (shows fallback icon instead of broken image)
 * - Source validation (won't render invalid/corrupt data URLs)
 */
export default function SafeImage(props: SafeImageProps): JSX.Element {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Reset state when src changes
  const srcKey = props.src?.slice(0, 50) || "";

  if (!props.src || !isValidImageSrc(props.src) || error) {
    return (
      <div
        key={srcKey}
        style={{
          ...props.style,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(43,20,76,0.3)",
          borderRadius: props.style.borderRadius || 8,
          fontSize: props.fallbackIcon ? undefined : 36,
          color: "rgba(198,166,247,0.4)",
        }}
      >
        {props.fallbackIcon || "\uD83D\uDDBC\uFE0F"}
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div
          key={`loading-${srcKey}`}
          style={{
            ...props.style,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(43,20,76,0.3)",
            borderRadius: props.style.borderRadius || 8,
            fontSize: 14,
            color: "rgba(198,166,247,0.6)",
          }}
        >
          Loading...
        </div>
      )}
      <img
        key={`img-${srcKey}`}
        src={props.src}
        alt={props.alt}
        className={props.className}
        crossOrigin="anonymous"
        style={{
          ...props.style,
          display: loaded ? undefined : "none",
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
}
