import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone, Globe, ChevronRight } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-[var(--yabatech-green)] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="fade-in">
            <div className="flex items-center mb-6">
              <div className="bg-white text-[var(--yabatech-green)] p-2 rounded-full mr-2">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold">YabaTech Navigator</h3>
            </div>
            <p className="text-white/90 leading-relaxed">
              Your guide to navigating Yaba College of Technology campus with ease. Find buildings, get directions, and
              explore the campus with precision location tracking.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div className="slide-up">
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Campus Map", path: "/map" },
                { name: "Search Buildings", path: "/search" },
                { name: "Get Directions", path: "/directions" },
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    href={link.path} 
                    className="flex items-center text-white/90 hover:text-white transition-colors group"
                  >
                    <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="fade-in">
            <h3 className="text-xl font-bold mb-6">Contact Information</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Yaba College of Technology</p>
                  <p className="text-white/90">Herbert Macaulay Way</p>
                  <p className="text-white/90">Yaba, Lagos, Nigeria</p>
                </div>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                <a href="tel:+2348012345678" className="text-white/90 hover:text-white">+234 801 234 5678</a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                <a href="mailto:info@yabatech.edu.ng" className="text-white/90 hover:text-white">info@yabatech.edu.ng</a>
              </li>
              <li className="flex items-center">
                <Globe className="h-5 w-5 mr-3 flex-shrink-0" />
                <a href="https://yabatech.edu.ng" target="_blank" className="text-white/90 hover:text-white">yabatech.edu.ng</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 text-center">
          <p className="text-white/80">&copy; {new Date().getFullYear()} YabaTech Campus Navigator. All rights reserved.</p>
          <p className="text-white/60 text-sm mt-2">Designed to help students, staff, and visitors navigate the campus with ease.</p>
        </div>
      </div>
    </footer>
  )
}

