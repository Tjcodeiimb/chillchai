import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getBrand } from "@/lib/brand";
import { buildPromptLibraryDoc, toBuffer } from "@/lib/docx-export";

export async function GET(req: NextRequest) {
  const unauthorized = requireAuth(req);
  if (unauthorized) return unauthorized;

  const brand = await getBrand();
  const buffer = await toBuffer(buildPromptLibraryDoc(brand));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="upforge-master-prompt-library.docx"`,
    },
  });
}
