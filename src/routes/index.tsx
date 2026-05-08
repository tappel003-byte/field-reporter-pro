import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Distress Survey – Field Tool" },
      {
        name: "description",
        content:
          "Mobile-first distress survey app: floor plan pins, photos, descriptors, and CSV export.",
      },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { name: "theme-color", content: "#f4f0e8" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/survey.html"
      title="Distress Survey"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        margin: 0,
        padding: 0,
      }}
      allow="camera; clipboard-read; clipboard-write"
    />
  );
}
