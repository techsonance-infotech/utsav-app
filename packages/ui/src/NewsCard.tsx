import React from "react";
import type { NewsArticle } from "@utsav/types";

interface NewsCardProps {
  article: NewsArticle;
  onPress?: () => void;
  onTranslate?: (lang: "en" | "hi" | "gu") => void;
  onShare?: () => void;
}

export function NewsCard({ article, onPress, onTranslate, onShare }: NewsCardProps) {
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
      {/* Banner Image */}
      <div className="h-44 bg-neutral-950 relative overflow-hidden flex items-center justify-center border-b border-neutral-855">
        {article.banner_image_url ? (
          <img
            src={article.banner_image_url}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center space-y-1">
            <span className="text-4xl block">🪔</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Utsav News</span>
          </div>
        )}
        <span className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-850 text-orange-400 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
          {article.category || "General"}
        </span>
        <span className="absolute top-3 right-3 bg-neutral-900/80 backdrop-blur-sm border border-neutral-850 text-neutral-400 text-[10px] px-2 py-1 rounded-lg">
          👁 {article.read_count || 0} reads
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-neutral-100 text-lg leading-snug line-clamp-2">
            {article.title}
          </h3>

          <div className="text-[10px] text-neutral-500 flex items-center gap-2">
            <span>📅 {formatDate(article.published_at || article.created_at)}</span>
            <span>•</span>
            <span className="uppercase font-semibold text-neutral-400">Language: {article.language}</span>
          </div>

          {article.excerpt && (
            <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed pt-1">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Action translation chips */}
        {/* Action row: translation chips + share */}
        {(onTranslate || onShare) && (
          <div className="flex items-center gap-2 pt-3 border-t border-neutral-855" onClick={(e) => e.stopPropagation()}>
            {onTranslate && (
              <>
                <span className="text-[10px] text-neutral-500 self-center">Read in:</span>
                {["en", "hi", "gu"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => onTranslate(lang as "en" | "hi" | "gu")}
                    className={`text-[10px] px-2 py-0.5 rounded border border-neutral-800 uppercase font-semibold hover:bg-neutral-800 ${
                      article.language === lang
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                        : "text-neutral-400"
                    }`}
                  >
                    {lang === "en" ? "EN" : lang === "hi" ? "हिं" : "ગુ"}
                  </button>
                ))}
              </>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="ml-auto text-[10px] px-2 py-0.5 rounded border border-neutral-800 text-neutral-400 uppercase font-semibold hover:bg-neutral-800 hover:text-neutral-200 transition-colors"
              >
                📤 Share
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
