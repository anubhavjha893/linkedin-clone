// CLIENT_URL can be a single origin or a comma-separated list (e.g. a Vercel prod URL
// plus a preview URL). localhost:5173 is always allowed so local dev keeps working
// against a deployed backend too.
const fromEnv = (process.env.CLIENT_URL || "")
	.split(",")
	.map((url) => url.trim())
	.filter(Boolean);

export const allowedOrigins = [...new Set(["http://localhost:5173", ...fromEnv])];
