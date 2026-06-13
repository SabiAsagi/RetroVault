import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "ADMIN" || token?.role === "INFO_MANAGER" || token?.role === "USER_MANAGER" || token?.role === "MODERATOR";
    const pathname = req.nextUrl.pathname;

    // Protect /admin routes
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // This callback controls whether the middleware function above is called.
        // Returning true means the middleware function will be executed.
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
