"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "Admin User",
    email: "admin@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
  
  },
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex items-center
     p-4 border-none bg-white">
      <SidebarTrigger />
      <nav className="flex items-center px-2 space-x-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-white hover:bg-primary px-4 py-1 rounded-md font-medium">
          Home
        </Link>
        {segments.map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          return (
            <span key={idx} className="flex items-center space-x-2">
              <span>/</span>
              <Link href={href} className="hover:text-white hover:bg-primary px-4 py-1 rounded-md font-medium">
                {seg}
              </Link>
            </span>
          );
        })}
      </nav>
    </header>
  );
}
