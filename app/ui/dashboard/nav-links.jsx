"use client";

import {
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import useAuth from "../../lib/hooks/useAuth";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: CubeIcon,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ClipboardDocumentListIcon,
  },
  { name: "Cart", href: "/dashboard/cart", icon: ShoppingCartIcon },
  { name: "Account", href: "/dashboard/account", icon: UserCircleIcon },
];

export default function NavLinks() {
  const pathname = usePathname();
  const { user, loading } = useAuth(); // Get the authenticated user

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 dark:bg-dark dark:text-white",
              {
                "bg-sky-100 text-blue-600 dark:bg-gray-700":
                  pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
      {/* Only show PostProduct if user email is bob@gmail.com */}
      {!loading && user?.email === "bob@gmail.com" && (
        <Link
          href="/dashboard/sell"
          className={clsx(
            "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3 dark:bg-dark dark:text-white",
            {
              "bg-sky-100 text-blue-600 dark:bg-gray-700":
                pathname === "/dashboard/sell",
            }
          )}
        >
          <UserCircleIcon className="w-6" />
          <p className="hidden md:block">Sell Product</p>
        </Link>
      )}
    </>
  );
}
