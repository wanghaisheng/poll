import { cn } from "@poll/lib";
import { Icon } from "@poll/ui";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

import { routes } from "../../../config/routes";

type Props = React.ComponentPropsWithoutRef<"aside">;

const Sidebar = ({ className, ...props }: Props) => {
  return (
    <aside
      className={cn(
        "flex h-screen w-[220px] flex-col justify-between bg-neutral-800/25 px-2 py-4",
        className
      )}
      {...props}>
      <nav className="space-y-[0.125rem]">
        <SidebarNavigationLink
          as={Link}
          href={routes.DASHBOARD.POLLS}
          IconElement={<Icon.PieChart />}>
          My polls
        </SidebarNavigationLink>
        <SidebarNavigationLink
          as={Link}
          href={routes.DASHBOARD.HOME}
          IconElement={<Icon.Vote />}>
          My votes
        </SidebarNavigationLink>
        <SidebarNavigationLink
          as={Link}
          href={routes.DASHBOARD.HOME}
          IconElement={<Icon.BarChart />}>
          Statistics
        </SidebarNavigationLink>
        <SidebarNavigationLink
          as={Link}
          href={routes.DASHBOARD.HOME}
          IconElement={<Icon.Settings />}>
          Settings
        </SidebarNavigationLink>
      </nav>
      <SidebarNavigationLink
        IconElement={<Icon.LogOut />}
        onClick={() => signOut()}>
        Log Out
      </SidebarNavigationLink>
    </aside>
  );
};

export default Sidebar;

export type SidebarNavigationLinkProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
  isActive?: boolean;
  IconElement: JSX.Element;
};

export function SidebarNavigationLink<T extends React.ElementType = "button">({
  isActive,
  IconElement,
  className,
  children,
  as,
  ...props
}: SidebarNavigationLinkProps<T> &
  Omit<
    React.ComponentPropsWithoutRef<T>,
    keyof SidebarNavigationLinkProps<T>
  >) {
  const Component = as || "div";
  return (
    <Component
      className={cn(
        "flex cursor-pointer items-center space-x-2 rounded-[4px] p-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800 hover:text-white [&_svg]:h-4 [&_svg]:w-4",
        isActive && "bg-neutral-800",
        className
      )}
      {...props}>
      {IconElement}
      <span>{children}</span>
    </Component>
  );
}
