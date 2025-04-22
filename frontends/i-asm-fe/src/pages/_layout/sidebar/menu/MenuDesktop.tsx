import sidebarMenus from "@/constants/sidebarMenus";
import React from "react";
import { SidebarMenuItem } from "@/types";
import ArrowUpBoldIcon from "@/components/icons/ArrowUpBoldIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar-menu.module.css";

interface MenuItemProps extends SidebarMenuItem {
  isActive?: boolean;
}

const MenuItem = ({
  href = "#",
  icon: Icon,
  label,
  subMenus,
  isActive
}: MenuItemProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(true);

  return subMenus?.length ? (
    <li className={styles.sidebarMenuItem}>
      <div
        className={cn(
          "flex justify-between items-center gap-2.5 py-5 px-4 cursor-pointer hover:bg-blue-800 font-semibold",
          isActive && "text-third"
        )}
        onClick={() => {
          setIsOpen(prevState => !prevState);
        }}
      >
        <Link href={href} className="inline-flex items-center gap-2.5" passHref>
          {Icon && <Icon />}
          <span className="flex-grow">{label}</span>
        </Link>
        <ArrowUpBoldIcon className={cn("w-4 h-4", !isOpen && "rotate-180")} />
      </div>
      {isOpen && (
        <ul className={styles.sidebarSubMenu}>
          {subMenus.map((subitem, key) => (
            <SubMenuItem key={`menu-subitem-${key + 1}`} {...subitem} />
          ))}
        </ul>
      )}
    </li>
  ) : (
    <li className={styles.sidebarMenuItem}>
      <Link href={href} passHref>
        <div
          className={cn(
            "flex items-center gap-2.5 py-5 px-4 cursor-pointer hover:bg-blue-800 font-semibold",
            isActive && "text-third"
          )}
        >
          {Icon && <Icon />}
          <span className="flex-grow">{label}</span>
        </div>
      </Link>
    </li>
  );
};

type SubMenuProps = Pick<MenuItemProps, "href" | "label" | "isActive">;

const SubMenuItem = ({ href = "#", label, isActive }: SubMenuProps) => (
  <li className={styles.sidebarMenuItem}>
    <Link
      href={href}
      passHref
      className={cn(
        "pl-12 cursor-pointer h-full block",
        isActive ? "bg-blue-800" : "hover:bg-blue-800"
      )}
    >
      <span className="py-2.5 block h-full">{label}</span>
    </Link>
  </li>
);

const SidebarMenuDesktop = () => {
  const pathname = usePathname();
  const isActive = (path?: string) => pathname === path;
  return (
    <ul className={styles.sidebarMenu}>
      {sidebarMenus.map((item, key) => (
        <MenuItem
          key={`sidebar-menu-desktop-item-${key + 1}`}
          {...item}
          isActive={isActive(item.href)}
        />
      ))}
    </ul>
  );
};

export default SidebarMenuDesktop;
