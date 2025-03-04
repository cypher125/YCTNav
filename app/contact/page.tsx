"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function ContactPage() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon.",
      })

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#2C3E50] sm:text-4xl">Contact Us</h1>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-lg bg-[#2C3E50] p-8 text-white">
          <h2 className="mb-6 text-2xl font-bold">Get In Touch</h2>
          <p className="mb-8">
            Have questions about finding your way around campus? Need help with the Campus Navigator? We're here to
            help! Reach out to us using any of the methods below.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <Mail className="mr-4 h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-white/80">campusnavigator@yabatech.edu.ng</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="mr-4 h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-white/80">+234 123 456 7890</p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="mr-4 h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-white/80">
                  Yaba College of Technology
                  <br />
                  Herbert Macaulay Way
                  <br />
                  Yaba, Lagos, Nigeria
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-[#2C3E50]">Send a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="mb-2 block font-medium text-[#2C3E50]">
                Name
              </label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="mb-2 block font-medium text-[#2C3E50]">
                Email
              </label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="mb-4">
              <label htmlFor="subject" className="mb-2 block font-medium text-[#2C3E50]">
                Subject
              </label>
              <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="mb-2 block font-medium text-[#2C3E50]">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

