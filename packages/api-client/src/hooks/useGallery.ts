import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import { useAuthStore } from "@utsav/stores";

export interface GalleryAlbum {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  cover_image_url?: string | null;
  media_count: number;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryMedia {
  id: string;
  tenant_id: string;
  album_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  size_bytes?: number | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export function useFetchAlbums() {
  const { tenantId } = useAuthStore();
  return useQuery({
    queryKey: ["gallery-albums", tenantId],
    queryFn: () => apiClient<GalleryAlbum[]>("/gallery/albums"),
    enabled: !!tenantId,
  });
}

export function useCreateAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; is_public?: boolean; cover_image_url?: string }) =>
      apiClient<GalleryAlbum>("/gallery/albums", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery-albums"] });
    },
  });
}

export function useFetchAlbumMedia(albumId?: string) {
  return useQuery({
    queryKey: ["gallery-media", albumId],
    queryFn: () => apiClient<GalleryMedia[]>(`/gallery/albums/${albumId}/media`),
    enabled: !!albumId,
  });
}

export function useAddAlbumMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      albumId,
      ...data
    }: {
      albumId: string;
      media_url: string;
      media_type?: string;
      caption?: string;
      width?: number;
      height?: number;
      size_bytes?: number;
    }) =>
      apiClient<GalleryMedia>(`/gallery/albums/${albumId}/media`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["gallery-media", data.album_id] });
      qc.invalidateQueries({ queryKey: ["gallery-albums"] });
    },
  });
}
