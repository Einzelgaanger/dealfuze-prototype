"use client";
import { useState } from "react";
import {
  Sidebar as Sidebar_,
  SidebarBody,
  SidebarLink,
  SidebarButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, LogOut, User } from "lucide-react";
import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { SignOutButton } from "@clerk/remix";

export function Sidebar({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const links = [
    {
      component: (
        <SidebarLink
          key="dashboard"
          link={{
            label: "Dashboard",
            href: "/dashboard",
            icon: (
              <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          }}
        />
      ),
    },
    {
      component: (
        <SidebarLink
          key="settings"
          link={{
            label: "Settings",
            href: "#",
            icon: (
              <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
          }}
        />
      ),
    },
    {
      component: (
        <SignOutButton key="logout">
          <SidebarButton
            className="w-fit"
            button={{
              label: "Logout",
              icon: (
                <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              ),
            }}
          />
        </SignOutButton>
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div className="h-screen fixed w-full">
      <div className="absolute inset-0">{children}</div>
      <div className="absolute left-0 top-0 h-full">
        <Sidebar_ open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link) => link.component)}
              </div>
            </div>
            <div>
              <SidebarLink
                link={{
                  label: userName,
                  href: "/",
                  icon: <User />,
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar_>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      to="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black whitespace-pre"
      >
        Deal Fuze
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
