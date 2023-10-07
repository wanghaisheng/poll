import { Icon, Skeleton } from "@poll/ui";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import {
  Sidebar,
  SidebarNavigationLink,
  SidebarProfile,
} from "../../../components/sidebar";
import { routes } from "../../../config/routes";

type Props = React.ComponentProps<typeof Sidebar>;

export const sidebarLinks = [
  {
    text: "My polls",
    href: routes.DASHBOARD.POLLS,
    IconElement: <Icon.PieChart />,
  },
  {
    text: "My votes",
    href: routes.DASHBOARD.VOTES,
    IconElement: <Icon.Vote />,
  },
  {
    text: "Statistics",
    href: routes.DASHBOARD.STATISTICS,
    IconElement: <Icon.BarChart />,
  },
  {
    text: "Settings",
    href: routes.SETTINGS.ACCOUNT.GENERAL,
    IconElement: <Icon.Settings />,
  },
];

export default function SidebarContainer({ className, ...props }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  return (
    <Sidebar className={className} {...props}>
      <div className="mb-6">
        {isLoggedIn ? (
          <SidebarProfile
            username={session?.user.name}
            avatarUrl={session?.user.image}
          />
        ) : (
          <Skeleton className="h-9 w-full bg-neutral-200" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <nav className="space-y-[0.125rem]">
          {sidebarLinks.map((link) => (
            <SidebarNavigationLink
              key={link.text}
              as={Link}
              href={link.href}
              IconElement={link.IconElement}
              isActive={router.asPath === link.href}>
              {link.text}
            </SidebarNavigationLink>
          ))}
        </nav>
        <SidebarNavigationLink
          IconElement={<Icon.LogOut />}
          onClick={() => signOut({ callbackUrl: routes.LOGIN })}>
          Log Out
        </SidebarNavigationLink>
      </div>
    </Sidebar>
  );
}
