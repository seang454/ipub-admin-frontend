import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const target = "https://admin.docuhub.me/api/v1/media";

  try {
    // Forward Authorization and content-type (boundary) if present
    const forwardHeaders = new Headers();
    const auth = req.headers.get("authorization");
    if (auth) forwardHeaders.set("authorization", auth);

    const contentType = req.headers.get("content-type");
    if (contentType) forwardHeaders.set("content-type", contentType);

    // Forward body stream directly to upstream
    const upstream = await fetch(target, {
      method: "POST",
      headers: forwardHeaders,
      body: req.body,
    });

    const body = await upstream.text();
    const res = new NextResponse(body, {
      status: upstream.status,
      statusText: upstream.statusText,
    });

    // Forward upstream content-type (likely application/json)
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType)
      res.headers.set("content-type", upstreamContentType);

    return res;
  } catch (err) {
    return NextResponse.json(
      { message: "Proxy error", error: String(err) },
      { status: 500 }
    );
  }
}
