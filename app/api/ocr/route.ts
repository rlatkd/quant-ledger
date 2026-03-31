import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const image = formData.get("image") as File | null;

  if (!image) {
    return Response.json({ error: "이미지가 없습니다" }, { status: 400 });
  }

  const bytes = await image.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const visionRes = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      }),
    }
  );

  const visionData = await visionRes.json();

  if (!visionRes.ok || visionData.error) {
    console.error("[OCR] Vision API error:", JSON.stringify(visionData));
    return Response.json({ error: "OCR 실패" }, { status: 500 });
  }

  const rawText: string =
    visionData.responses?.[0]?.fullTextAnnotation?.text ?? "";

  if (!rawText) {
    return Response.json({ error: "텍스트를 인식하지 못했습니다" }, { status: 422 });
  }

  return Response.json({ rawText });
}
