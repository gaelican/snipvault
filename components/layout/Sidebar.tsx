"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Code2,
  Search,
  Star,
  Clock,
  Archive,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Folder,
  Tag,
  TrendingUp,
  Users,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ className, collapsed = false, onCollapsedChange, user }: SidebarProps) {
  const pathname = usePathname();

  const navSections: NavSection[] = [
    {
      title: "Main",
      items: [
        { title: "Home", href: "/", icon: Home },
        { title: "Explore", href: "/snippets", icon: Search },
        { title: "Trending", href: "/trending", icon: TrendingUp },
        { title: "Collections", href: "/collections", icon: Folder },
        { title: "Tags", href: "/tags", icon: Tag },
      ],
    },
    {
      title: "Library",
      items: [
        { title: "My Snippets", href: "/my-snippets", icon: Code2, disabled: !user },
        { title: "Starred", href: "/starred", icon: Star, disabled: !user },
        { title: "Recent", href: "/recent", icon: Clock },
        { title: "Bookmarks", href: "/bookmarks", icon: BookMarked, disabled: !user },
        { title: "Archive", href: "/archive", icon: Archive, disabled: !user },
      ],
    },
    {
      title: "Community",
      items: [
        { title: "Following", href: "/following", icon: Users, disabled: !user },
        { title: "Teams", href: "/teams", icon: Users, disabled: !user },
      ],
    },
    {
      title: "Support",
      items: [
        { title: "Settings", href: "/settings", icon: Settings, disabled: !user },
        { title: "Help", href: "/help", icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background"
        onClick={() => onCollapsedChange?.(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h4>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isDisabled = item.disabled;

                  return (
                    <Link
                      key={item.href}
                      href={isDisabled ? "#" : item.href}
                      className={cn(
                        "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground",
                        isDisabled && "pointer-events-none opacity-50"
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon
                        className={cn(
                          "flex-shrink-0",
                          collapsed ? "h-5 w-5" : "mr-3 h-4 w-4"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User section */}
      {user && !collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.name || user.email.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}