import { useState } from 'react';
import { supabase } from '../../lib/supabase';

type Props = {
  journeyId: string;
  onSubmitted: () => void;
};

export function ProfileWizard({ journeyId, onSubmitted }: Props) {
  const [step, setStep] = useState(1);
  const [degreeLevel, setDegreeLevel] = useState('');
  const [field, setField] = useState('');
  const [gpa, setGpa] = useState('');
  const [englishStatus, setEnglishStatus] = useState('');
  const [budgetBand, setBudgetBand] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc('submit_profile', {
      p_journey_id: journeyId,
      p_details: {
        degree_level: degreeLevel,
        field_of_study: field,
        gpa,
        english_status: englishStatus,
        budget_band: budgetBand,
        notes,
      },
    });

    if (rpcError) {
      console.error('submit_profile failed:', rpcError);
      setError('We could not save your profile. Please try again.');
      setBusy(false);
      return;
    }

    setBusy(false);
    onSubmitted();
  }

  return (
    <div className="rounded-card border border-white/12 bg-[rgb(19_31_63/0.92)] p-5 sm:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Complete your profile</h2>
        <span className="text-sm text-white/70">Step {step} of 3</span>
      </div>

      <form onSubmit={step === 3 ? handleFinish : (e) => { e.preventDefault(); setStep(s => s + 1); }} className="mt-5">
        {step === 1 && (
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80">Degree level you want</label>
              <input
                type="text"
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value)}
                placeholder="e.g. Master's"
                className="mt-2 block min-h-11 w-full rounded-control border border-white/15 bg-white/5 px-4 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80">Field of study</label>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="e.g. Computer Science"
                className="mt-2 block min-h-11 w-full rounded-control border border-white/15 bg-white/5 px-4 text-white"
                required
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80">Academic score / GPA</label>
              <input
                type="text"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="e.g. 3.5 / 4.0 or First Class"
                className="mt-2 block min-h-11 w-full rounded-control border border-white/15 bg-white/5 px-4 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80">English test status</label>
              <input
                type="text"
                value={englishStatus}
                onChange={(e) => setEnglishStatus(e.target.value)}
                placeholder="e.g. Planned, Done, or Medium of Instruction"
                className="mt-2 block min-h-11 w-full rounded-control border border-white/15 bg-white/5 px-4 text-white"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80">Budget range</label>
              <input
                type="text"
                value={budgetBand}
                onChange={(e) => setBudgetBand(e.target.value)}
                placeholder="e.g. $10,000–$20,000 per year"
                className="mt-2 block min-h-11 w-full rounded-control border border-white/15 bg-white/5 px-4 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80">What else do you need help with?</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Mention any specific concerns, tight deadlines, or questions."
                className="mt-2 block w-full rounded-control border border-white/15 bg-white/5 p-4 text-white"
              />
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex min-h-11 items-center justify-center rounded-control border border-white/25 px-5 font-medium text-white"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-control bg-white px-5 font-medium text-navy disabled:opacity-50"
          >
            {busy ? 'Saving...' : step === 3 ? 'Submit profile' : 'Next step'}
          </button>
        </div>
      </form>
    </div>
  );
}