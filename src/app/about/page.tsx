"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { staggerContainer, staggerItem, fadeInUp, fadeInLeft, fadeInRight } from "@/lib/animations";
import { Award, Users, Clock, Heart, Target, Eye, Loader2 } from "lucide-react";
import Image from "next/image";

interface Story {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  year: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  imageUrl: string | null;
}

const values = [
  {
    icon: Heart,
    title: "Passion",
    description: "We pour our hearts into every dish we prepare.",
  },
  {
    icon: Award,
    title: "Quality",
    description: "Only the finest ingredients make it to your plate.",
  },
  {
    icon: Users,
    title: "Community",
    description: "We're proud to be part of Ghana's food culture.",
  },
  {
    icon: Clock,
    title: "Speed",
    description: "Fast service without compromising on taste.",
  },
];

export default function AboutPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  const timelineRef = useRef(null);
  const valuesRef = useRef(null);
  const teamRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-100px" });
  const valuesInView = useInView(valuesRef, { once: true, margin: "-100px" });
  const teamInView = useInView(teamRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storiesRes, teamRes] = await Promise.all([
          fetch("/api/stories"),
          fetch("/api/team"),
        ]);
        const storiesData = await storiesRes.json();
        const teamData = await teamRes.json();
        setStories(Array.isArray(storiesData) ? storiesData : []);
        setTeam(Array.isArray(teamData) ? teamData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
              🏆 Since 1991
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-4">
              Our Story
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Ghana&apos;s Total Food Care Company. Pioneer of fast food restaurants in Accra,
              serving quality food with fast service since 1991.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <Card className="h-full bg-primary text-white">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <Target className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold font-heading mb-4">Our Mission</h2>
                  <p className="text-white/90 text-lg">
                    To provide affordable quality food and service to the general public,
                    celebrating Ghana&apos;s rich culinary heritage with modern convenience.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
            >
              <Card className="h-full bg-secondary text-dark">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-dark/10 rounded-2xl flex items-center justify-center mb-6">
                    <Eye className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold font-heading mb-4">Our Vision</h2>
                  <p className="text-dark/90 text-lg">
                    To be the Brand leader in the Integrated Hospitality Industry in Ghana,
                    known for exceptional quality and outstanding customer service.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Our Core Values"
            subtitle="The principles that guide everything we do"
          />

          <motion.div
            initial="hidden"
            animate={valuesInView ? "visible" : "hidden"}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value) => (
              <motion.div key={value.title} variants={staggerItem}>
                <Card className="h-full text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-heading font-bold text-xl mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Our Journey"
            subtitle="Key milestones in our 30+ year history"
          />

          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : stories.length > 0 ? (
              stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className={`flex items-center gap-8 mb-8 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <Card className="inline-block">
                      <CardContent className="p-6">
                        {story.year && (
                          <span className="text-primary font-bold text-2xl">{story.year}</span>
                        )}
                        <h3 className="font-heading font-bold text-xl mt-2 mb-2">
                          {story.title}
                        </h3>
                        <p className="text-gray-600">{story.content}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="relative">
                    <div className="w-4 h-4 bg-primary rounded-full" />
                    {index < stories.length - 1 && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-24 bg-primary/30" />
                    )}
                  </div>

                  <div className="flex-1" />
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No stories available yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Meet Our Team"
            subtitle="The passionate people behind your favorite meals"
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : team.length > 0 ? (
            <motion.div
              initial="hidden"
              animate={teamInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {team.map((member) => (
                <motion.div key={member.id} variants={staggerItem}>
                  <Card className="h-full text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                    <CardContent className="p-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden group-hover:scale-110 transition-transform">
                        {member.imageUrl ? (
                          <Image
                            src={member.imageUrl}
                            alt={member.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-5xl text-white">👤</span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-xl mb-1">{member.name}</h3>
                      <p className="text-primary font-medium mb-2">{member.role}</p>
                      {member.bio && <p className="text-gray-600 text-sm">{member.bio}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-500 py-8">No team members available yet.</p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white"
          >
            <motion.div variants={staggerItem}>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">33+</div>
              <div className="text-white/80">Years of Service</div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">10+</div>
              <div className="text-white/80">Branches</div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">1M+</div>
              <div className="text-white/80">Happy Customers</div>
            </motion.div>
            <motion.div variants={staggerItem}>
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">600+</div>
              <div className="text-white/80">Staff Members</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
