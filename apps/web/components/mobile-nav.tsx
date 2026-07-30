"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { LuMenu, LuX } from "react-icons/lu";
import type { SectionNavItem } from "@/components/sections/section-renderer";
import { ThemeToggle } from "@/components/theme-toggle";

export function MobileNav({
  navItems,
  resumeUrl,
}: {
  navItems: SectionNavItem[];
  resumeUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary lg:hidden"
      >
        <LuMenu className="size-5" />
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 lg:hidden" />
        <DialogPrimitive.Popup className="top-0 fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col gap-8 border-l border-border bg-background p-6 outline-none data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Menu
            </span>
            <DialogPrimitive.Close
              aria-label="Close menu"
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary"
            >
              <LuX className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {navItems.map((item) => (
              <div key={item.id} className="flex flex-col">
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-3 font-mono text-sm tracking-widest text-foreground uppercase transition-colors hover:bg-foreground/5 hover:text-primary"
                >
                  {item.label}
                </a>
                {item.children && item.children.length > 0 ? (
                  <div className="ml-4 flex flex-col border-l border-border pl-3">
                    {item.children.map((child) => (
                      <a
                        key={child.id}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="rounded-md px-3 py-2 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:bg-foreground/5 hover:text-primary"
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <ThemeToggle
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-primary"
              iconClassName="size-4"
            />
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="rounded-md bg-primary px-4 py-2 font-heading text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_15px_var(--ring)]"
              >
                Resume
              </a>
            ) : null}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
