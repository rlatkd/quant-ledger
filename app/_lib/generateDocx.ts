import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  ImageRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlign,
  HeightRule,
} from "docx";
import type { Receipt } from "./types";

export interface ExportInfo {
  name: string;
  studentId: string;
  cardNumber: string;
  reason: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.`;
}

function formatAmount(n: number) {
  return n.toLocaleString("ko-KR");
}

const border = {
  top: { style: BorderStyle.SINGLE, size: 6 },
  bottom: { style: BorderStyle.SINGLE, size: 6 },
  left: { style: BorderStyle.SINGLE, size: 6 },
  right: { style: BorderStyle.SINGLE, size: 6 },
};

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

function cell(text: string, opts?: { bold?: boolean; align?: string; width?: number; shade?: boolean }) {
  return new TableCell({
    borders: border,
    verticalAlign: VerticalAlign.CENTER,
    width: opts?.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts?.shade ? { fill: "D9D9D9" } : undefined,
    children: [
      new Paragraph({
        alignment: (opts?.align ?? AlignmentType.CENTER) as typeof AlignmentType[keyof typeof AlignmentType],
        children: [new TextRun({ text, bold: opts?.bold ?? false, size: 20, font: "맑은 고딕" })],
      }),
    ],
  });
}

export async function generateDocx(receipt: Receipt, info: ExportInfo, signatureDataUrl?: string): Promise<Blob> {
  const items = receipt.receipt_items ?? [];

  // 사용상세내역 텍스트
  const detailLines: string[] = [`${receipt.store_name}`];
  items.forEach((item) => {
    detailLines.push(`- ${item.menu_name}/${item.quantity}/${formatAmount(item.total_price)}`);
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
          },
        },
        children: [
          // 이름 학번 (우측 상단)
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: `${info.name} ${info.studentId}`, size: 20, font: "맑은 고딕" })],
          }),

          // 제목
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: "개인카드 사용 사유서", size: 44, bold: true, font: "맑은 고딕" })],
          }),
          new Paragraph({ text: "" }),

          // 섹션1 헤더
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: "□  개인카드 사용 내역", size: 24, bold: true, font: "맑은 고딕" })],
          }),

          // 사용 내역 테이블
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                height: { value: 400, rule: HeightRule.ATLEAST },
                children: [
                  cell("연번", { bold: true, shade: true, width: 700 }),
                  cell("카드사용일", { bold: true, shade: true, width: 1500 }),
                  cell("금액", { bold: true, shade: true, width: 1400 }),
                  cell("카드번호", { bold: true, shade: true, width: 3000 }),
                  cell("사용처", { bold: true, shade: true }),
                ],
              }),
              new TableRow({
                height: { value: 400, rule: HeightRule.ATLEAST },
                children: [
                  cell("1"),
                  cell(formatDate(receipt.receipt_date)),
                  cell(formatAmount(receipt.total_amount)),
                  cell(info.cardNumber),
                  cell(receipt.store_name, { align: AlignmentType.LEFT }),
                ],
              }),
              // 빈 행
              new TableRow({
                height: { value: 400, rule: HeightRule.ATLEAST },
                children: [cell(""), cell(""), cell(""), cell(""), cell("")],
              }),
              // 합계 행
              new TableRow({
                height: { value: 400, rule: HeightRule.ATLEAST },
                children: [
                  new TableCell({
                    borders: border,
                    columnSpan: 2,
                    verticalAlign: VerticalAlign.CENTER,
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "합계", bold: true, size: 20, font: "맑은 고딕" })] })],
                  }),
                  cell(formatAmount(receipt.total_amount), { bold: true }),
                  cell(""),
                  cell(""),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "" }),

          // 섹션2 헤더
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: "□  개인카드 사용 사유", size: 24, bold: true, font: "맑은 고딕" })],
          }),

          // 사유 박스
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                height: { value: 800, rule: HeightRule.ATLEAST },
                children: [
                  new TableCell({
                    borders: border,
                    children: [
                      new Paragraph({
                        spacing: { before: 100, after: 100 },
                        children: [new TextRun({ text: info.reason, size: 20, font: "맑은 고딕" })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "" }),

          // 섹션3 헤더
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: "□  사용상세내역  (사용처가 식사/음주 관련 업종일 경우 작성)", size: 24, bold: true, font: "맑은 고딕" })],
          }),

          // 상세내역 박스
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                height: { value: 800, rule: HeightRule.ATLEAST },
                children: [
                  new TableCell({
                    borders: border,
                    children: detailLines.map((line) =>
                      new Paragraph({
                        children: [new TextRun({ text: line, size: 20, font: "맑은 고딕" })],
                      })
                    ),
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // 날짜
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: formatDate(receipt.receipt_date).replace(/\.$/, "").replace(/\./g, " . "), size: 22, font: "맑은 고딕" })],
          }),

          // 서명
          new Table({
            width: { size: 4000, type: WidthType.DXA },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorder,
                    width: { size: 2000, type: WidthType.DXA },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "사용자 :", size: 24, bold: true, font: "맑은 고딕" })] })],
                  }),
                  new TableCell({
                    borders: { ...noBorder, bottom: { style: BorderStyle.SINGLE, size: 6 } },
                    width: { size: 2000, type: WidthType.DXA },
                    children: [
                      signatureDataUrl
                        ? new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new ImageRun({
                                data: signatureDataUrl.replace(/^data:image\/png;base64,/, ""),
                                transformation: { width: 80, height: 35 },
                                type: "png",
                              }),
                            ],
                          })
                        : new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: info.name, size: 24, font: "맑은 고딕" })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
