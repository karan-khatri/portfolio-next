import type { Metadata } from "next";

// Static and inherited by every nested /admin route automatically, so a
// newly added admin page is noindex by default without needing to opt in.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
