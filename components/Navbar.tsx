"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sun, Moon, Monitor } from "lucide-react";

const HOVER_CLOSE_DELAY_MS = 200;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const themeCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, setTheme } = useTheme();

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  const clearThemeCloseTimeout = () => {
    if (themeCloseTimeoutRef.current) {
      clearTimeout(themeCloseTimeoutRef.current);
      themeCloseTimeoutRef.current = null;
    }
  };

  const scheduleThemeClose = () => {
    clearThemeCloseTimeout();
    themeCloseTimeoutRef.current = setTimeout(() => setThemeOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  const handleTriggerEnter = () => {
    clearCloseTimeout();
    setOpen(true);
  };

  const handleThemeTriggerEnter = () => {
    clearThemeCloseTimeout();
    setThemeOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-14 w-full items-center" aria-label="Main">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-foreground no-underline"
          >
            m&apos;Journal
          </Link>
          <div className="flex items-center gap-3">
            <DropdownMenu open={themeOpen} onOpenChange={setThemeOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground data-[state=open]:text-foreground"
                  aria-haspopup="menu"
                  aria-label="Theme"
                  onMouseEnter={handleThemeTriggerEnter}
                  onMouseLeave={scheduleThemeClose}
                >
                  <Sun className="size-4 dark:hidden" />
                  <Moon className="size-4 hidden dark:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[10rem]"
                onMouseEnter={clearThemeCloseTimeout}
                onMouseLeave={scheduleThemeClose}
              >
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 size-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 size-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 size-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground data-[state=open]:text-foreground"
                  aria-haspopup="menu"
                  onMouseEnter={handleTriggerEnter}
                  onMouseLeave={scheduleClose}
                >
                  File
                  <ChevronDown className="ml-1 size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[11rem]"
                onMouseEnter={clearCloseTimeout}
                onMouseLeave={scheduleClose}
              >
                <DropdownMenuItem asChild>
                  <Link href="/?new=1">Add Entry</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/?historical=1">Historical Entry</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </header>
  );
}
