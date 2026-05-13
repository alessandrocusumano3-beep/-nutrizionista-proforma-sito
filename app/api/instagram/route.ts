import { NextResponse } from "next/server";

export const runtime = "nodejs";

const fallbackProfile = {
  username: "@dott.ssa_valentina_trunfio",
  biography: "",
  profilePictureUrl: ""
};

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
};

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return NextResponse.json(
      { profile: fallbackProfile, posts: [], error: "Instagram API non configurata" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const profileResponse = await fetch(
      `https://graph.facebook.com/v20.0/${userId}?fields=username,biography,profile_picture_url&access_token=${token}`,
      { next: { revalidate: 900 } }
    );
    const mediaResponse = await fetch(
      `https://graph.facebook.com/v20.0/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&limit=9&access_token=${token}`,
      { next: { revalidate: 900 } }
    );

    if (!profileResponse.ok || !mediaResponse.ok) {
      return NextResponse.json(
        { profile: fallbackProfile, posts: [], error: "Instagram API non disponibile" },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const profilePayload = (await profileResponse.json()) as {
      username?: string;
      biography?: string;
      profile_picture_url?: string;
    };
    const mediaPayload = (await mediaResponse.json()) as { data?: InstagramMedia[] };

    const posts =
      mediaPayload.data
        ?.filter((post) => post.media_url || post.thumbnail_url)
        .map((post) => ({
          id: post.id,
          permalink: post.permalink ?? "https://www.instagram.com/dott.ssa_valentina_trunfio/",
          mediaUrl: post.media_type === "VIDEO" ? (post.thumbnail_url ?? post.media_url ?? "") : (post.media_url ?? ""),
          caption: post.caption ?? "Post Instagram"
        }))
        .slice(0, 9) ?? [];

    return NextResponse.json(
      {
        profile: {
          username: profilePayload.username ? `@${profilePayload.username}` : fallbackProfile.username,
          biography: profilePayload.biography ?? fallbackProfile.biography,
          profilePictureUrl: profilePayload.profile_picture_url ?? fallbackProfile.profilePictureUrl
        },
        posts
      },
      { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=3600" } }
    );
  } catch {
    return NextResponse.json(
      { profile: fallbackProfile, posts: [], error: "Errore nel recupero feed Instagram" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
