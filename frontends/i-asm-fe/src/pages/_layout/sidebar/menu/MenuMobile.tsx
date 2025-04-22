import sidebarMenus from "@/constants/sidebarMenus";
import React, { useState } from "react";
import { SidebarMenuItem } from "@/types";
import ArrowUpBoldIcon from "@/components/icons/ArrowUpBoldIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar-menu.module.css";

interface MenuItemProps extends SidebarMenuItem {
  isActive?: boolean;
  subMenuIsOpen?: boolean;
  onToggleClick?: () => void;
}

const MenuItem = ({
  href = "#",
  icon: Icon,
  label,
  subMenus,
  isActive,
  subMenuIsOpen,
  onToggleClick
}: MenuItemProps) => (
  <li className={cn("min-w-fit w-full", styles.sidebarMenuItem)}>
    <div
      className={cn(
        "flex items-center justify-center gap-2.5 py-5 px-4 mobile:py-4 mobile:px-2 cursor-pointer hover:bg-blue-800 font-semibold",
        isActive && "text-third"
      )}
      {...(subMenus?.length ? { onClick: onToggleClick } : {})}
    >
      <Link
        href={subMenus?.length ? "#" : href}
        className="inline-flex items-center gap-2.5"
        passHref
      >
        {Icon && <Icon />}
        <span className="flex-grow">{label}</span>
      </Link>
      {subMenus?.length && (
        <ArrowUpBoldIcon
          className={cn("w-4 h-4", !subMenuIsOpen && "rotate-180")}
        />
      )}
    </div>
  </li>
);

type SubMenuProps = Pick<MenuItemProps, "href" | "label" | "isActive">;

const SubMenuItem = ({ href = "#", label, isActive }: SubMenuProps) => (
  <li className={styles.sidebarMenuItem}>
    <Link
      href={href}
      passHref
      className={cn(
        "pl-12 cursor-pointer h-full block mobile:pl-0 mobile:text-center",
        isActive ? "bg-blue-800" : "hover:bg-blue-800"
      )}
    >
      <span className="py-2.5 block mobile:!border-t-0 h-full mobile:border-b ">
        {label}
      </span>
    </Link>
  </li>
);

const SidebarMenuMobile = () => {
  const pathname = usePathname();
  const isActive = (path?: string) => pathname === path;
  const [itemOpenSubmenu, setItemOpenSubmenu] = useState<string>("");

  return (
    <>
      <ul
        className={cn(
          "mobile:flex mobile:justify-between mobile:relative",
          styles.sidebarMenu
        )}
      >
        {sidebarMenus.map((item, key) => (
          <MenuItem
            key={`sidebar-menu-item-${key + 1}`}
            {...item}
            isActive={isActive(item.href)}
            subMenuIsOpen={itemOpenSubmenu === item.name}
            onToggleClick={() => {
              if (itemOpenSubmenu === item.name) setItemOpenSubmenu("");
              else setItemOpenSubmenu(item.name);
            }}
          />
        ))}
      </ul>
      {!!itemOpenSubmenu && (
        <ul
          className={cn(
            "w-screen left-0 grid grid-cols-3 bg-primary",
            styles.sidebarSubMenu
          )}
        >
          {(
            sidebarMenus.find(item => item.name === itemOpenSubmenu)
              ?.subMenus ?? []
          ).map((subitem, key) => (
            <SubMenuItem key={`menu-subitem-${key + 1}`} {...subitem} />
          ))}
        </ul>
      )}
    </>
  );
};

export default SidebarMenuMobile;
