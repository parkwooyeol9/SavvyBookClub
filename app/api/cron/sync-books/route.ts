import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { syncBookCatalog } from "@/lib/books/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Allow local sync without secret; require secret in production.
    return process.env.NODE_ENV !== "production";
  }

  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");

  return bearer === secret || headerSecret === secret || querySecret === secret;
}

async function handleSync(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const catalog = await syncBookCatalog();
    revalidateTag("books", "max");
    revalidatePath("/");
    return NextResponse.json({
      ok: true,
      updatedAt: catalog.updatedAt,
      counts: Object.fromEntries(
        Object.entries(catalog.sections).map(([key, books]) => [
          key,
          books.length,
        ]),
      ),
    });
  } catch (error) {
    console.error("sync-books failed", error);
    return NextResponse.json(
      { error: "Sync failed", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
