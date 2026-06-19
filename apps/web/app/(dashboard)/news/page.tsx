"use client";

import React, { useState } from "react";
import { useNewsArticles, useCreateNewsArticle, useIncrementNewsRead } from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { NewsCard } from "@utsav/ui";

export default function WebNewsPage() {
  const { role } = useAuthStore();
  const { data: articles = [], isLoading: loadingNews } = useNewsArticles(true) as any;

  const createMutation = useCreateNewsArticle();
  const incrementRead = useIncrementNewsRead();

  // Create Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      setShowCreateModal(false);
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6 text-neutral-100 min-h-screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-100">News & Announcements</h1>
          <p className="text-sm text-neutral-400 mt-1">Publish notices, festival schedules, achievements, and notifications.</p>
        </div>
        {hasAdminAccess && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all self-start md:self-auto"
          >
            + Compose Article
          </button>
        )}
      </div>

      {/* Grid of news articles */}
      {loadingNews ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((item: any) => (
            <NewsCard
              key={item.id}
              article={item}
              onPress={() => handleOpenArticle(item)}
              onTranslate={(lang) => {
                setViewedArticle(item);
                setLangOverride(lang);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
          <p className="text-neutral-500 text-sm">No news articles created yet.</p>
        </div>
      )}

      {/* Compose Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-100">Compose News Article</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-100 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-6 flex-1">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Titles */}
                <div className="space-y-1 md:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                    placeholder="Grand Aarti Scheduled"
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Title (Hindi)</label>
                  <input
                    type="text"
                    value={titleHi}
                    onChange={(e) => setTitleHi(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                    placeholder="महा आरती का आयोजन"
                  />
                </div>
                <div className="space-y-1 md:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Title (Gujarati)</label>
                  <input
                    type="text"
                    value={titleGu}
                    onChange={(e) => setTitleGu(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                    placeholder="મહા આરતીનું આયોજન"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Short Excerpt (English)</label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                  placeholder="A short summary of the update..."
                />
              </div>

              {/* Bodies */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Body (English) *</label>
                  <textarea
                    rows={4}
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                    placeholder="Write details of the article..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Body (Hindi)</label>
                    <textarea
                      rows={3}
                      value={bodyHi}
                      onChange={(e) => setBodyHi(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                      placeholder="विवरण हिंदी में..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Body (Gujarati)</label>
                    <textarea
                      rows={3}
                      value={bodyGu}
                      onChange={(e) => setBodyGu(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                      placeholder="વિગતવાર ગુજરાતીમાં..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="general">General</option>
                    <option value="festival_update">Festival Update</option>
                    <option value="announcement">Announcement</option>
                    <option value="achievement">Achievement</option>
                    <option value="press">Press</option>
                    <option value="charity">Charity</option>
                  </select>
                </div>

                {/* Banner Image URL */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Banner Image URL</label>
                  <input
                    type="url"
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="draft">Save Draft</option>
                    <option value="published">Publish Now</option>
                  </select>
                </div>
              </div>

              {/* Tags & Default Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                    placeholder="aarti, cultural, schedule"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Default Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-orange-500"
                    placeholder="en"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Viewer Modal */}
      {viewedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  {viewedArticle.category}
                </span>
                <span className="text-xs text-neutral-500">
                  {new Date(viewedArticle.published_at || viewedArticle.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => setViewedArticle(null)}
                className="text-neutral-400 hover:text-neutral-100 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 space-y-6">
              {viewedArticle.banner_image_url && (
                <img
                  src={viewedArticle.banner_image_url}
                  alt={viewedArticle.title}
                  className="w-full h-60 object-cover rounded-xl border border-neutral-800"
                />
              )}

              <div className="flex justify-between items-start gap-4">
                <h2 className="text-2xl font-black tracking-tight text-neutral-100 leading-snug">
                  {activeContent.title}
                </h2>
                {/* Language Selectors */}
                <div className="flex gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-850">
                  {(["en", "hi", "gu"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLangOverride(lang)}
                      className={`text-[10px] px-2 py-1 rounded uppercase font-semibold ${
                        langOverride === lang
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          : "text-neutral-400 border border-transparent hover:text-neutral-200"
                      }`}
                    >
                      {lang === "en" ? "EN" : lang === "hi" ? "हिं" : "ગુ"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-neutral-800" />

              <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                {activeContent.body}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
