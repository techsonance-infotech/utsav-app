import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { NewsArticle, BlogPost } from "@utsav/types";

export function useNewsArticles(includeDrafts: boolean = false) {
  return useQuery({
    queryKey: ["news", includeDrafts],
    queryFn: async () => {
      return apiClient<NewsArticle[]>("/news", {
        params: { includeDrafts: String(includeDrafts) },
      });
    },
  });
}

export function useBlogPosts(includeDrafts: boolean = false) {
  return useQuery({
    queryKey: ["blog-posts", includeDrafts],
    queryFn: async () => {
      return apiClient<BlogPost[]>("/blog", {
        params: { includeDrafts: String(includeDrafts) },
      });
    },
  });
}

export function useCreateNewsArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<NewsArticle>) => {
      return apiClient<NewsArticle>("/news", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<BlogPost>) => {
      return apiClient<BlogPost>("/blog", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

export function useIncrementNewsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: string) => {
      return apiClient<NewsArticle>(`/news/${articleId}/read`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useUpdateNewsArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ articleId, data }: { articleId: string; data: Partial<NewsArticle> }) => {
      return apiClient<NewsArticle>(`/news/${articleId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useDeleteNewsArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleId: string) => {
      return apiClient<{ message: string }>(`/news/${articleId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: Partial<BlogPost> }) => {
      return apiClient<BlogPost>(`/blog/${postId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return apiClient<{ message: string }>(`/blog/${postId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
  });
}


