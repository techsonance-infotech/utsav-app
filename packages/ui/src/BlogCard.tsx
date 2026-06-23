import React from "react";
import type { BlogPost } from "@utsav/types";

interface BlogCardProps {
  post: BlogPost;
  onPress?: () => void;
}

export function BlogCard({ post, onPress }: BlogCardProps) {
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={onPress}
      className={`bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all flex flex-col ${
        onPress ? "cursor-pointer" : ""
      }`}
    >
      {/* Cover Image */}
      <div className="h-40 bg-neutral-950 relative overflow-hidden flex items-center justify-center border-b border-neutral-855">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center space-y-1">
            <span className="text-4xl block">📖</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Utsav Blog</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-850 text-orange-400 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
          {post.category || "General"}
        </span>
        {post.estimated_read_mins && (
          <span className="absolute top-3 right-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-850 text-neutral-400 text-[10px] px-2 py-1 rounded-lg">
            ⏱ {post.estimated_read_mins} min read
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {post.subtitle && (
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider block">
              {post.subtitle}
            </span>
          )}
          <h3 className="font-bold text-neutral-100 text-base leading-snug line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="text-[10px] text-neutral-500 flex items-center justify-between pt-2 border-t border-neutral-855">
          <span>📅 {formatDate(post.published_at || post.created_at)}</span>
          <span className="uppercase text-neutral-400 font-semibold">{post.language}</span>
        </div>
      </div>
    </div>
  );
}
