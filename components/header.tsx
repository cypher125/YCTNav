"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
    { name: "Map", path: "/map" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <MapPin className="h-6 w-6 text-[#3498DB]" />
          <span className="ml-2 text-lg font-bold text-[#2C3E50]">YabaTech Navigator</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-medium transition-colors hover:text-[#3498DB] ${
                isActive(link.path) ? "text-[#3498DB]" : "text-[#2C3E50]"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/map">
            <Button size="sm" className="bg-[#3498DB] hover:bg-[#3498DB]/90">
              Get Started
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col space-y-4 pt-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-lg font-medium transition-colors hover:text-[#3498DB] ${
                    isActive(link.path) ? "text-[#3498DB]" : "text-[#2C3E50]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/map" onClick={() => setIsMenuOpen(false)}>
                <Button className="mt-2 w-full bg-[#3498DB] hover:bg-[#3498DB]/90">Get Started</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

