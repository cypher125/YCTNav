"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, MapPin, Navigation, School, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
    { name: "Map", path: "/map" },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <div className="bg-[var(--yabatech-green)] text-white p-2 rounded-full">
            <School className="h-6 w-6" />
          </div>
          <span className="ml-2 text-lg font-bold text-[var(--yabatech-green)]">YabaTech Navigator</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-medium transition-colors hover:text-[var(--yabatech-green)] relative py-1 ${
                isActive(link.path) 
                  ? "text-[var(--yabatech-green)] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[var(--yabatech-green)]" 
                  : "text-[var(--yabatech-text)]"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link href="/directions">
            <Button size="sm" className="bg-[var(--yabatech-green)] hover:bg-[var(--yabatech-dark-green)] transition-all duration-300 rounded-full px-5 shadow-md hover:shadow-lg flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              <span>Get Directions</span>
            </Button>
          </Link>
          <Link href="/admin/buildings" className="ml-2">
            <Button size="sm" variant="outline" className="border-[var(--yabatech-green)] text-[var(--yabatech-green)] hover:bg-[var(--yabatech-green)] hover:text-white transition-all duration-300 rounded-full px-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Admin</span>
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
          <SheetContent side="right" className="border-l-[var(--yabatech-green)]">
            <div className="flex items-center mt-4 mb-8">
              <div className="bg-[var(--yabatech-green)] text-white p-2 rounded-full">
                <School className="h-6 w-6" />
              </div>
              <span className="ml-2 text-lg font-bold text-[var(--yabatech-green)]">YabaTech Navigator</span>
            </div>
            <div className="flex flex-col space-y-4 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-lg font-medium transition-colors hover:text-[var(--yabatech-green)] py-2 border-b border-gray-100 ${
                    isActive(link.path) ? "text-[var(--yabatech-green)]" : "text-[var(--yabatech-text)]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/directions" onClick={() => setIsMenuOpen(false)}>
                <Button className="mt-4 w-full bg-[var(--yabatech-green)] hover:bg-[var(--yabatech-dark-green)] rounded-full flex items-center justify-center gap-2">
                  <Navigation className="h-4 w-4" />
                  <span>Get Directions</span>
                </Button>
              </Link>
              <Link href="/admin/buildings" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="mt-2 w-full border-[var(--yabatech-green)] text-[var(--yabatech-green)] hover:bg-[var(--yabatech-green)] hover:text-white rounded-full flex items-center justify-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

