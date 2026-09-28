// Cross-origin deploys (Vercel frontend -> Render backend) need SameSite=None + Secure,
// or the browser silently drops the auth cookie on every request. Same-origin/local dev
// keeps the stricter Lax setting since it doesn't need cross-site delivery.
const isProduction = process.env.NODE_ENV === "production";

export const authCookieOptions = {
	httpOnly: true,
	maxAge: 3 * 24 * 60 * 60 * 1000,
	sameSite: isProduction ? "none" : "strict",
	secure: isProduction,
};
