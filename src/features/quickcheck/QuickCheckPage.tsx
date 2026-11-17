import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { COUNTRY_STEP, buildSteps, type Field } from './questions';
import { getFundingTier, type BudgetBand, type ScholarshipNeed, type Tier } from './tier';
import type { MarketId } from '../../config/markets';
import { ContactStep, EMPTY_CONTACT, type Contact } from './ContactStep';
import { ResultStep } from './ResultStep';
import { submitQuickCheck } from './submitQuickCheck';

type Answers = Record<string, string | string[]>;
type Draft = { answers: Answers; index: number; contact: Contact };

const DRAFT_KEY = 'pathray:quickcheck-draft';

function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed.index === 'number' && parsed.answers) {
        return {
          answers: parsed.answers,
          index: parsed.index,
          contact: { ...EMPTY_CONTACT, ...(parsed.contact ?? {}) },
        };
      }
    }
  } catch {
    // Storage can be blocked. Start fresh.
  }

  return { answers: {}, index: 0, contact: EMPTY_CONTACT };
}

function saveDraft(draft: Draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore.
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore.
  }
}

function isAnswered(field: Field, answers: Answers) {
  const value = answers[field.name];

  return field.multi
    ? Array.isArray(value) && value.length > 0
    : typeof value === 'string' && value !== '';
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function QuickCheckPage() {
  const [initial] = useState(loadDraft);
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [index, setIndex] = useState(initial.index);
  const [contact, setContact] = useState<Contact>(initial.contact);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverTier, setServerTier] = useState<Tier | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);

  const marketId = (
    typeof answers.market === 'string' ? answers.market : 'pk'
  ) as MarketId;

  const steps = useMemo(
    () => [COUNTRY_STEP, ...buildSteps(marketId)],
    [marketId],
  );

  // index 0 = Q0 (country), 1 to 7 = Q1 to Q7, 8 = Q8 (contact), 9 = result
  const contactIndex = steps.length;
  const resultIndex = steps.length + 1;

  const step = index < steps.length ? steps[index] : null;
  const showContact = index === contactIndex;
  const showResult = index >= resultIndex;

  useEffect(() => {
    saveDraft({ answers, index, contact });
  }, [answers, index, contact]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  function choose(field: Field, optionId: string) {
    setAnswers((prev) => {
      const next: Answers = { ...prev };

      if (field.multi) {
        const current = Array.isArray(prev[field.name])
          ? (prev[field.name] as string[])
          : [];

        if (optionId === field.exclusiveOption) {
          next[field.name] = current.includes(optionId) ? [] : [optionId];
        } else {
          const without = current.filter((id) => id !== field.exclusiveOption);

          if (without.includes(optionId)) {
            next[field.name] = without.filter((id) => id !== optionId);
          } else if (field.max && without.length >= field.max) {
            next[field.name] = without;
          } else {
            next[field.name] = [...without, optionId];
          }
        }
      } else {
        if (field.name === 'market' && prev.market !== optionId) {
          delete next.budgetBand;
        }

        next[field.name] = optionId;
      }

      return next;
    });
  }

  function restart() {
    clearDraft();
    setAnswers({});
    setContact(EMPTY_CONTACT);
    setSubmitError(null);
    setIsSubmitting(false);
    setServerTier(null);
    setIndex(0);
  }

  async function handleContactSubmit() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitQuickCheck(answers, localTier, contact);
      setServerTier(result.tier);
      setIndex(resultIndex);
    } catch (error) {
      console.error('Quick Check submission failed:', error);
      setSubmitError(
        'We could not save your answers. Please check your connection and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const canContinue = step
    ? step.fields.every((field) => isAnswered(field, answers))
    : false;

  const need = answers.scholarshipNeed as ScholarshipNeed | undefined;
  const band = Number(answers.budgetBand) as BudgetBand;

  // Only a fallback. The tier shown on the result screen is the one the server saved.
  const localTier =
    need && [0, 1, 2, 3].includes(band)
      ? getFundingTier(need, band)
      : null;

  const destinations = Array.isArray(answers.destinations)
    ? answers.destinations
    : [];

  return (
    <div
      className="relative isolate min-h-svh bg-midnight text-white"
      style={{
        backgroundImage:
          'radial-gradient(60rem 40rem at 85% -10%, rgb(43 74 140 / 0.35), transparent 60%), radial-gradient(50rem 36rem at 0% 40%, rgb(27 47 94 / 0.45), transparent 60%)',
      }}
    >
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-[84px] w-full max-w-[1200px] items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Pathray home" className="inline-flex">
            <img
              src="/brand/pathray-logo-dark.svg"
              alt="Pathray"
              width={128}
              height={45}
            />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[640px] px-4 py-10 sm:py-16">
        <div className="rounded-card border border-white/12 bg-white/6 p-5 shadow-[0_10px_40px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.18)] backdrop-blur-[18px] backdrop-saturate-[1.4] motion-reduce:bg-[rgb(19_31_63/0.92)] motion-reduce:backdrop-blur-none sm:p-8">
          {!showResult && (
            <>
              <p className="text-sm text-white/70">
                {index === 0
                  ? 'Free Quick Check'
                  : `Free Quick Check · Question ${index} of 8`}
              </p>

              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={8}
                aria-valuenow={Math.min(index, 8)}
                aria-label="Quick Check progress"
                className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/15"
              >
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-300 ease-pathray"
                  style={{
                    width: `${(Math.min(index, 8) / 8) * 100}%`,
                  }}
                />
              </div>
            </>
          )}

          {step && (
            <>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="mt-6 text-h2 outline-none"
              >
                {step.title}
              </h1>

              {step.fields.map((field) => {
                const value = answers[field.name];

                return (
                  <fieldset key={field.name} className="mt-5 border-0 p-0">
                    <legend
                      className={
                        step.fields.length > 1
                          ? 'mb-3 font-medium text-white'
                          : 'sr-only'
                      }
                    >
                      {field.label}
                    </legend>

                    <div className="grid grid-cols-1 gap-3">
                      {field.options.map((option) => {
                        const selected = field.multi
                          ? Array.isArray(value) && value.includes(option.id)
                          : value === option.id;

                        return (
                          <label
                            key={option.id}
                            className="relative block cursor-pointer"
                          >
                            <input
                              type={field.multi ? 'checkbox' : 'radio'}
                              name={field.name}
                              value={option.id}
                              checked={selected}
                              onChange={() => choose(field, option.id)}
                              className="peer sr-only"
                            />

                            <span className="flex min-h-11 items-center justify-between gap-2 rounded-control border border-white/15 bg-white/5 px-4 py-3 text-white transition-colors duration-150 peer-checked:border-white peer-checked:bg-white/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-bright">
                              {option.label}
                              {selected && <CheckIcon />}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}

              <div className="mt-6 flex gap-3">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => setIndex(index - 1)}
                    className="inline-flex min-h-11 items-center justify-center rounded-control border border-white/25 px-5 font-medium text-white transition-transform duration-150 ease-pathray active:scale-[0.97]"
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setIndex(index + 1)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-control bg-white px-5 font-medium text-navy transition-transform duration-150 ease-pathray enabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {showContact && (
            <>
              <h1
                ref={headingRef}
                tabIndex={-1}
                className="mt-6 text-h2 outline-none"
              >
                Where should we send your result?
              </h1>

              <ContactStep
                value={contact}
                onChange={setContact}
                onBack={() => setIndex(steps.length - 1)}
                onSubmit={handleContactSubmit}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            </>
          )}

          {showResult && (
            <ResultStep
              tier={serverTier ?? localTier}
              name={contact.name}
              email={contact.email}
              destinations={destinations}
              onBack={() => setIndex(contactIndex)}
              onRestart={restart}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default QuickCheckPage;