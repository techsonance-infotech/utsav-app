"use client";

import React, { useState } from "react";
import { useNewsArticles, useCreateNewsArticle, useIncrementNewsRead } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { useParams } from "next/navigation";
import { X, Globe, Eye, MessageSquare, AlertTriangle } from "lucide-react";

export default function WebNewsPage() {
  const { role } = useAuthStore();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const { data: articles = [], isLoading: loadingNews, refetch } = useNewsArticles(true) as any;
  const createMutation = useCreateNewsArticle();
  const incrementRead = useIncrementNewsRead();

  // Create Form States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [titleGu, setTitleGu] = useState("");
  const [body, setBody] = useState("");
  const [bodyHi, setBodyHi] = useState("");
  const [bodyGu, setBodyGu] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<
    "festival_update" | "announcement" | "achievement" | "press" | "charity" | "general"
  >("general");
  const [language, setLanguage] = useState("en");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Preview / translation view states
  const [viewedArticle, setViewedArticle] = useState<any | null>(null);
  const [langOverride, setLangOverride] = useState<"en" | "hi" | "gu">("en");

  // Tab filter states
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const hasAdminAccess = ["owner", "admin", "committee_member"].includes(role || "");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title || !body) {
      setErrorMsg("Title and Body content are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        ? tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
      : [];

      await createMutation.mutateAsync({
        title,
        title_hi: titleHi || undefined,
        title_gu: titleGu || undefined,
        body,
        body_hi: bodyHi || undefined,
        body_gu: bodyGu || undefined,
        excerpt: excerpt || undefined,
        category,
        language,
        banner_image_url: bannerImageUrl || undefined,
        tags,
        status,
        allow_comments: false,
      });

      // Clear form
      setTitle("");
      setTitleHi("");
      setTitleGu("");
      setBody("");
      setBodyHi("");
      setBodyGu("");
      setExcerpt("");
      setCategory("general");
      setLanguage("en");
      setBannerImageUrl("");
      setTagsInput("");
      setStatus("draft");
      setIsDrawerOpen(false);
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create news article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenArticle = (art: any) => {
    setViewedArticle(art);
    setLangOverride(art.language as "en" | "hi" | "gu");
    incrementRead.mutate(art.id);
  };

  const getActiveContent = (art: any) => {
    if (!art) return { title: "", body: "" };
    if (langOverride === "hi") {
      return { title: art.title_hi || art.title, body: art.body_hi || art.body };
    }
    if (langOverride === "gu") {
      return { title: art.title_gu || art.title, body: art.body_gu || art.body };
    }
    return { title: art.title, body: art.body };
  };

  const activeContent = getActiveContent(viewedArticle);

  // Client side filters
  const filteredArticles = articles.filter((art: any) => {
    if (activeTab !== "all" && art.category !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = art.title?.toLowerCase().includes(q);
      const inBody = art.body?.toLowerCase().includes(q);
      if (!inTitle && !inBody) return false;
    }
    return true;
  });

  // Basic counters
  const totalPublished = articles.filter((a: any) => a.status === "published").length;
  const totalViews = articles.reduce((sum: number, a: any) => sum + (a.read_count || 0), 0);
  const totalDrafts = articles.filter((a: any) => a.status === "draft").length;

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      
      {/* Header section with inline search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-display-xl text-display-xl text-primary font-bold">News & Announcements</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1">
            Broadcast updates, announcements, achievements, and spiritual newsletters to the Utsav network.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-cream/40 border border-sandstone rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:border-primary text-body-md"
            />
          </div>

          {hasAdminAccess && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center justify-center gap-2 bg-primary-container text-on-primary-container hover:opacity-90 px-6 py-2.5 rounded-lg font-bold shadow-md saffron-glow active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-lg">post_add</span>
              Compose News
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <div className="bg-cream p-lg rounded-2xl border border-sandstone">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Total Published</p>
          <p className="font-display-xl text-display-xl text-primary font-bold">{totalPublished}</p>
          <div className="flex items-center gap-1 mt-2 text-tulsi-green">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span className="font-label-sm text-label-sm font-bold">+12% from last month</span>
          </div>
        </div>

        <div className="bg-cream p-lg rounded-2xl border border-sandstone">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Total Views</p>
          <p className="font-display-xl text-display-xl text-primary font-bold">{(totalViews / 1000).toFixed(1)}k</p>
          <div className="flex items-center gap-1 mt-2 text-tulsi-green">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span className="font-label-sm text-label-sm font-bold">High engagement</span>
          </div>
        </div>

        <div className="bg-cream p-lg rounded-2xl border border-sandstone">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Scheduled Items</p>
          <p className="font-display-xl text-display-xl text-primary font-bold">8</p>
          <div className="flex items-center gap-1 mt-2 text-aarti-gold">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span className="font-label-sm text-label-sm font-bold">Next: Maha Shivratri Update</span>
          </div>
        </div>

        <div className="bg-cream p-lg rounded-2xl border border-sandstone">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Draft Items</p>
          <p className="font-display-xl text-display-xl text-primary font-bold">{totalDrafts}</p>
          <div className="flex items-center gap-1 mt-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            <span className="font-label-sm text-label-sm font-bold">Requires review</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-md border-b border-sandstone pb-4">
        <div className="flex items-center bg-sandstone/30 rounded-lg p-1 gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md font-label-md text-label-md font-bold transition-all ${
              activeTab === "all" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant hover:bg-white/40"
            }`}
          >
            All Stories
          </button>
          <button
            onClick={() => setActiveTab("announcement")}
            className={`px-4 py-2 rounded-md font-label-md text-label-md font-bold transition-all ${
              activeTab === "announcement" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant hover:bg-white/40"
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("festival_update")}
            className={`px-4 py-2 rounded-md font-label-md text-label-md font-bold transition-all ${
              activeTab === "festival_update" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant hover:bg-white/40"
            }`}
          >
            Festival Updates
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-md font-label-md text-label-md font-bold transition-all ${
              activeTab === "general" ? "bg-white text-primary shadow-xs" : "text-on-surface-variant hover:bg-white/40"
            }`}
          >
            Community Stories
          </button>
        </div>

        <div className="flex items-center gap-sm">
          <button className="flex items-center gap-2 px-4 py-2 border border-sandstone rounded-lg hover:bg-cream bg-white transition-colors font-label-md text-label-md font-bold">
            <span className="material-symbols-outlined text-[16px]">language</span>
            Language: All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-sandstone rounded-lg hover:bg-cream bg-white transition-colors font-label-md text-label-md font-bold">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            More Filters
          </button>
        </div>
      </div>

      {/* Article Cards Grid */}
      {loadingNews ? (
        <div className="p-16 text-center text-on-surface-variant font-label-md">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          Loading community feeds...
        </div>
      ) : filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filteredArticles.map((article: any) => (
            <article
              key={article.id}
              onClick={() => handleOpenArticle(article)}
              className="group bg-white border border-sandstone rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {article.banner_image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.banner_image_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={article.title}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full text-label-sm font-bold text-primary uppercase text-xs">
                        {article.language || "EN"}
                      </span>
                      <span
                        className={`px-3 py-1 backdrop-blur-xs rounded-full text-label-sm font-bold text-white uppercase text-xs ${
                          article.status === "published" ? "bg-tulsi-green/90" : "bg-charcoal/80"
                        }`}
                      >
                        {article.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-sandstone/30 flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-sandstone text-5xl">image</span>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full text-label-sm font-bold text-primary uppercase text-xs">
                        {article.language || "EN"}
                      </span>
                      <span
                        className={`px-3 py-1 backdrop-blur-xs rounded-full text-label-sm font-bold text-white uppercase text-xs ${
                          article.status === "published" ? "bg-tulsi-green/90" : "bg-charcoal/80"
                        }`}
                      >
                        {article.status}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-lg">
                  <div className="flex items-center gap-2 text-aarti-gold mb-2 text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">celebration</span>
                    {article.category?.replace("_", " ")}
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-charcoal mb-2 font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-on-surface-variant text-body-md line-clamp-3 leading-relaxed mt-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-lg pb-lg">
                <div className="flex items-center justify-between pt-4 border-t border-sandstone/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sandstone flex items-center justify-center font-bold text-primary text-xs shrink-0">
                      {article.created_by ? article.created_by.slice(0, 2).toUpperCase() : "AD"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm text-charcoal font-bold truncate">
                        {article.created_by?.split("@")[0] || "Admin"}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-semibold">
                        {new Date(article.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-bold mr-2">
                      <span className="material-symbols-outlined text-[15px] text-primary">visibility</span>
                      <span>{article.read_count || 0}</span>
                    </div>
                    <button className="p-1 hover:bg-sandstone/50 rounded-full text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button className="p-1 hover:bg-sandstone/50 rounded-full text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center text-on-surface-variant border border-dashed border-sandstone rounded-2xl bg-cream/10">
          No articles match the filter.
        </div>
      )}

      {/* Recent Content Performance Table */}
      {articles.length > 0 && (
        <div className="mt-xl bg-white border border-sandstone rounded-2xl overflow-hidden hidden md:block">
          <div className="p-lg border-b border-sandstone bg-cream/30 flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-charcoal font-bold">Recent Content Performance</h3>
            <span className="text-primary font-label-md text-label-md font-bold">Live Analytics</span>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-cream/50 text-on-surface-variant font-label-md text-label-sm uppercase tracking-wider border-b border-sandstone">
              <tr>
                <th className="px-lg py-4">Title & Author</th>
                <th className="px-lg py-4">Status</th>
                <th className="px-lg py-4">Reach</th>
                <th className="px-lg py-4">Language</th>
                <th className="px-lg py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sandstone">
              {articles.slice(0, 5).map((art: any) => (
                <tr key={art.id} className="hover:bg-cream/20 transition-colors">
                  <td className="px-lg py-4">
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-bold text-charcoal">{art.title}</span>
                      <span className="text-label-sm text-on-surface-variant">By {art.created_by?.split("@")[0] || "Admin"}</span>
                    </div>
                  </td>
                  <td className="px-lg py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                      art.status === "published" ? "bg-tulsi-green/10 text-tulsi-green" : "bg-charcoal/10 text-charcoal"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${art.status === "published" ? "bg-tulsi-green" : "bg-charcoal"}`}></span>
                      {art.status}
                    </span>
                  </td>
                  <td className="px-lg py-4 font-mono-data text-mono-data text-xs font-bold text-charcoal">
                    {(art.read_count || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-lg py-4 text-xs font-bold uppercase text-on-surface-variant">
                    {art.language || "EN"}
                  </td>
                  <td className="px-lg py-4 text-right">
                    <button
                      onClick={() => handleOpenArticle(art)}
                      className="text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">analytics</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Multilingual Compose Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border-l border-sandstone h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl relative animate-in slide-in-from-right duration-300 overflow-y-auto">
            
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-6 right-6 p-2 bg-[#FAFAF8] border border-[#E8E2D6] hover:bg-[#F4F1EB] rounded-lg text-gray-500 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#3A3530] uppercase tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">post_add</span>
                  Compose Multilingual Update
                </h2>
                <p className="text-gray-500 text-xs mt-1 font-semibold leading-relaxed">
                  Compose and dispatch articles across English, Hindi, and Gujarati versions of connected feeds.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error-container text-error rounded-xl text-xs font-semibold text-center border border-error/20">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs font-semibold text-[#554334]">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Navratri Festival Schedule"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Title (Hindi)</label>
                    <input
                      type="text"
                      value={titleHi}
                      onChange={(e) => setTitleHi(e.target.value)}
                      placeholder="e.g. नवरात्रि उत्सव अनुसूची"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Title (Gujarati)</label>
                    <input
                      type="text"
                      value={titleGu}
                      onChange={(e) => setTitleGu(e.target.value)}
                      placeholder="e.g. નવરાત્રી ઉત્સવ કાર્યક્રમ"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Short Abstract / Excerpt</label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Provide a quick 1-sentence headline summary"
                    className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Body Description (English) *</label>
                    <textarea
                      rows={3}
                      required
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write full article description here..."
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Body (Hindi)</label>
                      <textarea
                        rows={2}
                        value={bodyHi}
                        onChange={(e) => setBodyHi(e.target.value)}
                        placeholder="हिंदी अनुवाद..."
                        className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Body (Gujarati)</label>
                      <textarea
                        rows={2}
                        value={bodyGu}
                        onChange={(e) => setBodyGu(e.target.value)}
                        placeholder="ગુજરાતી અનુવાદ..."
                        className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Feed Category</label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary font-bold"
                    >
                      <option value="general">General Updates</option>
                      <option value="festival_update">Festival Update</option>
                      <option value="announcement">Announcement</option>
                      <option value="achievement">Achievement</option>
                      <option value="charity">Charity / Seva</option>
                      <option value="press">Press Release</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Primary Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="en">English (default)</option>
                      <option value="hi">Hindi</option>
                      <option value="gu">Gujarati</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Status</label>
                    <select
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="draft">Save as Draft</option>
                      <option value="published">Publish Instantly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Banner Image URL</label>
                    <input
                      type="url"
                      value={bannerImageUrl}
                      onChange={(e) => setBannerImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-2">Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g. navratri, schedule, puja"
                      className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-container text-on-primary-container hover:opacity-90 font-bold py-4 rounded-xl shadow-lg mt-4 uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-on-primary-container border-t-transparent animate-spin" />
                      <span>Disbursing Article...</span>
                    </>
                  ) : (
                    "Save News Article"
                  )}
                </button>
              </form>
            </div>

            <div className="bg-[#FAFAF8] border border-sandstone p-4 rounded-xl flex gap-3 text-gray-500 text-[11px] font-semibold leading-relaxed mt-6">
              <AlertTriangle className="w-5 h-5 text-aarti-gold shrink-0" />
              <span>
                News updates are published instantly to public web landing screens and app notification modules if marked as Published.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Article Detail Preview Modal */}
      {viewedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-sandstone rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setViewedArticle(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-5 h-5" />
            </button>

            {viewedArticle.banner_image_url && (
              <div className="h-64 rounded-xl overflow-hidden mb-6">
                <img
                  src={viewedArticle.banner_image_url}
                  className="w-full h-full object-cover"
                  alt={activeContent.title}
                />
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              {/* Translations switcher in detail modal */}
              <button
                onClick={() => setLangOverride("en")}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  langOverride === "en" ? "bg-primary text-white" : "bg-cream text-charcoal hover:bg-sandstone"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLangOverride("hi")}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  langOverride === "hi" ? "bg-primary text-white" : "bg-cream text-charcoal hover:bg-sandstone"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLangOverride("gu")}
                className={`px-3 py-1 rounded text-xs font-bold ${
                  langOverride === "gu" ? "bg-primary text-white" : "bg-cream text-charcoal hover:bg-sandstone"
                }`}
              >
                ગુજરાતી
              </button>
            </div>

            <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal">
              {activeContent.title}
            </h3>

            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mt-2">
              Category: {viewedArticle.category?.replace("_", " ")}
            </p>

            <div className="my-6 border-t border-b border-sandstone/50 py-4 text-body-lg text-charcoal leading-relaxed whitespace-pre-wrap">
              {activeContent.body}
            </div>

            <div className="flex justify-between items-center text-xs text-on-surface-variant font-bold">
              <span>Published on: {new Date(viewedArticle.created_at).toLocaleDateString("en-IN")}</span>
              <span>Reads: {viewedArticle.read_count || 0}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
