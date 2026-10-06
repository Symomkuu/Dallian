'use client';

import React from 'react';
import { BlogEditorForm } from '@/components/admin/BlogEditorForm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Write New Article"
        body="Draft compelling stories, tutorials, and trend updates. Add rich headings, images, and keywords to rank on Google and engage visitors."
      />
      <BlogEditorForm isEdit={false} />
    </div>
  );
}
