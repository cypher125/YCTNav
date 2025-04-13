import Link from "next/link"
import { ArrowRight, MapPin, Search, Navigation, BookOpen, School, Building, Map, Trophy, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {/* Background gradient and image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--yabatech-dark-green)] to-[var(--yabatech-green)]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "linear-gradient(120deg, rgba(0,109,56,0.2) 0%, rgba(0,77,42,0.2) 100%)",
            }}
          />
        </div>

        {/* Animated floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Location pin floating elements */}
          <div className="absolute top-[20%] left-[15%] animate-float-slow">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="h-6 w-6 text-[var(--yabatech-accent)]" />
            </div>
          </div>
          <div className="absolute top-[65%] right-[12%] animate-float-delay">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <Building className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute top-[30%] right-[25%] animate-float">
            <div className="w-14 h-14 bg-[var(--yabatech-accent)]/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="h-7 w-7 text-[var(--yabatech-accent)]" />
            </div>
          </div>
          <div className="absolute bottom-[25%] left-[25%] animate-float-delay-long">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <Navigation className="h-8 w-8 text-white/80" />
            </div>
          </div>
          
          {/* Decorative connection lines */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M200,200 C300,100 700,400 900,200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" className="animate-draw"/>
            <path d="M300,500 C500,300 600,600 800,400" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" className="animate-draw-delay"/>
          </svg>
        </div>
        
        {/* Map preview element */}
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-[30%] h-[60%] rounded-lg shadow-2xl border-4 border-white/20 overflow-hidden transform rotate-6 transition-transform hover:rotate-0 hover:scale-105 hidden lg:block animate-fade-in">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(45deg, #006838 0%, #004d2a 100%)" }}>
            <div className="absolute inset-0 bg-[var(--yabatech-green)]/30 backdrop-blur-[2px]"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 animate-pulse">
            <div className="w-12 h-12 bg-[var(--yabatech-accent)] rounded-full opacity-70"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <MapPin className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <div className="bg-white/80 backdrop-blur-sm mx-auto py-2 px-4 rounded-full inline-block shadow-lg">
              <p className="text-[var(--yabatech-dark-green)] font-medium text-sm">Campus Map</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white lg:items-start lg:text-left lg:ml-[10%] xl:ml-[15%] lg:max-w-[50%]">
          <div className="mb-6 bg-white p-4 rounded-full animate-bounce-small">
            <School className="h-12 w-12 text-[var(--yabatech-green)]" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-fade-in-up">
            YabaTech<br/><span className="text-[var(--yabatech-accent)]">Navigator</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg sm:text-xl opacity-90 animate-fade-in-up-delay">
            Find your way around campus with precision and ease. Never get lost again with our interactive maps and directions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in-up-delay-long">
            <Link href="/map">
              <Button size="lg" rounded="full" shadow="lg" className="bg-white text-[var(--yabatech-green)] hover:bg-white/90 px-6 min-w-[180px]">
                <MapPin className="mr-2 h-5 w-5" /> Explore Map
              </Button>
            </Link>
            <Link href="/directions">
              <Button size="lg" rounded="full" shadow="lg" className="bg-[var(--yabatech-accent)] text-[var(--yabatech-dark-green)] hover:brightness-95 px-6 min-w-[180px]">
                <Navigation className="mr-2 h-5 w-5" /> Get Directions
            </Button>
          </Link>
          </div>
          
          {/* Stats panel */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-4 grid grid-cols-3 gap-6 w-full max-w-xl animate-fade-in-up-delay-longer">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--yabatech-accent)]">30+</div>
              <div className="text-sm text-white/80">Buildings</div>
            </div>
            <div className="text-center border-x border-white/20">
              <div className="text-3xl font-bold text-[var(--yabatech-accent)]">100%</div>
              <div className="text-sm text-white/80">Campus Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--yabatech-accent)]">24/7</div>
              <div className="text-sm text-white/80">Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--yabatech-gray)] py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold text-[var(--yabatech-dark-green)] sm:text-4xl">
              Navigate Campus Like Never Before
          </h2>
            <p className="max-w-2xl mx-auto text-gray-600">Discover the easiest way to find buildings, get directions, and explore YabaTech campus.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="card group p-8 hover:border-[var(--yabatech-green)]">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--yabatech-green)]/10 text-[var(--yabatech-green)] group-hover:bg-[var(--yabatech-green)] group-hover:text-white transition-colors">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[var(--yabatech-dark-green)]">Building Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Instantly find any building, department, or facility on campus with our smart search feature. Get detailed information about each location.
              </p>
              <Link href="/search" className="mt-4 inline-flex items-center text-[var(--yabatech-green)] font-medium hover:underline">
                <span>Search Buildings</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="card group p-8 hover:border-[var(--yabatech-green)]">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--yabatech-green)]/10 text-[var(--yabatech-green)] group-hover:bg-[var(--yabatech-green)] group-hover:text-white transition-colors">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[var(--yabatech-dark-green)]">Interactive Maps</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore the entire campus with our interactive map. Zoom, pan, and click on buildings to learn more about each location.
              </p>
              <Link href="/map" className="mt-4 inline-flex items-center text-[var(--yabatech-green)] font-medium hover:underline">
                <span>Explore Map</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="card group p-8 hover:border-[var(--yabatech-green)]">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--yabatech-green)]/10 text-[var(--yabatech-green)] group-hover:bg-[var(--yabatech-green)] group-hover:text-white transition-colors">
                <Navigation className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[var(--yabatech-dark-green)]">Precision Directions</h3>
              <p className="text-gray-600 leading-relaxed">
                Get accurate turn-by-turn directions with our advanced navigation system. Find the shortest path between any two points on campus.
              </p>
              <Link href="/directions" className="mt-4 inline-flex items-center text-[var(--yabatech-green)] font-medium hover:underline">
                <span>Get Directions</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[var(--yabatech-dark-green)] to-[var(--yabatech-green)] py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Ready to Navigate YabaTech?</h2>
          <p className="mb-8 mx-auto max-w-2xl text-lg">
            Start exploring the campus and find your way to classes, offices, and facilities with ease.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/map">
              <Button size="lg" rounded="full" shadow="lg" className="bg-white text-[var(--yabatech-green)] hover:bg-white/90 px-6 w-full sm:w-auto">
                <MapPin className="mr-2 h-5 w-5" /> View Campus Map
              </Button>
            </Link>
            <Link href="/directions">
              <Button
                size="lg"
                rounded="full" 
                shadow="lg"
                className="bg-[var(--yabatech-accent)] text-[var(--yabatech-dark-green)] hover:brightness-95 px-6 w-full sm:w-auto"
              >
                <Navigation className="mr-2 h-5 w-5" /> Get Directions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

