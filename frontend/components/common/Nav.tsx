"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useState } from "react";
import "./scrollStyle.css"

interface NavLink {
  title: any;
  label?: string;
  icon?: LucideIcon;
  variant: "default" | "ghost";
  children?: NavLink[];
}

export interface NavProps {
  isFullWidth?: boolean
  isCollapsed: boolean;
  links: NavLink[];
}

interface NavItemProps {
  isFullWidth?: boolean
  link: NavLink;
  isCollapsed: boolean;
}

export function Nav({ links, isCollapsed, isFullWidth }: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className={`
      group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2
      ${isFullWidth && "w-full"}
      `}
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => (
          <NavItem
            key={index}
            link={link}
            isCollapsed={isCollapsed}
            isFullWidth={isFullWidth}
          />
        ))}
      </nav>
    </div>
  );
}

function NavItem({ link, isCollapsed, isFullWidth }: NavItemProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    if (link.children) {
      setIsOpen(!isOpen);
    }
  };

  return (
      <div>
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <div
                  // href="#"
                  className={cn(
                    buttonVariants({
                      variant: link.variant,
                      size: "icon",
                    }),
                    "h-9 w-9",
                    link.variant === "default" &&
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                  onClick={handleToggle}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  <span className="sr-only">{link.title}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="flex items-center gap-4"
            >
              {link.title}
              {link.label && (
                <span className="ml-auto text-muted-foreground">
                  {link.label}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
            <div
              // href="#"
              className={cn(
                buttonVariants({ variant: link.variant, size: "sm" }),
                link.variant === "default" &&
                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-start",
                isFullWidth && "w-full"
              )}
              onClick={handleToggle}
            >
              {link.icon && <link.icon className="mr-2 h-4 w-4" />}
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    "ml-auto",
                    link.variant === "default" &&
                    "text-background dark:text-white"
                  )}
                >
                  {link.label}
                </span>
              )}
            </div>
          )}
          {isOpen && link.children && (
            <div
              className={`
                ml-4 mt-2 max-h-[45vh] overflow-y-auto
                scroll_conatiner
              `}
            >
              {link.children.map((childLink, index) => (
                <NavItem
                  key={index}
                  link={childLink}
                  isCollapsed={isCollapsed}
                  isFullWidth={isFullWidth}
                />
              ))}
            </div>
          )}
      </div>
  );
}

