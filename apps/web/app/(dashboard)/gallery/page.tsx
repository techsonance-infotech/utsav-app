"use client";

import React, { useState } from "react";
import {
  useFetchAlbums,
  useCreateAlbum,
  useFetchAlbumMedia,
  useAddAlbumMedia,
} from "@utsav/api-client";
import { GalleryGrid } from "@utsav/ui";

export default function GalleryDashboardPage() {
  const { data: albums, isLoading: loadingAlbums } = useFetchAlbums();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | undefined>();

  const { data: media, isLoading: loadingMedia } = useFetchAlbumMedia(selectedAlbumId);
  const createAlbumMutation = useCreateAlbum();
  const addMediaMutation = useAddAlbumMedia();

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mandal Media Gallery</h1>
          <p className="text-xs text-gray-400 mt-1">Organize album events, upload photos & videos to share on the public portal.</p>
        </div>

        <div className="flex gap-2">
          {selectedAlbumId && (
            <button
              onClick={() => setShowMediaModal(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              ＋ Add Photo/Video
            </button>
          )}
          <button
            onClick={() => setShowAlbumModal(true)}
            className="px-4 py-2.5 border border-gray-200 hover:border-orange-500 hover:text-orange-600 text-gray-600 rounded-xl text-xs font-bold transition-all bg-white"
          >
            New Album
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 items-start">
        {/* Sidebar Albums List */}
        <div className="col-span-1 bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-2">
          <span className="text-xxs font-black text-gray-400 uppercase tracking-widest px-2 mb-2 block">Albums ({albums?.length || 0})</span>
          {loadingAlbums ? (
            <p className="text-xxs text-gray-400 px-2">Loading albums...</p>
          ) : albums && albums.length > 0 ? (
            albums.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAlbumId(a.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold truncate transition-colors ${
                  a.id === selectedAlbumId
                    ? "bg-orange-50 text-orange-700"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                📁 {a.name}
              </button>
            ))
          ) : (
            <p className="text-xxs text-gray-400 px-2">No albums created.</p>
          )}
        </div>

        {/* Media grid feed */}
        <div className="col-span-3 bg-white border border-gray-100 rounded-2xl p-6 min-h-[400px]">
          {selectedAlbumId ? (
            <div className="flex flex-col gap-6">
              <div className="border-b border-gray-50 pb-4">
                <h3 className="font-bold text-gray-900 text-lg">{selectedAlbum?.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{selectedAlbum?.description || "No description provided."}</p>
              </div>

              {loadingMedia ? (
                <p className="text-xs text-gray-400">Loading media files...</p>
              ) : media && media.length > 0 ? (
                <GalleryGrid items={media} />
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs">
                  This album has no media files. Click "Add Photo/Video" above to upload media.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24 text-gray-400">
              <span className="text-4xl mb-3">📸</span>
              <h4 className="text-sm font-bold text-gray-900">No Album Selected</h4>
              <p className="text-xs mt-1 max-w-xs">
                Select an album from the list on the left to browse its photo/video archives, or create a new album.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Album Creation Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-xs">
          <form
            onSubmit={handleCreateAlbum}
            className="bg-white rounded-2xl p-6 w-96 border border-gray-100 shadow-xl flex flex-col gap-4"
          >
            <h3 className="text-base font-bold text-gray-900">Create Gallery Album</h3>
            <div>
              <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Album Title</label>
              <input
                type="text"
                required
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="e.g. Ganesh Chaturthi 2026"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Description</label>
              <textarea
                value={newAlbumDesc}
                onChange={(e) => setNewAlbumDesc(e.target.value)}
                placeholder="Write album notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShowAlbumModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-xs">
          <form
            onSubmit={handleAddMedia}
            className="bg-white rounded-2xl p-6 w-96 border border-gray-100 shadow-xl flex flex-col gap-4"
          >
            <h3 className="text-base font-bold text-gray-900">Add Media File</h3>
            <div>
              <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Media URL</label>
              <input
                type="text"
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xxs font-semibold text-gray-400 uppercase mb-1">Caption</label>
              <input
                type="text"
                value={mediaCaption}
                onChange={(e) => setMediaCaption(e.target.value)}
                placeholder="e.g. Maha Aarti celebration"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
              >
                Add File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
