'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Star, Trash2 } from 'lucide-react';
import { adminApi, AdminFeedback, ApiError } from '@/lib/api';
import { FEEDBACK_CATEGORIES, formatAdminDate } from '@/lib/admin-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AdminCard,
  AdminEmptyState,
  AdminErrorBanner,
  AdminLoadingState,
  AdminPageHeader,
} from './AdminShell';
import { cn } from '@/lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  bug: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  idea: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  hifz: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
  translation: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function FeedbackManager() {
  const [items, setItems] = useState<AdminFeedback[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listFeedback({
        page,
        limit: 15,
        category: category || undefined,
      });
      setItems(res.items);
      setPages(res.pages);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  }, [page, category]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = async (id: number) => {
    if (!window.confirm('Delete this feedback submission permanently?')) return;
    setDeletingId(id);
    try {
      await adminApi.deleteFeedback(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete feedback.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Feedback"
        description="Review and manage public feedback submissions from the site."
        action={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="feedback-category" className="text-sm font-medium text-ink-3">
            Category
          </label>
          <select
            id="feedback-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none ring-emerald-600 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All categories</option>
            {FEEDBACK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Badge variant="secondary">{total} submissions</Badge>
      </div>

      {error ? <AdminErrorBanner message={error} /> : null}

      {loading && items.length === 0 ? (
        <AdminLoadingState label="Loading feedback…" />
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="No feedback yet"
          description="Submissions from the public feedback form will appear here."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <AdminCard key={item.id} className="group">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
                        CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other,
                      )}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs text-ink-3">{formatAdminDate(item.createdAt)}</span>
                    {item.rating != null && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {item.rating}/5
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink dark:text-slate-100">
                    {item.name || 'Anonymous'}
                    {item.email ? (
                      <span className="font-normal text-ink-3"> · {item.email}</span>
                    ) : null}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">
                    {item.message}
                  </p>
                  {item.pageUrl && (
                    <p className="mt-3 truncate text-xs text-ink-3">
                      Source:{' '}
                      <a
                        href={item.pageUrl}
                        className="font-medium text-[var(--accent)] hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.pageUrl}
                      </a>
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void onDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="shrink-0 text-ink-3 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  {deletingId === item.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-3">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
