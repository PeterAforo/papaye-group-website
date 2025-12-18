"use client";

import { usePathname } from "next/navigation";
import { HeaderNav } from "./header-nav";
import { Footer } from "./footer";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { Chatbot } from "@/components/chat/chatbot";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if current route is admin
  const isAdminRoute = pathname?.startsWith("/admin");

  // Don't show header/footer for admin routes
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <HeaderNav />
      <main>{children}</main>
      <Footer />
      <CartSidebar />
      <Chatbot />
    </>
  );
}
