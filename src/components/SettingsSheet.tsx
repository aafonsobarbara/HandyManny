import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuoteStore } from '../store/QuoteStoreProvider';

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({ open, onClose }) => {
  const settings = useQuoteStore((state) => state.settings);
  const updateSettings = useQuoteStore((state) => state.updateSettings);
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings, open]);

  if (!open) return null;

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === 'defaultRate' || field === 'defaultGasRate' ? Number(value) || 0 : value
    }));
  };

  const handleSave = () => {
    updateSettings(() => ({ ...form }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40">
      <div className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="space-y-6 px-6 py-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Company Profile</h3>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Company Name
              <input
                value={form.companyName}
                onChange={(event) => handleChange('companyName', event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Company Phone
              <input
                value={form.companyPhone}
                onChange={(event) => handleChange('companyPhone', event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Company Email
              <input
                value={form.companyEmail}
                onChange={(event) => handleChange('companyEmail', event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
          </section>
          <section className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Default Labor Rate ($/h)
              <input
                type="number"
                min={0}
                value={form.defaultRate}
                onChange={(event) => handleChange('defaultRate', event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Default Gas Rate ($/mi)
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.defaultGasRate}
                onChange={(event) => handleChange('defaultGasRate', event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Default Terms &amp; Conditions</h3>
            <textarea
              value={form.defaultTerms}
              onChange={(event) => handleChange('defaultTerms', event.target.value)}
              className="h-40 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </section>
        </div>
        <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
          >
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsSheet;
