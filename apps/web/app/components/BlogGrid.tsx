"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  published_at?: string | null;
  created_at: string;
  estimated_read_mins?: number | null;
  tags?: string[] | null;
}

interface BlogGridProps {
  posts: BlogPostItem[];
  currentSlug: string;
  primaryColor: string;
}

export default function BlogGrid({ posts, currentSlug, primaryColor }: BlogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const rawCategories = Array.from(new Set(posts.map((item) => item.category || "Devotional")));
  const categories = ["All", ...rawCategories];

  const filteredPosts = posts.filter((item) => {
    const matchesCategory = selectedCategory === "All" || (item.category || "Devotional") === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const standardPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="space-y-12">
      {/* Category Filter Pills & Search */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white border border-[#E8E2D6] p-4 rounded-3xl shadow-sm">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  isSelected
                    ? "text-white shadow-sm"
                    : "bg-[#F4F1EB] text-[#554334] hover:bg-[#E8E2D6] hover:text-[#1e1b18]"
                }`}
                style={{
                  backgroundColor: isSelected ? primaryColor : undefined,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:max-w-xs shrink-0">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 shrink-0">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#F4F1EB] border border-[#E8E2D6] rounded-2xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#8c5000]"
          />
        </div>
      </div>

      {/* Featured Blog Article Block */}
      {featuredPost && selectedCategory === "All" && searchQuery === "" && (
        <section className="mb-12">
          <Link href={`/${currentSlug}/blog/${featuredPost.slug}`} className="group block">
            <article className="cursor-pointer relative overflow-hidden rounded-3xl bg-white border border-[#E8E2D6] shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 h-80 lg:h-full min-h-[340px] relative overflow-hidden bg-zinc-100">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                  alt={featuredPost.title}
                  src={featuredPost.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuA2qD57JRgDD3hbS5r_mIAwXxp4iCayw1uPF56yMr3hBJrbmCXUIklOdpAoY5N8xI3jagGv-s0-zCP6ESC1RdXHzI6Y0EvxWViTxAYEdzGMqRfqcWf9lqT3Os5Bo7ilEQ3MIevo8z9D4W8WPbhPqgcjVZuoR1uhoh0TPWUmBIROpdRJA14SRm6ZRUJ5f5HNHHtRvjK4YyvXG8ixnTek157eZc8uHFoYGFFyuYGwCBPodlgrMLxaREg9"}
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-[#8c5000] text-white px-3.5 py-1.5 rounded-xl font-bold text-[9px] uppercase tracking-widest">
                    Spiritual Digest
                  </span>
                </div>
              </div>
              <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    <span>
                      {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  {featuredPost.estimated_read_mins && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{featuredPost.estimated_read_mins} min read</span>
                    </span>
                  )}
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#3A3530] leading-snug group-hover:text-[#8c5000] transition-colors uppercase tracking-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-xs text-[#554334] leading-relaxed line-clamp-4">
                  {featuredPost.excerpt || "Read full spiritual analysis, detailed ritual updates, and traditional cultural meanings."}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8c5000] border-b border-[#8c5000]/30 pb-0.5 group-hover:border-[#8c5000] transition-all uppercase tracking-wider">
                    Read Article
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* Grid of Posts */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(selectedCategory === "All" && searchQuery === "" ? standardPosts : filteredPosts).map((item) => {
            const formattedDate = new Date(item.published_at || item.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <Link key={item.id} href={`/${currentSlug}/blog/${item.slug}`} className="group block">
                <article
                  className="bg-white rounded-3xl border border-[#E8E2D6] p-5 h-full flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="h-48 w-full rounded-2xl overflow-hidden relative bg-zinc-50 border border-gray-100">
                      <img
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        alt={item.title}
                        src={item.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAT58zneVXyqcTn-aBZswuJPUITnrSepi8vsxg-1oaFZiG-WRn_eUn5jVdULT9p-VZMC4mu5hwL5iwL9TZXXQlcHdY98ULenaT3AYiCPXO2BVztCW1SVyHgULd8ybRVApkYiR0wis6rKvy3PzhkV9iqjPz_BjPYUFH9vGihKBG0oXGUDFvBaVdAGWGWVgAV4uHl0oQlo1ZpQe3fkX7cZBqvWgWPmH8oNG9AdQ3DXIIzs5FhUXTPbl0H"}
                      />
                      <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-[#8c5000] px-2.5 py-1 rounded-lg font-bold text-[9px] uppercase tracking-wider border border-[#8c5000]/10 shadow-xs">
                        {item.category || "Devotional"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-extrabold text-base text-[#3A3530] group-hover:text-[#8c5000] transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#554334] line-clamp-3 leading-relaxed">
                        {item.excerpt || "Read full spiritual analysis and cultural meanings."}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 mt-6 flex items-center justify-between text-[10px] font-bold text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">calendar_month</span>
                      {formattedDate}
                    </span>
                    <span className="text-[#8c5000] flex items-center gap-1 hover:underline cursor-pointer uppercase tracking-wider">
                      Read More
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}

          {/* Newsletter Box */}
          <article className="bg-[#FAFAF8] rounded-3xl border border-dashed border-[#8c5000]/20 p-6 flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-[#8c5000]/10 text-[#8c5000] rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
            </div>
            <h3 className="font-bold text-sm text-[#3A3530] uppercase">Devotional Digest</h3>
            <p className="text-xxs text-[#554334] mt-2 mb-4 leading-relaxed max-w-[200px]">
              Receive spiritual guides, festival details, and sacred content direct to your inbox.
            </p>
            <div className="w-full space-y-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 bg-white border border-[#E8E2D6] rounded-xl text-xxs font-semibold focus:outline-none"
              />
              <button
                type="button"
                className="w-full bg-[#3A3530] text-white hover:bg-[#8c5000] text-xxs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          </article>
        </div>
      ) : (
        <div className="bg-white border border-dashed border-[#E8E2D6]/80 p-12 rounded-3xl text-center text-gray-500 text-xs">
          No matching blog posts or articles found.
        </div>
      )}
    </div>
  );
}
