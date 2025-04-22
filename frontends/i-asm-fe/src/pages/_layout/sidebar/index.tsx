import React from "react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const SidebarMenu = dynamic(
  () => import("@/components/(auth)/layout/sidebar/menu"),
  { ssr: false }
);

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  return (
    <aside className={cn("w-64", className)}>
      <SidebarMenu />
    </aside>
  );
};

export default Sidebar;
