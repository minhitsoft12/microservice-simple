"use client";

import { useCallback, useEffect, useState } from "react";
import SidebarMenuDesktop from "@/components/(auth)/layout/sidebar/menu/MenuDesktop";
import SidebarMenuMobile from "@/components/(auth)/layout/sidebar/menu/MenuMobile";

const SidebarMenu = () => {
  const [isMobileView, setIsMobileView] = useState(false);

  const MOBILE_BREAKPOINT = 768;

  // Memoized resize handler to prevent recreating on every render
  const onResizeWindow = useCallback(() => {
    const width = window.innerWidth;
    setIsMobileView(width < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    onResizeWindow();
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        onResizeWindow();
      }, 500);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [onResizeWindow]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return isMobileView ? <SidebarMenuMobile /> : <SidebarMenuDesktop />;
};

export default SidebarMenu;
