"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// A simplified tooltip context
const TooltipContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  content?: React.ReactNode;
  setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}>({
  open: false,
  setOpen: () => {},
  content: null,
  setContent: () => {},
});

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const [content, setContent] = React.useState<React.ReactNode>(null);
  
  return (
    <TooltipContext.Provider value={{ open, setOpen, content, setContent }}>
      {children}
    </TooltipContext.Provider>
  );
};

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { content?: React.ReactNode }
>(({ className, children, content, ...props }, ref) => {
  const { setOpen, setContent } = React.useContext(TooltipContext);
  
  const handleMouseEnter = () => {
    if (content) setContent(content);
    setOpen(true);
  };
  
  const handleMouseLeave = () => {
    setOpen(false);
  };
  
  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, content } = React.useContext(TooltipContext);
  
  if (!open) return null;
  
  return (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        "absolute z-50 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-md shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {content || children}
    </div>
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } 