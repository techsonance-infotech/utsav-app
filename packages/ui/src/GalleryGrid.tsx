import React, { useState } from "react";

export interface GalleryItem {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  caption?: string | null;
}

export interface GalleryGridProps {
  items: GalleryItem[];
  onItemClick?: (item: GalleryItem) => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items, onItemClick }) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const handleItemClick = (item: GalleryItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      setSelectedItem(item);
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-gray-100 aspect-square shadow-xs transition-transform hover:-translate-y-1 hover:shadow-md"
          >
            {item.media_type === "image" ? (
              <img
                src={item.media_url}
                alt={item.caption || "Gallery item"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white relative">
                <span className="text-2xl">▶️</span>
                <span className="absolute bottom-2 left-2 text-xxs bg-black/60 px-1.5 py-0.5 rounded text-white font-semibold">
                  VIDEO
                </span>
              </div>
            )}

            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-xxs text-white font-medium truncate">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 text-white text-3xl font-light hover:text-orange-500"
          >
            &times;
          </button>
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {selectedItem.media_type === "image" ? (
              <img
                src={selectedItem.media_url}
                alt={selectedItem.caption || ""}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <video
                src={selectedItem.media_url}
                controls
                className="max-w-full max-h-[75vh] rounded-lg shadow-2xl"
                autoPlay
              />
            )}
            {selectedItem.caption && (
              <p className="text-sm text-gray-300 font-medium px-4 text-center">{selectedItem.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
