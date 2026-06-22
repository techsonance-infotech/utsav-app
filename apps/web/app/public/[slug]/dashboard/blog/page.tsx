"use client";

import React, { useState } from "react";
import {
  useBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost
} from "@utsav/api-client";
import { useAuthStore } from "@utsav/stores";
import { useParams } from "next/navigation";
import {
  X,
  Globe,
  Eye,
  MessageSquare,
  AlertTriangle,
  Plus,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Check,
  Hash,
  Share2
} from "lucide-react";

export default function WebBlogPage() {
  const { role } = useAuthStore();
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const { data: posts = [], isLoading: loadingPosts, refetch } = useBlogPosts(true) as any;
  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();
  const deleteMutation = useDeleteBlogPost();

  // Form & Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState<
    "festival_story" | "tradition_culture" | "volunteer_voice" | "committee_update" | "recipe" | "other"
  >("other");
  const [language, setLanguage] = useState("en");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled" | "archived">("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [estimatedReadMins, setEstimatedReadMins] = useState("5");
  const [allowComments, setAllowComments] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingPost, setDeletingPost] = useState<any | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState("");

  // Tab filter states
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const hasAdminAccess = ["owner", "admin"].includes(role || "");

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setPostSlug("");
    setBody("");
    setExcerpt("");
    setCoverImageUrl("");
    setCategory("other");
    setLanguage("en");
    setTagsInput("");
    setStatus("draft");
    setScheduledAt("");
    setEstimatedReadMins("5");
    setAllowComments(false);
    setMetaTitle("");
    setMetaDescription("");
    setEditingPostId(null);
    setErrorMsg("");
  };

  const handleEdit = (post: any) => {
    setEditingPostId(post.id);
    setTitle(post.title || "");
    setSubtitle(post.subtitle || "");
    setPostSlug(post.slug || "");
    setBody(post.body || "");
    setExcerpt(post.excerpt || "");
    setCoverImageUrl(post.cover_image_url || "");
    setCategory(post.category || "other");
    setLanguage(post.language || "en");
    setTagsInput(post.tags?.join(", ") || "");
    setStatus(post.status || "draft");
    setScheduledAt(post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : "");
    setEstimatedReadMins(String(post.estimated_read_mins || "5"));
    setAllowComments(!!post.allow_comments);
    setMetaTitle(post.meta_title || "");
    setMetaDescription(post.meta_description || "");
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (post: any) => {
    setDeletingPost(post);
    setDeleteErrorMsg("");
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) return;
    try {
      await deleteMutation.mutateAsync(deletingPost.id);
      setDeletingPost(null);
      refetch();
    } catch (err: any) {
      setDeleteErrorMsg(err.message || "Failed to delete blog article");
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // Auto slugification if creating new article
    if (!editingPostId) {
      const slugified = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setPostSlug(slugified);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title || !body || !postSlug) {
      setErrorMsg("Title, Body, and Slug are required.");
      return;
    }

    if (status === "scheduled" && !scheduledAt) {
      setErrorMsg("Scheduled Date & Time is required for scheduled status.");
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

      const payload = {
        title,
        subtitle: subtitle || undefined,
        slug: postSlug,
        body,
        excerpt: excerpt || undefined,
        cover_image_url: coverImageUrl || undefined,
        category,
        language,
        tags,
        status,
        scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        estimated_read_mins: Number(estimatedReadMins) || 5,
        allow_comments: allowComments,
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
      };

      if (editingPostId) {
        await updateMutation.mutateAsync({
          postId: editingPostId,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      resetForm();
      setIsDrawerOpen(false);
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save blog post");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client side filters
  const filteredPosts = posts.filter((post: any) => {
    if (activeTab !== "all" && post.category !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = post.title?.toLowerCase().includes(q);
      const inBody = post.body?.toLowerCase().includes(q);
      const inSubtitle = post.subtitle?.toLowerCase().includes(q);
      if (!inTitle && !inBody && !inSubtitle) return false;
    }
    return true;
  });

  // Counters
  const totalPublished = posts.filter((p: any) => p.status === "published").length;
  const totalDrafts = posts.filter((p: any) => p.status === "draft").length;
  const scheduledPosts = posts.filter((p: any) => p.status === "scheduled");
  const totalScheduled = scheduledPosts.length;
  const sortedScheduled = [...scheduledPosts].sort(
    (a: any, b: any) => new Date(a.scheduled_at || 0).getTime() - new Date(b.scheduled_at || 0).getTime()
  );
  const nextScheduledTitle = sortedScheduled[0] ? `Next: ${sortedScheduled[0].title}` : "No upcoming items";

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      {/* Header section with inline search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-display-xl text-display-xl text-primary font-bold">Blog Articles</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-1">
            Compose and edit cultural stories, historical accounts, and long-form chronicles of your festival celebrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              placeholder="Search chronicles..."
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
              <Plus className="w-5 h-5" />
              Compose Story
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
            <Check className="w-4 h-4" />
            <span className="font-label-sm text-label-sm font-bold">Live on public portal</span>
          </div>
        </div>

        <div className="bg-cream p-lg rounded-2xl border border-sandstone">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Total Chronicles</p>
          <p className="font-display-xl text-display-xl text-primary font-bold">{posts.length}</p>
          <div className="flex items-center gap-1 mt-2 text-tulsi-green">
            <BookOpen className="w-4 h-4" />
            <span className="font-label-sm text-label-sm font-bold">Total authored articles</span>
          </div>
        </div>

        <div className="bg-cream p-lg rounded-2xl border border-sandstone">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Scheduled Posts</p>
          <p className="font-display-xl text-display-xl text-primary font-bold">{totalScheduled}</p>
          <div className="flex items-center gap-1 mt-2 text-aarti-gold">
            <Calendar className="w-4 h-4" />
            <span className="font-label-sm text-label-sm font-bold truncate max-w-full" title={nextScheduledTitle}>
              {nextScheduledTitle}
            </span>
          </div>
        </div>

        <div className="bg-cream p-lg rounded-2xl border border-sandstone">
          <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Draft Chronicles</p>
          <p className="font-display-xl text-display-xl text-primary font-bold">{totalDrafts}</p>
          <div className="flex items-center gap-1 mt-2 text-on-surface-variant">
            <Edit3 className="w-4 h-4" />
            <span className="font-label-sm text-label-sm font-bold">Awaiting publication</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-md border-b border-sandstone pb-4">
        <div className="flex flex-wrap items-center bg-sandstone/30 rounded-lg p-1 gap-1">
          {[
            { id: "all", label: "All Stories" },
            { id: "festival_story", label: "Festival Stories" },
            { id: "tradition_culture", label: "Traditions" },
            { id: "volunteer_voice", label: "Volunteer Voices" },
            { id: "committee_update", label: "Committee Updates" },
            { id: "recipe", label: "Recipes" },
            { id: "other", label: "Other" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md font-label-md text-label-md font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-xs"
                  : "text-on-surface-variant hover:bg-white/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {loadingPosts ? (
        <div className="p-16 text-center text-on-surface-variant font-label-md">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          Loading chronicles archives...
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filteredPosts.map((post: any) => (
            <article
              key={post.id}
              className="group bg-white border border-sandstone rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {post.cover_image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.cover_image_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={post.title}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full text-xs font-bold text-primary uppercase">
                        {post.language?.toUpperCase() || "EN"}
                      </span>
                      <span
                        className={`px-3 py-1 backdrop-blur-xs rounded-full text-xs font-bold text-white uppercase ${
                          post.status === "published"
                            ? "bg-tulsi-green/90"
                            : post.status === "scheduled"
                            ? "bg-aarti-gold/90"
                            : "bg-charcoal/80"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-sandstone/30 flex items-center justify-center relative">
                    <BookOpen className="text-sandstone/60 w-12 h-12" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full text-xs font-bold text-primary uppercase">
                        {post.language?.toUpperCase() || "EN"}
                      </span>
                      <span
                        className={`px-3 py-1 backdrop-blur-xs rounded-full text-xs font-bold text-white uppercase ${
                          post.status === "published"
                            ? "bg-tulsi-green/90"
                            : post.status === "scheduled"
                            ? "bg-aarti-gold/90"
                            : "bg-charcoal/80"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-lg">
                  <div className="flex items-center gap-2 text-aarti-gold mb-2 text-xs font-bold uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5" />
                    {post.category?.replace("_", " ")}
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-charcoal mb-2 font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.subtitle && (
                    <p className="text-on-surface-variant text-body-md line-clamp-2 font-medium">
                      {post.subtitle}
                    </p>
                  )}
                  {post.excerpt && (
                    <p className="text-on-surface-variant/80 text-body-md line-clamp-3 leading-relaxed mt-2 text-xs">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-lg border-t border-sandstone/50 bg-[#FCFAF7] flex items-center justify-between text-xs font-bold text-on-surface-variant">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{post.estimated_read_mins || 5} min read</span>
                </div>

                {hasAdminAccess && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(post);
                      }}
                      className="p-2 border border-sandstone hover:bg-cream rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Edit article"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(post);
                      }}
                      className="p-2 border border-sandstone hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Delete article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-cream/40 rounded-2xl border border-dashed border-sandstone text-on-surface-variant font-label-md">
          <BookOpen className="w-10 h-10 mx-auto text-sandstone/60 mb-2" />
          No blog chronicles found matching the active criteria.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border border-sandstone rounded-2xl max-w-md w-full p-lg space-y-lg shadow-xl animate-scale-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 text-[#c62828] rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-title-lg text-title-lg font-bold text-primary">Delete Chronicle?</h3>
                <p className="text-on-surface-variant text-body-medium mt-2 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-charcoal">"{deletingPost.title}"</span>? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {deleteErrorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg font-semibold">
                {deleteErrorMsg}
              </div>
            )}

            <div className="flex justify-end items-center gap-3">
              <button
                onClick={() => setDeletingPost(null)}
                className="px-4 py-2 border border-sandstone hover:bg-cream rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 bg-[#c62828] text-white hover:bg-red-700 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Drawer Form */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => {
              resetForm();
              setIsDrawerOpen(false);
            }}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-xl flex flex-col justify-between border-l border-sandstone animate-slide-in">
              {/* Drawer Header */}
              <div className="px-6 py-5 bg-[#FCFAF7] border-b border-sandstone flex justify-between items-center">
                <div>
                  <h3 className="font-title-lg text-title-lg font-bold text-primary flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {editingPostId ? "Edit Blog Chronicle" : "Compose Editorial Story"}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Write long-form updates, cultural journals, or tradition notes.
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setIsDrawerOpen(false);
                  }}
                  className="p-2 border border-sandstone hover:bg-cream rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-lg">
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Core Field sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Article Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. The Spiritual Significance of Aarti Rituals"
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
                      placeholder="Brief one-line subtitle summary..."
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
                      placeholder="e.g. spiritual-significance-aarti"
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
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="festival_story">Festival Stories</option>
                      <option value="tradition_culture">Tradition & Culture</option>
                      <option value="volunteer_voice">Volunteer Voices</option>
                      <option value="committee_update">Committee Updates</option>
                      <option value="recipe">Recipes</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Default Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary cursor-pointer"
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
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="draft">Draft (Private edit)</option>
                      <option value="published">Published (Live public site)</option>
                      <option value="scheduled">Scheduled (Delayed release)</option>
                      <option value="archived">Archived (Withdrawn)</option>
                    </select>
                  </div>

                  {status === "scheduled" && (
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-aarti-gold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Scheduled Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary font-mono"
                        required
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5" /> Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. culture, tradition, aarti, festival"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Brief Excerpt
                    </label>
                    <input
                      type="text"
                      placeholder="Short 1-sentence synopsis for list feeds..."
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="bg-white border border-sandstone/70 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Body Textarea */}
                <div className="flex flex-col gap-1 pt-2">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Article Body Content (Markdown / HTML supported)
                  </label>
                  <textarea
                    placeholder="Draft your story narrative chronicle details here..."
                    rows={12}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="bg-white border border-sandstone/70 rounded-xl p-4 text-sm font-semibold focus:outline-none focus:border-primary font-mono leading-relaxed resize-y"
                    required
                  />
                </div>

                {/* SEO Settings */}
                <div className="border-t border-sandstone pt-lg space-y-md">
                  <div>
                    <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> SEO & Meta Header Settings
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Configure custom properties for indexing and search engine visibility.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        placeholder="History of Mandal | Utsav"
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
                        placeholder="Brief summary optimized for search results..."
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
                      className="w-4 h-4 text-primary border-sandstone rounded-md focus:ring-primary focus:outline-none cursor-pointer"
                    />
                    <label
                      htmlFor="allowCommentsCheck"
                      className="text-xs font-bold text-on-surface-variant cursor-pointer select-none"
                    >
                      Enable comments section for verified mandal members
                    </label>
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="border-t border-sandstone pt-lg flex items-center justify-end gap-3 pb-6">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setIsDrawerOpen(false);
                    }}
                    className="px-4 py-2 border border-sandstone hover:bg-cream rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-primary text-white hover:bg-primary-hover disabled:bg-sandstone disabled:cursor-not-allowed font-semibold rounded-xl shadow-md saffron-glow active:scale-95 duration-100 transition-all flex items-center gap-1.5 text-xs"
                  >
                    {isSubmitting ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {editingPostId ? "Save Changes" : "Publish Post"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
