import { get, put } from "@vercel/blob";

const PREFIX = "savvy-book-club/";

export function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Shared catalog store. Vercel Blob when BLOB_READ_WRITE_TOKEN is set, otherwise a no-op. */
export async function readSharedText(name: string): Promise<string | null> {
  if (!blobEnabled()) return null;
  try {
    const result = await get(`${PREFIX}${name}`, {
      access: "private",
      useCache: false,
    });
    if (!result?.stream) return null;
    return await new Response(result.stream).text();
  } catch (error) {
    console.error("Blob read failed", name, error);
    return null;
  }
}

export async function writeSharedText(name: string, body: string): Promise<boolean> {
  if (!blobEnabled()) return false;
  try {
    await put(`${PREFIX}${name}`, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return true;
  } catch (error) {
    console.error("Blob write failed", name, error);
    return false;
  }
}
