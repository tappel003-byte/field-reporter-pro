import { createFileRoute } from "@tanstack/react-router";

type Room = { name: string; x: number; y: number; confidence?: number };
type RawRoom = {
  name?: unknown;
  x?: unknown;
  y?: unknown;
  position?: { x?: unknown; y?: unknown };
  confidence?: unknown;
};

const SYSTEM_PROMPT = `You analyze residential or commercial floor-plan images and extract printed room labels.
Return ONLY a JSON object of the form: {"rooms":[{"name":"<room label>","x":<0..1>,"y":<0..1>,"confidence":<0..1>}]}
Coordinate rules are critical:
- x,y MUST be the normalized center of the ACTUAL printed room label on the plan image.
- 0,0 is the top-left corner of the whole image; 1,1 is the bottom-right corner of the whole image.
- Do NOT put all labels on a bottom line, title block, legend, footer, or outside the floor-plan rooms.
- Do NOT estimate from a list of names; only include labels whose printed position you can see.
Label rules:
- Use the label as written, but use current terminology: Master Bedroom -> Primary Bedroom, Master Bath/Master Bathroom -> Primary Bathroom.
- Skip dimensions, door swings, north arrows, scale bars, page titles, drawing numbers, and non-room text.
- If a label appears multiple times, include each occurrence separately with its own visible position.
- If positions are uncertain, omit those rooms. If no reliable room labels exist, return {"rooms":[]}.
- Output ONLY the JSON object, no prose, no code fences.`;

function cleanRoomName(name: string) {
  return name
    .trim()
    .replace(/\bmaster bedroom\b/gi, "Primary Bedroom")
    .replace(/\bmaster bath(room)?\b/gi, "Primary Bathroom")
    .slice(0, 60);
}

function normalizeCoordinate(value: unknown) {
  let n: number;
  if (typeof value === "number") {
    n = value;
  } else if (typeof value === "string") {
    const raw = value.trim();
    const parsed = Number.parseFloat(raw.replace(/%$/, ""));
    if (!Number.isFinite(parsed)) return null;
    n = raw.endsWith("%") ? parsed / 100 : parsed;
  } else {
    return null;
  }

  if (!Number.isFinite(n)) return null;
  if (n > 1 && n <= 100) n = n / 100;
  if (n < -0.02 || n > 1.02) return null;
  return Math.min(1, Math.max(0, n));
}

function looksLikeBadCoordinateSet(rooms: Room[]) {
  if (rooms.length < 3) return false;
  const xs = rooms.map((r) => r.x);
  const ys = rooms.map((r) => r.y);
  const spreadX = Math.max(...xs) - Math.min(...xs);
  const spreadY = Math.max(...ys) - Math.min(...ys);
  const edgeYCount = ys.filter((y) => y <= 0.02 || y >= 0.98).length;
  const edgeXCount = xs.filter((x) => x <= 0.02 || x >= 0.98).length;
  const mostlyOnHorizontalLine = spreadY < 0.015 && spreadX > 0.25;
  const mostlyOnVerticalLine = spreadX < 0.015 && spreadY > 0.25;
  const mostlyOnEdge = edgeYCount / rooms.length >= 0.8 || edgeXCount / rooms.length >= 0.8;
  return mostlyOnHorizontalLine || mostlyOnVerticalLine || mostlyOnEdge;
}

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
            temperature: 0,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: [
                  { type: "text", text: "Extract room labels from this floor plan. Put each label at its actual printed position on the image, not in a summary line." },
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
              .map((raw: RawRoom) => {
                const x = normalizeCoordinate(raw.x ?? raw.position?.x);
                const y = normalizeCoordinate(raw.y ?? raw.position?.y);
                if (typeof raw.name !== "string" || x === null || y === null) return null;
                return {
                  name: cleanRoomName(raw.name),
                  x,
                  y,
                  confidence: typeof raw.confidence === "number" ? raw.confidence : undefined,
                };
              })
              .filter((r: Room | null): r is Room => !!r)
              .filter((r: Room) => r.name.length > 0);
          }
        } catch {
          // fall through to empty rooms
        }

        if (looksLikeBadCoordinateSet(rooms)) {
          return new Response(
            JSON.stringify({
              rooms: [],
              rejected: true,
              error: "Auto-scan found room names but their positions were unreliable, so nothing was placed. Use Manual rooms for this plan.",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(JSON.stringify({ rooms }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
