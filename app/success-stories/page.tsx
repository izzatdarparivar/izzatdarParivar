"use client";

import Navbar from "@/components/Navbar";
import { Sparkles, Heart, Quote, Calendar } from "lucide-react";
import Image from "next/image";

interface Story {
  id: string;
  names: string;
  weddingDate: string;
  quote: string;
  content: string;
  image: string;
}

export default function SuccessStoriesPage() {
  const stories: Story[] = [
    {
      id: "1",
      names: "Rajesh & Meera Singhania",
      weddingDate: "Nov 12, 2025",
      quote: "We found our soulmate and the perfect blend of family values on IzzatdarParivar.",
      content: "Rajesh was in Mumbai and Meera was in Jaipur. The algorithm calculated an astonishing 96% compatibility score, highlighting their shared heritage and lifestyle preferences. After a few calls, their families met and clicked instantly. Today they are happily married and blessed by their elders.",
      image: "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "2",
      names: "Vikram & Anjali Trivedi",
      weddingDate: "Jan 28, 2026",
      quote: "The verification system gave our parents absolute peace of mind.",
      content: "Anjali's father was very protective. The fact that Vikram had verified ID credentials and a 94 Trust Score enabled a level of trust that no other platform could facilitate. Their common interest in classical arts and joint family structure aligned perfectly.",
      image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-4 border border-red-200">
            <Heart className="w-3.5 h-3.5 fill-current" /> Happy Unions
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[var(--on-surface)]">
            Our Success Stories
          </h1>
          <p className="text-[var(--on-surface-variant)] mt-3 text-lg leading-relaxed">
            Beautiful matches that started on IzzatdarParivar and bloomed into lifetime partnerships, guided by respect and family values.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {stories.map((story) => (
            <div 
              key={story.id} 
              className="bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-64 sm:h-80 w-full bg-[var(--surface-container-low)]">
                <img 
                  src={story.image} 
                  alt={story.names} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-gray-800 shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-red-500" /> {story.weddingDate}
                </div>
              </div>

              <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold text-[var(--on-surface)]">
                    {story.names}
                  </h3>
                  
                  <div className="flex gap-2.5 items-start">
                    <Quote className="w-5 h-5 text-red-400 rotate-180 flex-shrink-0 mt-1" />
                    <p className="text-base font-medium text-gray-700 italic">
                      {story.quote}
                    </p>
                  </div>

                  <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed">
                    {story.content}
                  </p>
                </div>

                <div className="pt-6 border-t border-[var(--outline-variant)] flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> A Match Blessed by Elders
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
