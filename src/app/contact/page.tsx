"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem } from "@/lib/animations";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  CheckCircle
} from "lucide-react";
import successAnimation from "../../../public/lottie/success-check.json";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["Oxford Street, Osu", "Accra, Ghana"],
    color: "bg-primary",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+233 30 277 1234", "+233 50 123 4567"],
    color: "bg-green-500",
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@papaye.com.gh", "support@papaye.com.gh"],
    color: "bg-blue-500",
  },
  {
    icon: Clock,
    title: "Opening Hours",
    details: ["Mon - Sun: 7:00 AM - 11:00 PM", "Holidays: 8:00 AM - 10:00 PM"],
    color: "bg-secondary",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const formInView = useInView(formRef, { once: true, margin: "-100px" });
  const infoInView = useInView(infoRef, { once: true, margin: "-100px" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setIsSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Contact form error:", error);
      alert(error instanceof Error ? error.message : "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary via-primary-600 to-primary-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-secondary text-dark px-4 py-2 rounded-full text-sm font-bold mb-4">
              💬 Get in Touch
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-4">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hello? We&apos;d love to
              hear from you. Reach out to us anytime!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section ref={infoRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={infoInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {contactInfo.map((info) => (
              <motion.div key={info.title} variants={staggerItem}>
                <Card className="h-full text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    >
                      <info.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-heading font-bold text-xl mb-3">{info.title}</h3>
                    {info.details.map((detail, index) => (
                      <p key={index} className="text-gray-600">
                        {detail}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section ref={formRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial="hidden"
              animate={formInView ? "visible" : "hidden"}
              variants={fadeInLeft}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-heading font-bold text-2xl">Send us a Message</h2>
                      <p className="text-gray-600">We&apos;ll get back to you within 24 hours</p>
                    </div>
                  </div>

                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-24 h-24 mx-auto mb-4">
                        <Lottie 
                          animationData={successAnimation} 
                          loop={false} 
                          autoplay={true}
                        />
                      </div>
                      <h3 className="font-heading font-bold text-2xl mb-2">Message Sent!</h3>
                      <p className="text-gray-600">
                        Thank you for contacting us. We&apos;ll respond shortly.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="+233 XX XXX XXXX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject *
                          </label>
                          <select
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          >
                            <option value="">Select a subject</option>
                            <option value="general">General Inquiry</option>
                            <option value="feedback">Feedback</option>
                            <option value="complaint">Complaint</option>
                            <option value="partnership">Partnership</option>
                            <option value="careers">Careers</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Message *
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                          placeholder="How can we help you?"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Map & Social */}
            <motion.div
              initial="hidden"
              animate={formInView ? "visible" : "hidden"}
              variants={fadeInRight}
              className="space-y-6"
            >
              {/* Map */}
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Papaye Head Office</p>
                    <p className="text-gray-400 text-sm">Oxford Street, Osu, Accra</p>
                  </div>
                </div>
              </Card>

              {/* Social Media */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-xl mb-4">Follow Us</h3>
                  <p className="text-gray-600 mb-6">
                    Stay connected with us on social media for updates, promotions, and more!
                  </p>
                  <div className="flex gap-4">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                      <Facebook className="w-6 h-6" />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card className="bg-primary text-white">
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-xl mb-4">Need Immediate Help?</h3>
                  <p className="text-white/80 mb-6">
                    For urgent inquiries, call our customer service hotline:
                  </p>
                  <a
                    href="tel:+233302771234"
                    className="inline-flex items-center gap-3 bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    +233 30 277 1234
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Find quick answers to common questions about our menu, delivery, and services.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold mb-2">Do you deliver?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes! We offer delivery within a 5km radius of all our branches.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold mb-2">Can I order online?</h3>
                  <p className="text-gray-600 text-sm">
                    Absolutely! Use our website or call any branch to place your order.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold mb-2">Do you cater events?</h3>
                  <p className="text-gray-600 text-sm">
                    Yes, we offer catering services for events of all sizes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
