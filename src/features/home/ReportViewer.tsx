import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type VerifiedPathway = {
  id: string;
  title: string;
  university_or_program: string;
  funding_type: string;
  deadline: string;
  source_url: string;
  fact_verified: boolean;
  notes: string;
};

type PublishedReport = {
  id: string;
  summary: string | null;
  content: VerifiedPathway[];
  updated_at: string;
};

type ReportViewerProps = {
  journeyId: string;
};

export function ReportViewer({ journeyId }: ReportViewerProps) {
  const [report, setReport] = useState<PublishedReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchReport() {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('id, summary, content, updated_at')
        .eq('journey_id', journeyId)
        .eq('is_published', true)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error('Failed to load published report:', error);
      } else if (data) {
        setReport({
          id: data.id,
          summary: data.summary,
          content: Array.isArray(data.content) ? (data.content as VerifiedPathway[]) : [],
          updated_at: data.updated_at,
        });
      }
      setLoading(false);
    }

    void fetchReport();
    return () => {
      active = false;
    };
  }, [journeyId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5">
        <p className="text-sm text-white/70">Loading your funding assessment report...</p>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <section className="mt-6 rounded-card border border-cyan/35 bg-[rgb(19_31_63/0.92)] p-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/12 pb-4">
        <div>
          <span className="inline-block rounded-full bg-cyan/15 px-3 py-1 text-xs font-medium text-cyan">
            Verified Funding Assessment
          </span>
          <h2 className="mt-2 font-heading text-2xl text-white">Your Personalized Roadmap</h2>
        </div>
        <div className="text-xs text-white/60">
          Delivered: {new Date(report.updated_at).toLocaleDateString()}
        </div>
      </div>

      {report.summary && (
        <div className="mt-4 rounded-control border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-medium text-cyan">Executive Summary</h3>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-white/90">
            {report.summary}
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <h3 className="text-lg font-medium text-white">
          Recommended Funding Pathways ({report.content.length})
        </h3>

        {report.content.map((item, idx) => (
          <article
            key={item.id}
            className="rounded-control border border-white/15 bg-white/5 p-5 transition-colors hover:border-cyan/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-xs font-medium text-cyan">Pathway #{idx + 1}</div>
                <h4 className="mt-0.5 text-lg font-medium text-white">{item.title}</h4>
                <p className="text-sm text-white/75">{item.university_or_program}</p>
              </div>
              {item.fact_verified && (
                <span className="rounded-full border border-green-500/30 bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-300">
                  Fact Verified
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-2 border-y border-white/10 py-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-white/60">Coverage: </span>
                <span className="font-medium text-white">{item.funding_type}</span>
              </div>
              <div>
                <span className="text-white/60">Deadline: </span>
                <span className="font-medium text-white">{item.deadline || 'Rolling / See Link'}</span>
              </div>
            </div>

            {item.notes && (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/85">
                {item.notes}
              </p>
            )}

            {item.source_url && (
              <div className="mt-4">
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center rounded-control bg-cyan px-4 text-sm font-medium text-midnight no-underline transition-colors hover:bg-bright-cyan"
                >
                  Open Official Application Source &rarr;
                </a>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}