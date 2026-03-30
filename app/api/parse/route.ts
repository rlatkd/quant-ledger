import type { NextRequest } from "next/server";
import type { ParsedReceipt } from "../../_lib/types";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const image = formData.get("image") as File | null;

  if (!image) {
    return Response.json({ error: "이미지가 없습니다" }, { status: 400 });
  }

  // 1. 이미지를 base64로 변환
  const bytes = await image.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = image.type;

  // 2. Google Vision API로 텍스트 추출
  const visionRes = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    }
  );

  if (!visionRes.ok) {
    return Response.json({ error: "OCR 실패" }, { status: 500 });
  }

  const visionData = await visionRes.json();
  const rawText: string =
    visionData.responses?.[0]?.fullTextAnnotation?.text ?? "";

  if (!rawText) {
    return Response.json({ error: "텍스트를 인식하지 못했습니다" }, { status: 422 });
  }

  // 3. Gemini Flash로 구조화 파싱
  const prompt = `다음은 영수증 OCR 텍스트입니다. JSON 형식으로 파싱해주세요.

OCR 텍스트:
${rawText}

응답은 반드시 아래 JSON 형식만 출력하세요 (설명 없이):
{
  "store_name": "상호명",
  "receipt_date": "YYYY-MM-DD",
  "total_amount": 숫자,
  "items": [
    { "menu_name": "품명", "quantity": 수량, "unit_price": 단가, "total_price": 금액 }
  ]
}

- receipt_date를 모르면 오늘 날짜(${new Date().toISOString().split("T")[0]})를 사용하세요
- 금액은 숫자만 (원 기호, 콤마 제외)`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!geminiRes.ok) {
    return Response.json({ error: "파싱 실패" }, { status: 500 });
  }

  const geminiData = await geminiRes.json();
  const text: string =
    geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // JSON 추출 (마크다운 코드블록 제거)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "파싱 결과를 읽을 수 없습니다" }, { status: 422 });
  }

  const parsed: ParsedReceipt = JSON.parse(jsonMatch[0]);

  return Response.json({ ...parsed, raw_text: rawText });
}
