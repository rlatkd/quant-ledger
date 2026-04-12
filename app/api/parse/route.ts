import type { NextRequest } from "next/server";
import type { ParsedReceipt } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin();
  if (forbidden) return forbidden;

  const formData = await req.formData();
  const image = formData.get("image") as File | null;

  if (!image) {
    return Response.json({ error: "이미지가 없습니다" }, { status: 400 });
  }

  const bytes = await image.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = image.type;

  const prompt = `이 이미지는 한국 식당 영수증입니다. 영수증 데이터를 JSON으로 추출해주세요.

응답은 반드시 아래 JSON 형식만 출력하세요 (설명 없이):
{
  "store_name": "상호명",
  "receipt_date": "YYYY-MM-DD",
  "total_amount": 숫자,
  "raw_text": "영수증 전체 텍스트",
  "items": [
    { "menu_name": "품명", "quantity": 수량, "unit_price": 단가, "total_price": 금액 }
  ]
}

규칙:
- 영수증 테이블에서 메뉴명/수량/금액 컬럼을 정확히 매핑하세요
- total_amount는 최종 결제 금액(부가세 포함)
- receipt_date를 모르면 오늘(${new Date().toISOString().split("T")[0]})
- 금액은 숫자만 (원, 콤마 제외)
- unit_price = total_price / quantity로 계산
- 부가세·합계 등 항목이 아닌 행은 items에 포함하지 마세요`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          },
        ],
      }),
    }
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.json().catch(() => ({}));
    console.error("[Parse] Gemini error:", JSON.stringify(err));
    return Response.json({ error: "파싱 실패" }, { status: 500 });
  }

  const geminiData = await geminiRes.json();
  const text: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "파싱 결과를 읽을 수 없습니다" }, { status: 422 });
  }

  const parsed: ParsedReceipt & { raw_text?: string } = JSON.parse(jsonMatch[0]);

  return Response.json(parsed);
}
