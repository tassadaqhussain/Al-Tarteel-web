'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminApi, AdminMotivationMessage, ApiError } from '@/lib/api';
import {
  EMPTY_MOTIVATION_FORM,
  formatAdminDate,
  MOTIVATION_CATEGORIES,
} from '@/lib/admin-utils';
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

export function MessagesManager() {
  const [items, setItems] = useState<AdminMotivationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_MOTIVATION_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminApi.listMotivationalMessages());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(EMPTY_MOTIVATION_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await adminApi.updateMotivationalMessage(editingId, form);
      } else {
        await adminApi.createMotivationalMessage(form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save message.');
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (item: AdminMotivationMessage) => {
    setEditingId(item.id);
    setForm({
      message: item.message,
      category: item.category,
      language: item.language,
      status: item.status,
      isActive: item.isActive,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id: number) => {
    if (!window.confirm('Delete this motivational message permanently?')) return;
    setDeletingId(id);
    try {
      await adminApi.deleteMotivationalMessage(id);
      if (editingId === id) resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete message.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (item: AdminMotivationMessage) => {
    try {
      await adminApi.updateMotivationalMessage(item.id, {
        ...item,
        isActive: !item.isActive,
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update message.');
    }
  };

  const activeCount = items.filter((i) => i.isActive && i.status === 'approved').length;

  return (
    <>
      <AdminPageHeader
        title="Motivation messages"
        description="Manage daily motivation messages shown to signed-in users alongside the built-in pool."
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            {!showForm && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New message
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="secondary">{items.length} total</Badge>
        <Badge variant="default">{activeCount} live</Badge>
      </div>

      {error ? <AdminErrorBanner message={error} /> : null}

      {showForm && (
        <AdminCard className="mb-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink dark:text-slate-100">
                {editingId ? `Edit message #${editingId}` : 'Create new message'}
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Cancel
              </Button>
            </div>

            <div>
              <label htmlFor="motivation-message" className="mb-1.5 block text-sm font-medium text-ink-3">
                Message
              </label>
              <textarea
                id="motivation-message"
                required
                minLength={8}
                rows={4}
                placeholder="Neutral educational encouragement — not Quran or Hadith text"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none ring-emerald-600 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="motivation-category" className="mb-1.5 block text-sm font-medium text-ink-3">
                  Category
                </label>
                <select
                  id="motivation-category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  {MOTIVATION_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="motivation-language" className="mb-1.5 block text-sm font-medium text-ink-3">
                  Language
                </label>
                <select
                  id="motivation-language"
                  value={form.language}
                  onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="en">English</option>
                  <option value="ur">Urdu</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
              <div>
                <label htmlFor="motivation-status" className="mb-1.5 block text-sm font-medium text-ink-3">
                  Status
                </label>
                <select
                  id="motivation-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as 'draft' | 'approved' }))
                  }
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="approved">Approved</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-line text-emerald-600 focus:ring-emerald-600"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? 'Save changes' : 'Create message'}
              </Button>
            </div>
          </form>
        </AdminCard>
      )}

      {loading && items.length === 0 ? (
        <AdminLoadingState label="Loading messages…" />
      ) : items.length === 0 ? (
        <AdminEmptyState
          title="No custom messages yet"
          description="Approved active messages are merged with the built-in motivation pool for signed-in users."
        />
      ) : (
        <AdminCard padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-slate-50/80 text-xs uppercase tracking-wide text-ink-3 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-5 py-3 font-semibold">Message</th>
                  <th className="px-5 py-3 font-semibold">Meta</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-slate-800">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'hover:bg-slate-50/50 dark:hover:bg-slate-800/30',
                      !item.isActive && 'opacity-60',
                    )}
                  >
                    <td className="max-w-md px-5 py-4">
                      <p className="line-clamp-3 leading-relaxed text-ink dark:text-slate-100">
                        {item.message}
                      </p>
                      <p className="mt-1 text-xs text-ink-3">Updated {formatAdminDate(item.updatedAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="outline" className="w-fit">
                          {item.category}
                        </Badge>
                        <span className="text-xs uppercase text-ink-3">{item.language}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant={item.status === 'approved' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-ink-3">{item.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => void toggleActive(item)}
                          title={item.isActive ? 'Deactivate' : 'Activate'}
                          className="h-8 w-8"
                        >
                          {item.isActive ? (
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-ink-3" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => void onDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="h-8 w-8 hover:text-red-600"
                          title="Delete"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </>
  );
}
