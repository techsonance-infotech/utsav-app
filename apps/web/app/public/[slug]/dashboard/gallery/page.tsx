"use client";

import React, { useState } from "react";
import {
  useFetchAlbums,
  useCreateAlbum,
  useFetchAlbumMedia,
  useAddAlbumMedia,
} from "@utsav/api-client";
import { GalleryGrid } from "@utsav/ui";
import { useAuthStore } from "@utsav/stores";
import { CloudUpload, FolderPlus, ArrowLeft, RefreshCw, X, Folder, Image as ImageIcon, Calendar, Plus } from "lucide-react";

export default function GalleryDashboardPage() {
  const { role } = useAuthStore();
  const { data: albums, isLoading: loadingAlbums } = useFetchAlbums();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: media, isLoading: loadingMedia } = useFetchAlbumMedia(selectedAlbumId);
  const createAlbumMutation = useCreateAlbum();
  const addMediaMutation = useAddAlbumMedia();

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");

  const allowedRoles = ["owner", "admin", "treasurer", "committee_member"];
  const isAllowed = allowedRoles.includes(role || "");
  const hasAdminAccess = ["owner", "admin", "treasurer"].includes(role || "");

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAdminAccess) return;
    if (!newAlbumName.trim()) return;
    createAlbumMutation.mutate(
      { name: newAlbumName, description: newAlbumDesc },
      {
        onSuccess: (album) => {
          setSelectedAlbumId(album.id);
          setShowAlbumModal(false);
          setNewAlbumName("");
          setNewAlbumDesc("");
        },
      }
    );
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAdminAccess) return;
    if (!selectedAlbumId || !mediaUrl.trim()) return;
    addMediaMutation.mutate(
      {
        albumId: selectedAlbumId,
        media_url: mediaUrl,
        media_type: "image",
        caption: mediaCaption,
      },
      {
        onSuccess: () => {
          setShowMediaModal(false);
          setMediaUrl("");
          setMediaCaption("");
        },
      }
    );
  };

  const selectedAlbum = albums?.find((a) => a.id === selectedAlbumId);

  // Filtered albums helper
  const filteredAlbums = (albums || []).filter((a: any) => {
    if (activeCategory === "all") return true;
    // Mock category filtering based on album name keywords
    return a.name?.toLowerCase().includes(activeCategory.toLowerCase()) ||
           a.description?.toLowerCase().includes(activeCategory.toLowerCase());
  });

  // Mock cover images for the albums to make them look premium
  const getMockCover = (index: number) => {
    const covers = [
      "https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1609137144813-2d287d1911c4?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1561361513-2d000a50f0db?q=80&w=600&auto=format&fit=crop",
    ];
    return covers[index % covers.length];
  };

  if (!isAllowed) {
    return (
      <div className="p-margin-desktop text-center bg-white rounded-xl border border-sandstone max-w-xl mx-auto mt-20 p-12 shadow-sm font-sans text-on-surface">
        <span className="material-symbols-outlined text-kumkum-red text-[48px] mb-4">gpp_bad</span>
        <h2 className="font-headline-md text-headline-sm font-bold text-on-surface">Access Denied</h2>
        <p className="font-body-md text-on-surface-variant mt-2">
          You are not authorized to view the Gallery Dashboard. Only staff roles are permitted.
        </p>
      </div>
    );
  }

  return (
    <div className="p-margin-desktop space-y-lg w-full font-sans text-on-surface">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-xl text-display-xl text-charcoal font-bold mb-1">Mandal Media Gallery</h1>
          <p className="text-body-lg text-on-surface-variant">
            Preserve and organize high-fidelity cultural media archives.
          </p>
        </div>

        <div className="flex gap-2">
          {selectedAlbumId && hasAdminAccess && (
            <button
              onClick={() => setShowMediaModal(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-container text-on-primary-container hover:opacity-90 rounded-full font-bold shadow-md saffron-glow active:scale-95 transition-transform text-xs uppercase tracking-wider"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Upload Media</span>
            </button>
          )}
          {hasAdminAccess && (
            <button
              onClick={() => setShowAlbumModal(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-cream border border-sandstone text-charcoal hover:bg-sandstone/30 rounded-full font-bold transition-all active:scale-95 text-xs uppercase tracking-wider"
            >
              <FolderPlus className="w-4 h-4 text-primary" />
              <span>New Album</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner (Preserving Festival Legacies) - Render only on catalog view */}
      {!selectedAlbumId && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 saffron-glow">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-xl">
              <h2 className="font-display-xl text-display-xl text-white mb-3">Preserving Festival Legacies</h2>
              <p className="font-body-lg text-body-lg text-white/90">
                High-fidelity preservation of ritual media. Manage metadata, organize ceremony collections, and curate public galleries for the community.
              </p>
            </div>
            {hasAdminAccess && (
              <button
                onClick={() => setShowAlbumModal(true)}
                className="bg-puja-white text-primary px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:shadow-xl transition-all active:scale-95 text-sm shrink-0"
              >
                <FolderPlus className="w-5 h-5" />
                <span>Create Preservation Album</span>
              </button>
            )}
          </div>
          <div className="absolute -right-16 -bottom-16 opacity-10">
            <Folder className="w-[300px] h-[300px] text-white" />
          </div>
        </section>
      )}

      {/* Main Content Area */}
      {!selectedAlbumId ? (
        // ALL ALBUMS CATALOG VIEW
        <div className="space-y-6">
          {/* Filters Bar */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sandstone pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {["All Albums", "Rituals", "Donations", "Public"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === "All Albums" ? "all" : cat.toLowerCase())}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    (cat === "All Albums" && activeCategory === "all") || activeCategory === cat.toLowerCase()
                      ? "bg-primary text-white"
                      : "bg-cream text-on-surface-variant border border-sandstone hover:bg-sandstone/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs text-on-surface-variant font-semibold">
              Total Albums: {albums?.length || 0}
            </div>
          </section>

          {/* Grid Layout */}
          {loadingAlbums ? (
            <div className="p-16 text-center text-on-surface-variant w-full bg-puja-white rounded-xl border border-sandstone">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Loading preservation albums...</span>
            </div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAlbums.map((album: any, idx: number) => (
                <div
                  key={album.id}
                  onClick={() => setSelectedAlbumId(album.id)}
                  className="group bg-puja-white rounded-2xl overflow-hidden border border-sandstone shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-cream shrink-0">
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt={album.name}
                      src={getMockCover(idx)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-tulsi-green/90 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                        {idx % 2 === 0 ? "Public" : "Private"}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <span className="text-white text-xs font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(album.created_at || Date.now()).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </span>
                      <div className="flex items-center gap-1 text-white text-xs font-bold">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Photos ({album.media_count || 0})
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-charcoal text-sm mb-1 group-hover:text-primary transition-colors truncate">
                        {album.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {album.description || "No description provided for this preservation album."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create album placeholder button inside grid */}
              {hasAdminAccess && (
                <button
                  onClick={() => setShowAlbumModal(true)}
                  className="group relative h-[252px] border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-[#F4F1EB]/40 transition-all hover:border-primary shrink-0"
                >
                  <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center group-hover:scale-105 transition-transform group-hover:bg-primary-fixed border border-sandstone">
                    <FolderPlus className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-charcoal text-sm">Create New Album</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Saffron-glow secured</p>
                  </div>
                </button>
              )}
            </section>
          )}
        </div>
      ) : (
        // SINGLE SELECTED ALBUM MEDIA VIEW
        <div className="bg-puja-white border border-sandstone rounded-2xl p-6 min-h-[400px] space-y-6">
          {/* Navigation Breadcrumb / Album Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sandstone pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedAlbumId(undefined)}
                className="p-2 hover:bg-cream/60 rounded-xl border border-sandstone text-charcoal transition-colors active:scale-95"
                title="Back to Catalog"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-bold text-charcoal text-lg">{selectedAlbum?.name}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{selectedAlbum?.description || "No description provided."}</p>
              </div>
            </div>

            {hasAdminAccess && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:opacity-90 rounded-xl font-bold transition-all text-xs active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Photo/Video</span>
                </button>
              </div>
            )}
          </div>

          {/* Media grid feed */}
          {loadingMedia ? (
            <div className="p-16 text-center text-on-surface-variant w-full">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Loading media archives...</span>
            </div>
          ) : media && media.length > 0 ? (
            <div className="gallery-layout">
              <GalleryGrid items={media} />
            </div>
          ) : (
            <div className="text-center py-20 text-on-surface-variant flex flex-col items-center justify-center gap-3">
              <ImageIcon className="w-12 h-12 text-outline-variant" />
              <div>
                <h4 className="font-bold text-charcoal text-sm">This album has no media files</h4>
                <p className="text-xs mt-1 max-w-xs text-on-surface-variant leading-relaxed">
                  {hasAdminAccess
                    ? "Click the \"Add Photo/Video\" button above to upload and register files for public display."
                    : "No media has been uploaded to this preservation album yet."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Album Creation Dialog */}
      {showAlbumModal && hasAdminAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleCreateAlbum}
            className="bg-white rounded-2xl p-6 w-96 border border-sandstone shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-charcoal uppercase tracking-tight flex items-center gap-1.5">
                <FolderPlus className="w-5 h-5 text-primary" /> Create Album
              </h3>
              <button
                type="button"
                onClick={() => setShowAlbumModal(false)}
                className="p-1.5 hover:bg-cream rounded-lg text-outline"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Album Title *</label>
              <input
                type="text"
                required
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="e.g. Ganesh Chaturthi 2026"
                className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Description</label>
              <textarea
                value={newAlbumDesc}
                onChange={(e) => setNewAlbumDesc(e.target.value)}
                placeholder="Write album preservation notes..."
                rows={3}
                className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal"
              />
            </div>

            <div className="flex justify-end gap-2.5 text-xs font-semibold mt-2">
              <button
                type="button"
                onClick={() => setShowAlbumModal(false)}
                className="px-4 py-2.5 border border-sandstone text-charcoal rounded-xl bg-cream hover:bg-sandstone/30 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createAlbumMutation.isPending}
                className="px-5 py-2.5 bg-primary text-white hover:opacity-90 rounded-xl transition-all font-bold shadow-md saffron-glow active:scale-95 flex items-center justify-center gap-1.5"
              >
                {createAlbumMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Album</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Media Dialog */}
      {showMediaModal && hasAdminAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleAddMedia}
            className="bg-white rounded-2xl p-6 w-[420px] border border-sandstone shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-charcoal uppercase tracking-tight flex items-center gap-1.5">
                <CloudUpload className="w-5 h-5 text-primary" /> Add Media File
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1.5 hover:bg-cream rounded-lg text-outline"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Media Image URL *</label>
              <input
                type="url"
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/photo-..."
                className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#554334] tracking-wider mb-1.5">Caption / Title</label>
              <input
                type="text"
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
                placeholder="e.g. Maha Aarti celebration evening"
                className="w-full bg-[#FAFAF8] border border-[#E8E2D6] rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-primary text-charcoal"
              />
            </div>

            <div className="flex justify-end gap-2.5 text-xs font-semibold mt-2">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2.5 border border-sandstone text-charcoal rounded-xl bg-cream hover:bg-sandstone/30 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addMediaMutation.isPending}
                className="px-5 py-2.5 bg-primary text-white hover:opacity-90 rounded-xl transition-all font-bold shadow-md saffron-glow active:scale-95 flex items-center justify-center gap-1.5"
              >
                {addMediaMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Add File</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
