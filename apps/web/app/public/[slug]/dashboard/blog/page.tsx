"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@utsav/stores";
import { apiClient } from "@utsav/api-client";
import { useParams } from "next/navigation";
import { BookOpen, Plus, Trash2, Edit3, Check, Globe, HelpCircle, Eye } from "lucide-react";

export default function WebBlogPage() {
  const { role: userRole } = useAuthStore();
  const queryClient = useQueryClient();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  // Selected post for editor
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState("festival_history");
  const [language, setLanguage] = useState("en");
  const [status, setStatus] = useState("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [estimatedReadMins, setEstimatedReadMins] = useState("5");
  const [allowComments, setAllowComments] = useState(false);

  // Fetch Blog posts list (includes drafts)
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => apiClient<any[]>("/blog?includeDrafts=true"),
  }) as any;

  // Create Blog Mutation
  const createBlogMutation = useMutation({
    mutationFn: (data: any) => apiClient("/blog", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      handleSelectPost(data);
    },
  });

  // Update Blog Mutation
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient(`/blog/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });

  // Delete Blog Mutation
  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/blog/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      handleNewArticle();
    },
  });

  const handleSelectPost = (post: any) => {
    setSelectedPostId(post.id);
    setTitle(post.title || "");
    setSubtitle(post.subtitle || "");
    setPostSlug(post.slug || "");
    setBody(post.body || "");
    setExcerpt(post.excerpt || "");
    setCoverImageUrl(post.cover_image_url || "");
    setCategory(post.category || "festival_history");
    setLanguage(post.language || "en");
    setStatus(post.status || "draft");
    setMetaTitle(post.meta_title || "");
    setMetaDescription(post.meta_description || "");
    setEstimatedReadMins(String(post.estimated_read_mins || "5"));
    setAllowComments(!!post.allow_comments);
  };

  const handleNewArticle = () => {
    setSelectedPostId(null);
    setTitle("");
    setSubtitle("");
    setPostSlug("");
    setBody("");
    setExcerpt("");
    setCoverImageUrl("");
    setCategory("festival_history");
    setLanguage("en");
    setStatus("draft");
    setMetaTitle("");
    setMetaDescription("");
    setEstimatedReadMins("5");
    setAllowComments(false);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Auto slugification if creating new article
    if (!selectedPostId) {
      const slugified = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setPostSlug(slugified);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !postSlug.trim() || !body.trim()) return;

    const payload = {
      title,
      subtitle: subtitle || null,
      slug: postSlug,
      body,
      excerpt: excerpt || null,
      cover_image_url: coverImageUrl || null,
      category,
      language,
      status,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      estimated_read_mins: Number(estimatedReadMins) || 5,
      allow_comments: allowComments,
    };

    if (selectedPostId) {
      updateBlogMutation.mutate({ id: selectedPostId, data: payload });
    } else {
      createBlogMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog article?")) {
      deleteBlogMutation.mutate(id);
    }
  };

  const isMutating =
    createBlogMutation.isPending ||
    updateBlogMutation.isPending ||
    deleteBlogMutation.isPending;

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display-md text-display-md font-bold text-primary">
            Blog Articles
          </h2>
          <p className="text-on-surface-variant font-body-medium">
            Compose and edit cultural stories, historical accounts, and long-form festival chronicles.
          </p>
        </div>
        <button
          onClick={handleNewArticle}
          className="bg-primary text-white hover:bg-primary-hover shadow-sm active:scale-95 duration-100 transition-all font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-5 h-5" /> New Editorial Article
        </button>
      </div>

      {loadingPosts ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-sans tracking-wide text-on-surface-variant">
            Loading editorial archives...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Left Column: Articles list */}
          <div className="lg:col-span-1 space-y-md">
            <div className="bg-cream border border-sandstone rounded-2xl p-lg space-y-md">
              <h3 className="font-title-md text-title-md font-bold text-primary">
                Editorial Index
              </h3>
              {posts.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">
                  No blog articles written yet.
                </p>
              ) : (
                <div className="space-y-sm">
                  {posts.map((post: any) => (
                    <div
                      key={post.id}
                      onClick={() => handleSelectPost(post)}
                      className={`p-md rounded-xl border cursor-pointer transition-all flex flex-col gap-2 ${
                        selectedPostId === post.id
                          ? "bg-primary-container/10 border-primary text-primary shadow-xs"
                          : "bg-white border-sandstone/70 hover:bg-[#F4F1EB]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-sm font-bold leading-snug line-clamp-2">
                          {post.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post.id);
                          }}
                          className="text-on-surface-variant hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {post.subtitle && (
                        <p className="text-xs text-on-surface-variant line-clamp-1">
                          {post.subtitle}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mt-1 text-on-surface-variant">
                        <span className={`px-2 py-0.5 rounded-full border ${
                          post.status === "published"
                            ? "bg-green-50 text-[#2e7d32] border-green-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          {post.status}
                        </span>
                        <span>{post.language?.toUpperCase()} • {post.estimated_read_mins || 5} min read</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Composer Form */}
          <div className="lg:col-span-2 space-y-md relative">
            {isMutating && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xs flex items-center justify-center z-10 rounded-2xl">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <form
              onSubmit={handleSave}
              className="bg-cream border border-sandstone rounded-2xl p-lg space-y-lg"
            >
              <div className="flex justify-between items-center border-b border-sandstone pb-4">
                <h3 className="font-title-lg text-title-lg font-bold text-primary flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {selectedPostId ? "Article Editor" : "Slate Composer"}
                </h3>
                <div className="flex items-center gap-2">
                  {selectedPostId && (
                    <button
                      type="button"
                      onClick={handleNewArticle}
                      className="px-3 py-1.5 border border-sandstone bg-white rounded-xl text-xs font-bold hover:bg-[#F4F1EB] active:scale-95 duration-100 transition-all"
                    >
                      New Post
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!title.trim() || !postSlug.trim() || !body.trim() || isMutating}
                    className="bg-primary text-white hover:bg-primary-hover disabled:bg-sandstone disabled:cursor-not-allowed font-semibold px-4 py-1.5 rounded-xl shadow-sm active:scale-95 duration-100 transition-all flex items-center gap-1 text-xs"
                  >
                    <Check className="w-4 h-4" />
                    {selectedPostId ? "Save Article" : "Create Post"}
                  </button>
                </div>
              </div>

              {/* Core fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Article Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter main heading..."
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="Write a brief overview..."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ganesh-utsav-chronicle"
                    value={postSlug}
                    onChange={(e) => setPostSlug(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary font-mono"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Cover Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Category Segment
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="festival_history">Historical chronicles</option>
                    <option value="cultural_rituals">Cultural Rituals</option>
                    <option value="community_narrative">Community Narrative</option>
                    <option value="other">Miscellaneous</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Default Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="en">English (default)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="gu">Gujarati (ગુજરાતી)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Estimated Reading Time (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={estimatedReadMins}
                    onChange={(e) => setEstimatedReadMins(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary appearance-none cursor-pointer"
                  >
                    <option value="draft">Draft (Private edit)</option>
                    <option value="published">Published (Live public site)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Brief Excerpt
                  </label>
                  <input
                    type="text"
                    placeholder="Short 1-sentence synopsis for lists..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Composition Body */}
              <div className="flex flex-col gap-1 pt-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Article Body (HTML / Markdown syntax supported)
                </label>
                <textarea
                  placeholder="Draft your chronicle narrative details here..."
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="bg-white border border-sandstone/70 rounded-xl p-4 text-sm font-semibold focus:outline-none focus:border-primary font-mono leading-relaxed resize-y"
                  required
                />
              </div>

              {/* SEO configuration fields */}
              <div className="border-t border-sandstone pt-lg space-y-md">
                <div>
                  <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> SEO & Meta Header Settings
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Custom properties to configure Google Search console visibility.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. History of Shri Ganesh Mandal | Utsav"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Meta Description
                    </label>
                    <input
                      type="text"
                      placeholder="Brief excerpt optimized for search indexing results..."
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="allowCommentsCheck"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="w-4 h-4 text-primary border-sandstone rounded-md focus:ring-primary focus:outline-none"
                  />
                  <label htmlFor="allowCommentsCheck" className="text-xs font-bold text-on-surface-variant cursor-pointer">
                    Enable comments section for verified mandal members
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
