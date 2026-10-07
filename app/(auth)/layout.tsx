/**
 * Auth layout — minimal shell for unauthenticated screens (login, signup).
 * No bottom nav or app chrome.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
