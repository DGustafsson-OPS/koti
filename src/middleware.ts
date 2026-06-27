import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { publicUrl } from "@/lib/public-url";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!request.auth;

  if (pathname.startsWith("/api/auth")) {
    return;
  }

  if (pathname === "/login") {
    if (isLoggedIn) {
      return Response.redirect(publicUrl(request, "/"));
    }
    return;
  }

  if (!isLoggedIn) {
    const loginUrl = publicUrl(request, "/login");
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
