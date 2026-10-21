/**
 * env-check.ts — startup validation for required environment variables.
 *
 * Called once in the root layout (server component) at build/start time.
 * Logs a clear warning for each missing var so nothing silently breaks.
 *
 * Variables and what breaks without them:
 *
 *  NEXT_PUBLIC_API_URL    — ALL API calls fail. App is completely broken.
 *
 * Variables needed for document upload (Appwrite) — set on the BACKEND:
 *  APPWRITE_ENDPOINT      — document upload/download fails
 *  APPWRITE_PROJECT_ID    — document upload/download fails
 *  APPWRITE_BUCKET_ID     — document upload/download fails
 *  APPWRITE_API_KEY       — document download (server-side proxy) fails
 *
 * Variables needed for email — set on the BACKEND:
 *  MAILTRAP_TOKEN         — all transactional emails are console-stubbed
 *  EMAIL_FROM             — defaults to hello@isbmpa.com if absent
 *
 * Variables needed for Google OAuth — set on the BACKEND:
 *  GOOGLE_CLIENT_ID       — Google sign-in fails
 *  GOOGLE_CLIENT_SECRET   — Google sign-in fails
 *  GOOGLE_CALLBACK_URL    — Google sign-in fails
 */

interface EnvVar {
  name: string;
  value: string | undefined;
  required: boolean;
  description: string;
}

const FRONTEND_VARS: EnvVar[] = [
  {
    name: "NEXT_PUBLIC_API_URL",
    value: process.env.NEXT_PUBLIC_API_URL,
    required: true,
    description: "API base URL — all API calls fail without this",
  },
];

export function checkEnv(): void {
  const missing = FRONTEND_VARS.filter((v) => v.required && !v.value);
  const optional = FRONTEND_VARS.filter((v) => !v.required && !v.value);

  if (missing.length > 0) {
    console.error("\n❌  [whippie-intern] Missing required environment variables:");
    missing.forEach((v) => {
      console.error(`   ${v.name}: ${v.description}`);
    });
    console.error("\n   Add these to .env.local and restart the server.\n");
  }

  if (optional.length > 0) {
    console.warn("\n⚠️   [whippie-intern] Missing optional environment variables:");
    optional.forEach((v) => {
      console.warn(`   ${v.name}: ${v.description}`);
    });
    console.warn("");
  }

  if (missing.length === 0 && optional.length === 0) {
    console.log("✅  [whippie-intern] All environment variables are set.");
  }
}

/**
 * Returns a summary of which features are available based on current env vars.
 * Can be used in dev to show a warning UI.
 */
export function getFeatureAvailability() {
  return {
    api: !!process.env.NEXT_PUBLIC_API_URL,
  };
}
