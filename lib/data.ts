import type { Building } from "./types"

// Sample data for campus buildings
export const buildings: Building[] = [
  {
    id: "admin-building",
    name: "Administrative Building",
    department: "Administration",
    description:
      "The main administrative building housing the Rector's office, Registrar, and other administrative departments.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Rector's Office", "Registrar's Office", "Bursar's Office", "Conference Room"],
    coordinates: {
      lat: 6.5244,
      lng: 3.3792,
    },
  },
  {
    id: "science-complex",
    name: "Science Complex",
    department: "School of Science",
    description: "A modern complex housing the departments of Physics, Chemistry, Biology, and Mathematics.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Laboratories", "Lecture Halls", "Research Centers", "Staff Offices"],
    coordinates: {
      lat: 6.5248,
      lng: 3.3798,
    },
  },
  {
    id: "engineering-block",
    name: "Engineering Block",
    department: "School of Engineering",
    description:
      "Home to the various engineering departments including Civil, Mechanical, Electrical, and Computer Engineering.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Workshops", "Design Studios", "Computer Labs", "Lecture Rooms"],
    coordinates: {
      lat: 6.524,
      lng: 3.3785,
    },
  },
  {
    id: "library",
    name: "Central Library",
    department: "Library Services",
    description:
      "The main library containing thousands of books, journals, and digital resources for students and staff.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Reading Rooms", "Digital Resource Center", "Archives", "Study Carrels"],
    coordinates: {
      lat: 6.5252,
      lng: 3.379,
    },
  },
  {
    id: "art-design",
    name: "Art & Design Building",
    department: "School of Art, Design & Printing",
    description: "A creative hub for students studying Fine Arts, Graphic Design, and Printing Technology.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Art Studios", "Design Labs", "Exhibition Space", "Printing Workshop"],
    coordinates: {
      lat: 6.5238,
      lng: 3.38,
    },
  },
  {
    id: "business-studies",
    name: "Business Studies Complex",
    department: "School of Business Studies",
    description: "Houses the departments of Accountancy, Banking & Finance, and Business Administration.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Lecture Halls", "Computer Labs", "Seminar Rooms", "Staff Offices"],
    coordinates: {
      lat: 6.5235,
      lng: 3.3795,
    },
  },
  {
    id: "multipurpose-hall",
    name: "Multipurpose Hall",
    department: "Student Affairs",
    description:
      "A large hall used for various events, ceremonies, and gatherings including matriculation, convocation, and cultural activities.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Stage", "Seating Area", "Sound System", "Lighting Equipment", "Backstage Rooms"],
    coordinates: {
      lat: 6.5247,
      lng: 3.3782,
    },
  },
  {
    id: "sports-complex",
    name: "Sports Complex",
    department: "Sports Unit",
    description:
      "A comprehensive sports facility with fields, courts, and indoor sports areas for various athletic activities.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Football Field", "Basketball Court", "Tennis Court", "Indoor Sports Hall", "Swimming Pool"],
    coordinates: {
      lat: 6.523,
      lng: 3.3788,
    },
  },
  {
    id: "student-center",
    name: "Student Center",
    department: "Student Affairs",
    description: "A hub for student activities, organizations, and services designed to enhance campus life.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Student Union Office", "Cafeteria", "Recreation Rooms", "Meeting Spaces"],
    coordinates: {
      lat: 6.5242,
      lng: 3.3802,
    },
  },
  {
    id: "medical-center",
    name: "Medical Center",
    department: "Health Services",
    description:
      "Provides healthcare services to students and staff including consultations, emergency care, and health education.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Consultation Rooms", "Pharmacy", "Emergency Unit", "Health Education Center"],
    coordinates: {
      lat: 6.5255,
      lng: 3.3795,
    },
  },
  {
    id: "yabatech-campus",
    name: "Yaba College of Technology",
    department: "Main Campus",
    description:
      "The main campus of Yaba College of Technology, Nigeria's first higher educational institution, established in 1947.",
    image: "/placeholder.svg?height=400&width=600",
    facilities: ["Administrative Buildings", "Academic Departments", "Library", "Sports Complex", "Student Center"],
    coordinates: {
      lat: 6.524,
      lng: 3.3768,
    },
  },
]

