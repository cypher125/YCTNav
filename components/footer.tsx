import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-[#2C3E50] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-bold">YabaTech Navigator</h3>
            <p className="text-sm text-white/80">
              Your guide to navigating Yaba College of Technology campus with ease. Find buildings, get directions, and
              explore the campus.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#3498DB] hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#3498DB] hover:underline">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#3498DB] hover:underline">
                  Campus Map
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#3498DB] hover:underline">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#3498DB] hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Connect With Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-[#3498DB]">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-[#3498DB]">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="hover:text-[#3498DB]">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="mailto:info@yabatech.edu.ng" className="hover:text-[#3498DB]">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/80">
              Yaba College of Technology
              <br />
              Herbert Macaulay Way
              <br />
              Yaba, Lagos, Nigeria
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/20 pt-4 text-center text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} YabaTech Campus Navigator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

