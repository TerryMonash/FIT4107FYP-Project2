"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";
import FloatingChatIcon from "./components/FloatingChatIcon";
import { AuthProvider, useAuth } from "./AuthContext";

const RootContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const showNavbar = pathname !== "/";
  const { user } = useAuth();

  return (
    <html lang="en">
      <body>
        {user && showNavbar && <Navbar />}
        <main>{children}</main>
        {user && showNavbar && <FloatingChatIcon />}
      </body>
    </html>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <RootContent>{children}</RootContent>
    </AuthProvider>
  );
}
