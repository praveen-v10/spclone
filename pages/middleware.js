import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export async function middleware(req) {
    // token will exist if user is logged in
    const token = await getToken({ req, secret: process.env.JWT_SECRET });

    const { pathname } = req.nextUrl;
    // Allow the request if the following is true
    // 1) its a request for next-auth session & provider fetching
    // 2) the token exists

    if (pathname.includes("/api/auth") || token) {
        return NextResponse.next();
    }
    // redirect them to login if they dont have token and are requestin a protected route
    if (!token && !pathname !== "/login") {
        console.log("Hello",token)
        return NextResponse.redirect("/login");
    }
}

