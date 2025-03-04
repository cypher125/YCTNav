import Link from "next/link"
import { ArrowRight, MapPin, Search, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-[#2C3E50]/80 to-[#2C3E50]/60">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
              opacity: 0.4,
            }}
          />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Campus Navigator</h1>
          <p className="mb-8 max-w-2xl text-lg sm:text-xl">Your Guide to Yaba College of Technology</p>
          <Link href="/search">
            <Button size="lg" className="bg-[#3498DB] hover:bg-[#3498DB]/90">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#ECF0F1] py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-[#2C3E50] sm:text-4xl">
            Find Your Way Around Campus
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3498DB] text-white">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[#2C3E50]">Quick Search</h3>
              <p className="text-[#34495E]">
                Find any building, department, or facility on campus with our powerful search feature.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3498DB] text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[#2C3E50]">Interactive Maps</h3>
              <p className="text-[#34495E]">
                Explore the campus with our interactive map featuring all buildings and facilities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg bg-white p-6 shadow-md transition-transform hover:scale-105">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3498DB] text-white">
                <Navigation className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[#2C3E50]">Easy Directions</h3>
              <p className="text-[#34495E]">
                Get step-by-step directions to navigate from one location to another across campus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2C3E50] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Ready to Navigate YabaTech?</h2>
          <p className="mb-8 mx-auto max-w-2xl text-lg">
            Start exploring the campus and find your way to classes, offices, and facilities with ease.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/search">
              <Button size="lg" className="bg-[#3498DB] hover:bg-[#3498DB]/90 w-full sm:w-auto">
                Search Buildings
              </Button>
            </Link>
            <Link href="/map">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                View Campus Map
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

