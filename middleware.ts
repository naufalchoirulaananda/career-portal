import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl.clone();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = url.pathname;

  if (path === "/") {
    if (!session) {
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    } else {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (userData?.role === "admin") {
        url.pathname = "/admin";
      } else {
        url.pathname = "/user";
      }
      return NextResponse.redirect(url);
    }
  }

  if (
    !session &&
    (path.startsWith("/admin") ||
      path.startsWith("/user") ||
      path.startsWith("/apply"))
  ) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (session) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (path.startsWith("/admin") && userData?.role !== "admin") {
      return NextResponse.redirect(new URL("/user", req.url));
    }

    if (
      (path.startsWith("/user") || path.startsWith("/apply")) &&
      userData?.role !== "user"
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/", "/admin/:path*", "/user/:path*", "/apply/:path*"],
};
