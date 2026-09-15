"use client";

import CommentSection from "@/components/CommentSection";

export default function BlogPostComments({ documentId }: { documentId: string }) {
  return <CommentSection documentId={documentId} />;
}
