"use client";

import { usePathname, useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import FloatingChatIcon from "./components/FloatingChatIcon";
import { AuthProvider, useAuth } from "./AuthContext";
import { useEffect, useState, useCallback } from "react";

const RootContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [contentVersion, setContentVersion] = useState(1);

  const showNavbar =
    pathname !== "/" && pathname !== "/login" && pathname !== "/register";

  const handleContentUpdate = useCallback(() => {
    setContentVersion((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && !["/", "/login", "/register"].includes(pathname)) {
        router.push("/login");
      } else if (user && ["/", "/login", "/register"].includes(pathname)) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {user && showNavbar && <Navbar />}
      <main key={contentVersion}>{children}</main>
      {user && showNavbar && (
        <FloatingChatIcon
          currentPage={pathname === "/about" ? "about" : "dashboard"}
          onContentUpdate={handleContentUpdate}
          currentVersion={contentVersion}
        />
      )}
    </>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RootContent>{children}</RootContent>
        </AuthProvider>
      </body>
    </html>
  );
}
