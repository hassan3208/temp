import React from "react";

export default function WhatsAppButton() {
  const phone = "923230825561"; // international format without +
  const href = `https://wa.me/${phone}?text=${encodeURIComponent("Hello! I have a question about Rangista.")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-6 w-6"
        role="img"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M19.11 17.78a4.73 4.73 0 0 1-2.03-.5c-.63-.3-1.34-.74-2.09-1.49-.75-.75-1.18-1.46-1.49-2.09a4.73 4.73 0 0 1-.5-2.03c0-.31.18-.61.41-.83l.59-.58c.25-.25.63-.33.95-.2c.49.19 1.1 1.19 1.23 1.7c.11.43-.14.79-.45 1.1l-.24.24c-.12.12-.15.31-.08.47c.18.41.59 1.08 1.23 1.72c.64.64 1.3 1.05 1.72 1.23c.16.07.35.04.47-.08l.24-.24c.31-.31.67-.56 1.1-.45c.51.13 1.51.74 1.7 1.23c.13.32.05.7-.2.95l-.58.59c-.22.23-.52.41-.83.41Z"
        />
        <path
          fill="currentColor"
          d="M16 3C9.37 3 4 8.37 4 15c0 2.4.69 4.63 1.88 6.52L5 29l7.66-.84C14.6 28.31 15.28 28.4 16 28.4c6.63 0 12-5.37 12-12S22.63 3 16 3Zm0 2c5.52 0 10 4.48 10 10s-4.48 10-10 10c-.64 0-1.27-.06-1.88-.18l-.39-.08l-.39.04l-4.16.46l.44-4.07l.05-.39l-.2-.34C8.38 19.09 8 17.59 8 16C8 9.48 10.48 5 16 5Z"
        />
      </svg>
    </a>
  );
}
