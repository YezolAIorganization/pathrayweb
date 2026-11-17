
import { useState } from 'react';

export type Contact = {
  name: string;
  email: string;
  whatsapp: string;
  consent: boolean;
  marketing: boolean;
};

export const EMPTY_CONTACT: Contact = {
  name: '',
  email: '',
  whatsapp: '',
  consent: false,
  marketing: false,
};

type Errors = Partial<Record<'name' | 'email' | 'whatsapp' | 'consent', string>>;

function validate(c: Contact): Errors {
  const errors: Errors = {};

  if (c.name.trim().length < 2) errors.name = 'Enter your name.';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
    errors.email = 'Enter a valid email address, like name@example.com.';
  }

  const digits = c.whatsapp.replace(/\D/g, '');

  if (c.whatsapp.trim() && (digits.length < 7 || digits.length > 15)) {
    errors.whatsapp =
      'Enter your number with the country code, like +92 300 1234567, or leave it empty.';
  }

  if (!c.consent) {
    errors.consent = 'Tick this box so we can save your answers and send your result.';
  }

  return errors;
}

const inputClass =
  'mt-2 block min-h-11 w-full rounded-control border border-white/15 bg-white/5 px-4 text-base text-white placeholder:text-white/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-bright';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-sm font-medium text-white">
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-white text-[11px]"
      >
        !
      </span>
      {message}
    </p>
  );
}

type Props = {
  value: Contact;
  onChange: (next: Contact) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
};

export function ContactStep({
  value,
  onChange,
  onBack,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}: Props) {
  const [errors, setErrors] = useState<Errors>({});

  function set<K extends keyof Contact>(key: K, next: Contact[K]) {
    onChange({ ...value, [key]: next });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isSubmitting) return;

    const found = validate(value);
    setErrors(found);

    if (Object.keys(found).length === 0) {
      onSubmit();
      return;
    }

    const first = ['name', 'email', 'whatsapp', 'consent'].find(
      (k) => found[k as keyof Errors],
    );

    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mt-5">
        <label htmlFor="contact-name" className="font-medium text-white">
          Your name
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          value={value.name}
          onChange={(e) => set('name', e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={inputClass}
        />
        <FieldError id="contact-name-error" message={errors.name} />
      </div>

      <div className="mt-5">
        <label htmlFor="contact-email" className="font-medium text-white">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={value.email}
          onChange={(e) => set('email', e.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={inputClass}
        />
        <FieldError id="contact-email-error" message={errors.email} />
      </div>

      <div className="mt-5">
        <label htmlFor="contact-whatsapp" className="font-medium text-white">
          WhatsApp number <span className="font-normal text-white/70">(optional)</span>
        </label>
        <input
          id="contact-whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value.whatsapp}
          onChange={(e) => set('whatsapp', e.target.value)}
          aria-invalid={Boolean(errors.whatsapp)}
          aria-describedby={errors.whatsapp ? 'contact-whatsapp-error' : undefined}
          className={inputClass}
        />
        <FieldError id="contact-whatsapp-error" message={errors.whatsapp} />
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            id="contact-consent"
            type="checkbox"
            checked={value.consent}
            onChange={(e) => set('consent', e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'contact-consent-error' : undefined}
            className="mt-1 size-5 shrink-0 accent-white"
          />
          <span className="text-white/80">
            I agree that Pathray may save my answers and email me my Quick Check result. Only I
            and my assigned expert see them. We never sell or share your data. Delete it any time.
          </span>
        </label>
        <FieldError id="contact-consent-error" message={errors.consent} />
      </div>

      <div className="mt-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={value.marketing}
            onChange={(e) => set('marketing', e.target.checked)}
            className="mt-1 size-5 shrink-0 accent-white"
          />
          <span className="text-white/80">
            Also send me occasional study tips and updates (optional). You can unsubscribe at any
            time.
          </span>
        </label>
      </div>

      {submitError && (
        <p role="alert" className="mt-5 rounded-control border border-red-300/30 bg-red-400/10 p-3 text-sm text-white">
          {submitError}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex min-h-11 items-center justify-center rounded-control border border-white/25 px-5 font-medium text-white transition-transform duration-150 ease-pathray active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-control bg-white px-5 font-medium text-navy transition-transform duration-150 ease-pathray active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving your answers…' : 'See my result'}
        </button>
      </div>
    </form>
  );
}
