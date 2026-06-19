import React from "react";
import { createServiceRoleClient } from "../../../api/v1/utils";
import Link from "next/link";

interface PublicGalleryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PublicGalleryPageProps) {
  const supabase = createServiceRoleClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", params.slug)
    .single();

  return {
    title: tenant?.name ? `${tenant.name} | Gallery 🪔` : "Mandal Gallery",
  };
}

export default async function PublicGalleryPage({ params }: PublicGalleryPageProps) {
  const supabase = createServiceRoleClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", params.slug)
    .single();

  if (!tenant) {
    return <div className="p-8 text-center text-gray-500 text-sm">Tenant not found</div>;
  }

  // Fetch albums
  const { data: albums } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-gray-800 flex flex-col">
      {/* Header */}
      <div className="w-full py-16 bg-gradient-to-r from-orange-500 to-amber-600 text-center text-white">
        <h1 className="text-3xl md:text-4xl font-black">Mandal Gallery & Media</h1>
        <p className="text-sm opacity-90 mt-2">Relive festivals, ceremonies, community work, and celebrations</p>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-extrabold text-orange-600 tracking-wide text-lg">🪔 UTSAV</span>
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600">
            <Link href={`/public/${params.slug}`} className="hover:text-orange-600">Home</Link>
            <Link href={`/public/${params.slug}/about`} className="hover:text-orange-600">About</Link>
            <Link href={`/public/${params.slug}/events`} className="hover:text-orange-600">Events</Link>
            <Link href={`/public/${params.slug}/news`} className="hover:text-orange-600">News</Link>
            <Link href={`/public/${params.slug}/gallery`} className="text-orange-600">Gallery</Link>
          </div>
          <Link
            href={`/public/${params.slug}/donate`}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-bold shadow-md transition-colors"
          >
            Donate
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {albums && albums.length > 0 ? (
            albums.map((album) => (
              <div key={album.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div
                    className="w-full h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: album.cover_image_url
                        ? `url(${album.cover_image_url})`
                        : "linear-gradient(135deg, #FF9500 0%, #FF5E36 100%)",
                    }}
                  />
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg">{album.name}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{album.description || "View photos and updates."}</p>
                  </div>
                </div>
                <div className="p-5 pt-0 flex justify-between items-center text-xs font-semibold text-gray-500 border-t border-gray-50 mt-4 pt-4">
                  <span>📷 {album.media_count || 0} media files</span>
                  <span className="text-orange-600 hover:underline cursor-pointer">Open Album &rarr;</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm col-span-3 text-center py-12">No public gallery albums available.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-xs mt-12 border-t border-gray-800">
        <p>© {new Date().getFullYear()} {tenant.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
