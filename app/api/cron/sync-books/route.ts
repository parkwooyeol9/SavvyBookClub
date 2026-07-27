import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { syncBookCatalog } from "@/lib/books/cache";
import { syncBrunchReviews } from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Allow enough time for multi-site HTML crawls. */
export const maxDuration = 60;

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
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
    const [catalog, brunchReviews] = await Promise.all([
      syncBookCatalog(),
      syncBrunchReviews(),
    ]);
    revalidateTag("books", "max");
    revalidateTag("brunch", "max");
    revalidatePath("/");
    revalidatePath("/reviews");
    return NextResponse.json({
      ok: true,
      updatedAt: catalog.updatedAt,
      updatedAtKst: catalog.updatedAtKst,
      schedule: "매일 09:00 Asia/Seoul (Cron UTC 00:00)",
      counts: {
        ...Object.fromEntries(
          Object.entries(catalog.sections).map(([key, books]) => [
            key,
            books.length,
          ]),
        ),
        bookNews: catalog.bookNews.length,
        brunchReviews: brunchReviews.length,
      },
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
