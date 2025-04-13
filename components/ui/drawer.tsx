"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetPortal, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

// Simplified drawer component using the existing Sheet component
const Drawer = React.forwardRef<
  React.ElementRef<typeof Sheet>,
  React.ComponentPropsWithoutRef<typeof Sheet>
>(({ className, children, ...props }, ref) => (
  <Sheet {...props}>
    {children}
  </Sheet>
))
Drawer.displayName = "Drawer"

const DrawerTrigger = SheetTrigger

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  React.ComponentPropsWithoutRef<typeof SheetContent> & { showHandle?: boolean }
>(({ className, children, showHandle = true, ...props }, ref) => (
  <SheetPortal>
    <SheetContent 
      ref={ref} 
      side="bottom" 
      className={cn(
        "rounded-t-[10px] border-t border-l border-r border-border",
        className
      )} 
      {...props}
    >
      {showHandle && (
        <div className="mx-auto mt-2 mb-6 h-1.5 w-16 rounded-full bg-muted" />
      )}
      {children}
    </SheetContent>
  </SheetPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = "DrawerDescription"

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription
} 