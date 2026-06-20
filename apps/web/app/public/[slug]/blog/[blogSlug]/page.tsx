import React from "react";
import { createServiceRoleClient } from "../../../../api/v1/utils";
import Link from "next/link";
import {
  Flame,
  Clock,
  Calendar,
  ArrowLeft,
  Tag,
  BookOpen,
} from "lucide-react";
import PublicHeader from "../../../../components/PublicHeader";

interface PublicBlogDetailPageProps {
  params: {
    slug: string;
    blogSlug: string;
  };
}

export async function generateMetadata({ params }: PublicBlogDetailPageProps) {
  const supabase = createServiceRoleClient();
  
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", params.slug)
    .single();

  if (!tenant) return { title: "Blog Post" };

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("tenant_id", tenant.id)
    .eq("slug", params.blogSlug)
    .single();

  return {
    title: post?.title ? `${post.title} | Blog 🪔` : "Blog Article",
    description: post?.excerpt || "Mandal devotional article details",
  };
}

export default async function PublicBlogDetailPage({ params }: PublicBlogDetailPageProps) {
  const supabase = createServiceRoleClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug, primary_color")
    .eq("slug", params.slug)
    .single();

  if (!tenant) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-md border border-gray-150">
          <h2 className="text-2xl font-bold text-gray-800">Organization Not Found</h2>
        </div>
      </div>
    );
  }

  // Fetch the specific blog post details
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("slug", params.blogSlug)
    .single();

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-8">
        <div className="bg-white border border-[#E8E2D6] p-8 rounded-3xl text-center max-w-sm shadow-sm">
          <BookOpen className="w-12 h-12 text-[#8c5000] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-zinc-900">Article Not Found</h2>
          <p className="text-xs text-zinc-500 mt-2">The requested blog post could not be located or has been unpublished.</p>
          <Link
            href={`/${params.slug}/blog`}
            className="inline-block mt-5 px-5 py-2.5 bg-[#8c5000] hover:bg-[#8c5000]/90 text-white rounded-xl text-xs font-bold transition-all"
          >
            Back to Blog List
          </Link>
        </div>
      </div>
    );
  }

  const primaryColor = tenant.primary_color || "#8c5000";
  const pubDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
  const coverUrl = post.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDFXWc1RplQp8Bv6fC_JqL-aKxHlA7J6qJszNq3vK6Xz4P4hKj7e9xY8=s600";

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1e1b18] flex flex-col font-sans selection:bg-[#ff9500]/20 selection:text-[#2d1600]">
      {/* Navigation Header */}
      <PublicHeader tenant={tenant} currentSlug={params.slug} />

      <main className="max-w-4xl mx-auto px-6 py-32 flex-1 w-full space-y-6">
        
        {/* Back Link */}
        <Link
          href={`/${params.slug}/blog`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#8c5000] hover:text-[#ff9500] hover:gap-2 transition-all uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
          Back to all articles
        </Link>

        {/* Article Wrapper Card */}
        <article className="bg-white border border-[#E8E2D6] rounded-3xl overflow-hidden shadow-sm p-6 md:p-10 space-y-6">
          
          <div className="space-y-4">
            <span className="inline-block px-3.5 py-1.5 rounded-xl bg-[#F4F1EB] border border-[#E8E2D6] text-[9px] text-[#8c5000] font-black uppercase tracking-wider">
              {post.category || "Devotional"}
            </span>

            <h1 className="text-2xl md:text-4xl font-extrabold text-[#3A3530] tracking-tight leading-tight uppercase font-headline-lg">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-sm text-gray-400 font-semibold italic border-l-4 pl-4 border-[#ff9500]/50">
                {post.subtitle}
              </p>
            )}

            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase pt-2">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">calendar_month</span>
                Published on {pubDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              {post.estimated_read_mins && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {post.estimated_read_mins} min read
                </span>
              )}
            </div>
          </div>

          {/* Cover image banner */}
          <div className="w-full max-h-[400px] overflow-hidden rounded-2xl bg-zinc-50 border border-gray-100 shadow-inner">
            <img
              className="w-full h-full object-cover"
              alt={post.title}
              src={coverUrl}
            />
          </div>

          {/* Article Body */}
          <div className="text-xs md:text-sm text-[#554334] leading-relaxed whitespace-pre-wrap font-medium space-y-4 pt-6 border-t border-gray-100">
            {post.body}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
              {post.tags.map((tag: string) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4F1EB] border border-[#E8E2D6] text-[9px] text-[#554334] font-bold uppercase tracking-wider">
                  <Tag className="w-3 h-3 text-[#8c5000]" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Editorial profile credit card */}
          <div className="p-6 bg-[#FAFAF8] rounded-2xl border border-[#E8E2D6] flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#E8E2D6] flex items-center justify-center text-[#8c5000] shrink-0 font-bold">
              ED
            </div>
            <div>
              <p className="text-xs font-bold text-[#3A3530]">Mandal Editorial Board</p>
              <p className="text-[10px] text-[#554334] font-semibold mt-1">Verified spiritually vetted articles reflecting traditional practices.</p>
            </div>
          </div>

        </article>
      </main>

      {/* Footer */}
      <footer className="bg-[#e9e1dc] border-t border-[#dbc2ad] w-full py-12 px-6 text-center text-xs mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-extrabold text-[#8c5000] tracking-widest">🪔 UTSAV APP</span>
          <p className="text-[10px] text-[#554334] font-medium">© {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
