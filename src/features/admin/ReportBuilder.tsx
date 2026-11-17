import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type ReportSection = {
  id: string;
  title: string;
  university_or_program: string;
  funding_type: string;
  deadline: string;
  source_url: string;
  fact_verified: boolean;
  notes: string;
};

type ReportBuilderProps = {
  journeyId: string;
  onPublished: () => Promise<void>;
};

export function ReportBuilder({ journeyId, onPublished }: ReportBuilderProps) {
  const [summary, setSummary] = useState('');
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReport() {
      setLoading(true);
      setMessage(null);
      const { data, error } = await supabase
        .from('reports')
        .select('summary, content, is_published')
        .eq('journey_id', journeyId)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error('Failed to load report:', error);
      } else if (data) {
        setSummary(data.summary ?? '');
        setSections(Array.isArray(data.content) ? (data.content as ReportSection[]) : []);
        setIsPublished(Boolean(data.is_published));
      } else {
        setSummary('');
        setSections([]);
        setIsPublished(false);
      }
      setLoading(false);
    }

    void loadReport();
    return () => {
      active = false;
    };
  }, [journeyId]);

  function addSection() {
    setSections((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: '',
        university_or_program: '',
        funding_type: 'Full Funding / Scholarship',
        deadline: '',
        source_url: '',
        fact_verified: false,
        notes: '',
      },
    ]);
  }

  function updateSection(id: string, patch: Partial<ReportSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleSaveDraft() {
    if (saving) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from('reports').upsert(
      {
        journey_id: journeyId,
        summary,
        content: sections,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'journey_id' },
    );

    if (error) {
      console.error('Failed to save report draft:', error);
      setMessage('Error saving report draft.');
    } else {
      setMessage('Draft saved.');
    }
    setSaving(false);
  }

  async function handlePublish() {
    if (saving) return;
    const unverifiedCount = sections.filter((s) => !s.fact_verified || !s.source_url.trim()).length;
    if (sections.length === 0) {
      alert('Add at least one verified funding pathway before publishing.');
      return;
    }
    if (unverifiedCount > 0) {
      alert(
        `All pathways must have a valid source URL and Fact Verified checked before publishing (${unverifiedCount} remaining).`,
      );
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error: upsertError } = await supabase.from('reports').upsert(
      {
        journey_id: journeyId,
        summary,
        content: sections,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'journey_id' },
    );

    if (upsertError) {
      console.error('Failed to save before publishing:', upsertError);
      setMessage('Failed to save report before publishing.');
      setSaving(false);
      return;
    }

    const { error: publishError } = await supabase.rpc('publish_report', {
      p_journey_id: journeyId,
    });

    if (publishError) {
      console.error('Failed to publish report:', publishError);
      setMessage('Failed to publish report.');
    } else {
      setIsPublished(true);
      setMessage('Report published and delivered to student.');
      await onPublished();
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="mt-4 text-sm text-white/70">Loading report editor...</p>;
  }

  const allVerified =
    sections.length > 0 && sections.every((s) => s.fact_verified && s.source_url.trim().length > 0);

  return (
    <div className="mt-6 border-t border-white/12 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-medium">
          Report Builder &amp; Fact Verification{' '}
          {isPublished && (
            <span className="ml-2 rounded-full bg-green-600/30 px-2.5 py-0.5 text-xs text-green-300">
              Published
            </span>
          )}
        </h3>
        <button
          type="button"
          onClick={addSection}
          className="rounded-control border border-cyan/50 bg-cyan/15 px-3 py-1.5 text-xs font-medium text-cyan hover:bg-cyan/25"
        >
          + Add Funding Pathway
        </button>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-white/90">
          Executive Assessment Summary
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summarize the student's eligibility, funding strategy, and recommended next steps..."
            className="mt-1.5 w-full rounded-control border border-white/15 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 focus:border-cyan focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className="rounded-control border border-white/15 bg-white/5 p-4 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-cyan">Pathway #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-white/70">Scholarship / Pathway Title</span>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  placeholder="e.g., DAAD EPOS Scholarship"
                  className="mt-1 w-full rounded-control border border-white/15 bg-midnight px-3 py-2 text-sm text-white focus:border-cyan focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs text-white/70">University / Institution &amp; Country</span>
                <input
                  type="text"
                  value={section.university_or_program}
                  onChange={(e) =>
                    updateSection(section.id, { university_or_program: e.target.value })
                  }
                  placeholder="e.g., TU Munich, Germany"
                  className="mt-1 w-full rounded-control border border-white/15 bg-midnight px-3 py-2 text-sm text-white focus:border-cyan focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs text-white/70">Funding Coverage</span>
                <input
                  type="text"
                  value={section.funding_type}
                  onChange={(e) => updateSection(section.id, { funding_type: e.target.value })}
                  placeholder="e.g., 100% Tuition + €934/mo Stipend"
                  className="mt-1 w-full rounded-control border border-white/15 bg-midnight px-3 py-2 text-sm text-white focus:border-cyan focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="text-xs text-white/70">Application Deadline</span>
                <input
                  type="text"
                  value={section.deadline}
                  onChange={(e) => updateSection(section.id, { deadline: e.target.value })}
                  placeholder="e.g., October 15, 2026"
                  className="mt-1 w-full rounded-control border border-white/15 bg-midnight px-3 py-2 text-sm text-white focus:border-cyan focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-3">
              <label className="block">
                <span className="text-xs text-white/70">Official Source URL (Required for Verification)</span>
                <input
                  type="url"
                  value={section.source_url}
                  onChange={(e) => updateSection(section.id, { source_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-control border border-white/15 bg-midnight px-3 py-2 text-sm text-white focus:border-cyan focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-3">
              <label className="block">
                <span className="text-xs text-white/70">Actionable Roadmap &amp; Eligibility Notes</span>
                <textarea
                  rows={2}
                  value={section.notes}
                  onChange={(e) => updateSection(section.id, { notes: e.target.value })}
                  placeholder="Required documents, GPA/IELTS thresholds, and submission steps..."
                  className="mt-1 w-full rounded-control border border-white/15 bg-midnight p-2.5 text-sm text-white focus:border-cyan focus:outline-none"
                />
              </label>
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-medium text-white">
              <input
                type="checkbox"
                checked={section.fact_verified}
                onChange={(e) => updateSection(section.id, { fact_verified: e.target.checked })}
                className="h-4 w-4 accent-cyan"
              />
              <span>Fact-verified against official university/funder source URL</span>
            </label>
          </div>
        ))}
      </div>

      {message && <p className="mt-3 text-sm text-cyan">{message}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveDraft}
          className="rounded-control border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          type="button"
          disabled={saving || !allVerified}
          onClick={handlePublish}
          className="rounded-control bg-cyan px-4 py-2 text-sm font-medium text-midnight hover:bg-bright-cyan disabled:opacity-40"
        >
          {isPublished ? 'Re-Publish & Update Report' : 'Publish & Deliver Report'}
        </button>
      </div>
    </div>
  );
}