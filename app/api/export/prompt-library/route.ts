import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getBrand } from "@/lib/brand";
import { buildPromptLibraryDoc, toBuffer } from "@/lib/docx-export";

export async function GET(_req: NextRequest) {
  const userId = await getCurrentUserId();
  if (userId === null) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const brand = await getBrand(userId);
  const buffer = await toBuffer(buildPromptLibraryDoc(brand));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="upforge-master-prompt-library.docx"`,
    },
  });
}
