'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditorForm } from '@/components/admin/BlogEditorForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import type { BlogPost } from '@/types';
import { adminFetchBlogPost } from '@/utils/api';
import { useStore } from '@/contexts/StoreContext';
import { Loader2Icon } from 'lucide-react';

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const router = useRouter();
  const { pushToast } = useStore();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchBlogPost(postId)
      .then((data) => setPost(data))
      .catch(() => {
        pushToast({ title: 'Failed to load article.', tone: 'error' });
        router.push('/admin/blogs');
      })
      .finally(() => setLoading(false));
  }, [postId, router, pushToast]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-[#D99B26]" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Edit Article: ${post.title}`}
        body="Update content, optimize SEO snippet, or change publication status."
      />
      <BlogEditorForm initialPost={post} isEdit={true} />
    </div>
  );
}
