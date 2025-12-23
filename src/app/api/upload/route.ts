import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const fileName = body.fileName ?? "file";
  const previewUrl = `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80&sig=${fileName}`;
  return NextResponse.json({
    uploadUrl: `https://uploads.mock.darunow/${fileName}?signature=mocked`,
    previewUrl,
  });
}
