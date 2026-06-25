import { createFileRoute } from "@tanstack/react-router";

type Room = { name: string; x: number; y: number; confidence?: number };

const SYSTEM_PROMPT = `You analyze residential or commercial floor-plan images and extract printed room labels.
Return ONLY a JSON object of the form: {"rooms":[{"name":"<room label>","x":<0..1>,"y":<0..1>,"confidence":<0..1>}]}
Rules:
- x,y are the normalized center of the label within the image (0,0 = top-left, 1,1 = bottom-right).
- Use the label EXACTLY as written (e.g. "Master Bedroom", "Kitchen", "Bath 2", "Garage"). Title-case if all caps.
- Skip dimensions, door swings, north arrows, scale bars, and non-room text.
- If a label appears multiple times, include each occurrence separately.
- If no readable room labels exist, return {"rooms":[]}. Do not invent rooms.
- Output ONLY the JSON object, no prose, no code fences.`;

export const Route = createFileRoute("/api/detect-rooms")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: { imageDataUrl?: string };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const imageDataUrl = body.imageDataUrl;
        if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
          return new Response(JSON.stringify({ error: "imageDataUrl required (data:image/...)" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: [
                  { type: "text", text: "Extract all room labels from this floor plan." },
                  { type: "image_url", image_url: { url: imageDataUrl } },
                ],
              },
            ],
          }),
        });

        if (!upstream.ok) {
          const text = await upstream.text();
          return new Response(
            JSON.stringify({ error: `AI gateway ${upstream.status}`, detail: text.slice(0, 500) }),
            { status: upstream.status, headers: { "Content-Type": "application/json" } },
          );
        }

        const json = (await upstream.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.message?.content ?? "";

        let rooms: Room[] = [];
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed?.rooms)) {
            rooms = parsed.rooms
              .filter(
                (r: unknown): r is Room =>
                  !!r &&
                  typeof (r as Room).name === "string" &&
                  typeof (r as Room).x === "number" &&
                  typeof (r as Room).y === "number",
              )
              .map((r: Room) => ({
                name: r.name.trim().slice(0, 60),
                x: Math.min(1, Math.max(0, r.x)),
                y: Math.min(1, Math.max(0, r.y)),
                confidence: typeof r.confidence === "number" ? r.confidence : undefined,
              }))
              .filter((r) => r.name.length > 0);
          }
        } catch {
          // fall through to empty rooms
        }

        return new Response(JSON.stringify({ rooms }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
