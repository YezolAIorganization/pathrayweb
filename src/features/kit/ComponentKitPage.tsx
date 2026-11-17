import React, { useState } from 'react';
import { useSurfaceMode, type SurfaceMode } from '../../lib/useSurfaceMode';
import { Card, Button, Badge, ChoiceChip, TextInput } from '../../components/ui/Primitives';

export const ComponentKitPage: React.FC = () => {
  const { mode, setMode } = useSurfaceMode();
  const [selectedChip, setSelectedChip] = useState<string>('Germany');

  const pageBg =
    mode === 'light' ? 'bg-navy-50 text-midnight' : 'bg-midnight text-white';

  return (
    <div className={`min-h-screen p-5 pb-20 font-inter transition-colors ${pageBg}`}>
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header & Mode Switcher */}
        <header className="space-y-3 border-b border-white/10 pb-5">
          <div className="flex items-center justify-between">
            <h1 className="font-sora text-2xl font-bold tracking-tight">
              Pathray UI Kit
            </h1>
            <Badge tone="cyan">Chunk K</Badge>
          </div>
          <p className="text-sm opacity-75">
            Design token verification across Dark, Light, and Lite (low-RAM) surfaces.
          </p>

          <div className="flex gap-2 pt-2">
            {(['dark', 'light', 'lite'] as SurfaceMode[]).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? 'primary' : 'secondary'}
                onClick={() => setMode(m)}
              >
                {m.toUpperCase()}
              </Button>
            ))}
          </div>
        </header>

        {/* Surface Cards */}
        <section className="space-y-3">
          <h2 className="font-sora text-sm uppercase tracking-wider opacity-70">
            1. Surface Cards ({mode})
          </h2>
          <Card surface={mode} elevated>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-sora font-semibold text-base">
                  DAAD EPOS Full Scholarship
                </h3>
                <p className="text-xs opacity-75 mt-1">
                  Covers tuition, €934/mo stipend, travel allowance, and insurance.
                </p>
              </div>
              <Badge tone="success">Fully Funded</Badge>
            </div>
          </Card>
        </section>

        {/* Buttons */}
        <section className="space-y-3">
          <h2 className="font-sora text-sm uppercase tracking-wider opacity-70">
            2. Actions & Touch Targets
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Start Quick Check</Button>
            <Button variant="secondary">View Sample Report</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </section>

        {/* Status Badges */}
        <section className="space-y-3">
          <h2 className="font-sora text-sm uppercase tracking-wider opacity-70">
            3. Funding & SLA Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge tone="cyan">48h Delivery</Badge>
            <Badge tone="success">Verified</Badge>
            <Badge tone="warning">Clock Paused</Badge>
            <Badge tone="error">Proof Rejected</Badge>
            <Badge tone="neutral">Draft</Badge>
          </div>
        </section>

        {/* Choice Chips */}
        <section className="space-y-3">
          <h2 className="font-sora text-sm uppercase tracking-wider opacity-70">
            4. Quick Check Choice Chips
          </h2>
          <div className="flex flex-wrap gap-2">
            {['Germany', 'South Korea', 'United Kingdom', 'Italy'].map((country) => (
              <ChoiceChip
                key={country}
                selected={selectedChip === country}
                onClick={() => setSelectedChip(country)}
              >
                {country}
              </ChoiceChip>
            ))}
          </div>
        </section>

        {/* Form Inputs */}
        <section className="space-y-3">
          <h2 className="font-sora text-sm uppercase tracking-wider opacity-70">
            5. Inputs & Validation
          </h2>
          <Card surface={mode} className="space-y-4">
            <TextInput
              label="Current CGPA / Percentage"
              placeholder="e.g., 3.45 / 4.00 or 82%"
            />
            <TextInput
              label="Transaction Reference ID"
              defaultValue="TXN-992"
              error="Reference ID must be at least 10 characters."
            />
          </Card>
        </section>
      </div>
    </div>
  );
};