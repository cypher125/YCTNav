import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#2C3E50] sm:text-4xl">About Campus Navigator</h1>

      <div className="mx-auto max-w-4xl">
        <div className="mb-12 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-[#2C3E50]">Our Mission</h2>
            <p className="mb-4 text-[#34495E]">
              The Campus Navigator was developed to help students, staff, and visitors easily find their way around Yaba
              College of Technology. Our mission is to simplify campus navigation and enhance the overall experience of
              everyone at YabaTech.
            </p>
            <p className="text-[#34495E]">
              With our interactive maps and intuitive search features, you can quickly locate buildings, departments,
              and facilities across the campus, saving time and reducing the stress of finding your way.
            </p>
          </div>
          <div className="relative h-[300px] overflow-hidden rounded-lg">
            <Image src="/placeholder.svg?height=600&width=800" alt="YabaTech Campus" fill className="object-cover" />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-[#2C3E50]">About Yaba College of Technology</h2>
          <p className="mb-4 text-[#34495E]">
            Yaba College of Technology (YabaTech), Nigeria's first higher educational institution, was established in
            1947. Located in Yaba, Lagos, it offers a wide range of technical and vocational education programs.
          </p>
          <p className="mb-4 text-[#34495E]">
            The college has grown significantly over the years and now features numerous buildings, departments, and
            facilities spread across its expansive campus. This growth has made navigation increasingly challenging,
            especially for new students and visitors.
          </p>
          <p className="text-[#34495E]">
            Our Campus Navigator application aims to address this challenge by providing a comprehensive digital
            solution for finding your way around YabaTech.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-[#2C3E50]">How to Use the Navigator</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3498DB] text-white">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#2C3E50]">Search</h3>
              <p className="text-[#34495E]">
                Use the search feature to find specific buildings, departments, or facilities on campus.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3498DB] text-white">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#2C3E50]">Explore</h3>
              <p className="text-[#34495E]">
                Explore the interactive map to discover buildings and locations across the campus.
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3498DB] text-white">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#2C3E50]">Navigate</h3>
              <p className="text-[#34495E]">Get step-by-step directions between any two locations on campus.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

