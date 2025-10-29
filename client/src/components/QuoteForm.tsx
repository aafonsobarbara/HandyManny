import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useQuoteStore from '../store/quoteStore';
import { saveQuote, requestDistance } from '../services/quotes';
import { formatCurrency } from '../utils/calculations';

const quoteSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  clientAddress: z.string().min(5, 'Client address is required'),
  clientPhone: z.string().min(7, 'Phone is required'),
  clientEmail: z.string().email('Provide a valid email').optional(),
  margin: z.number().min(0).max(100),
  helperEnabled: z.boolean(),
  helpers: z.number().min(0),
  helperDays: z.number().min(0),
  helperRate: z.number().min(0),
  startAddressType: z.enum(['default', 'custom']),
  customAddress: z.string().optional()
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const QuoteForm: React.FC = () => {
  const {
    activeQuote,
    createDraft,
    updateActiveQuote,
    updateHelperConfig,
    updateTravelConfig,
    updateMargin,
    computeSummary,
    setQuotes
  } = useQuoteStore();

  useEffect(() => {
    if (!activeQuote) {
      createDraft();
    }
  }, [activeQuote, createDraft]);

  const summary = computeSummary();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientName: activeQuote?.clientName || '',
      clientAddress: activeQuote?.clientAddress || '',
      clientPhone: activeQuote?.clientPhone || '',
      clientEmail: activeQuote?.clientEmail,
      margin: activeQuote?.margin || 20,
      helperEnabled: activeQuote?.helperConfig.enabled || false,
      helpers: activeQuote?.helperConfig.helpers || 0,
      helperDays: activeQuote?.helperConfig.days || 0,
      helperRate: activeQuote?.helperConfig.dailyRate || 0,
      startAddressType: activeQuote?.travelConfig.startAddressType || 'default',
      customAddress: activeQuote?.travelConfig.customAddress || ''
    }
  });

  useEffect(() => {
    if (activeQuote) {
      reset({
        clientName: activeQuote.clientName,
        clientAddress: activeQuote.clientAddress,
        clientPhone: activeQuote.clientPhone,
        clientEmail: activeQuote.clientEmail,
        margin: activeQuote.margin,
        helperEnabled: activeQuote.helperConfig.enabled,
        helpers: activeQuote.helperConfig.helpers,
        helperDays: activeQuote.helperConfig.days,
        helperRate: activeQuote.helperConfig.dailyRate,
        startAddressType: activeQuote.travelConfig.startAddressType,
        customAddress: activeQuote.travelConfig.customAddress
      });
    }
  }, [activeQuote, reset]);

  const helperEnabled = watch('helperEnabled');
  const startAddressType = watch('startAddressType');

  const onSubmit = async (values: QuoteFormValues) => {
    if (!activeQuote) return;
    updateActiveQuote({
      clientName: values.clientName,
      clientAddress: values.clientAddress,
      clientPhone: values.clientPhone,
      clientEmail: values.clientEmail
    });
    updateMargin(values.margin);
    updateHelperConfig({
      enabled: values.helperEnabled,
      helpers: values.helpers,
      days: values.helperDays,
      dailyRate: values.helperRate
    });
    updateTravelConfig({
      startAddressType: values.startAddressType,
      customAddress: values.customAddress || ''
    });

    const saved = await saveQuote({
      ...activeQuote,
      clientName: values.clientName,
      clientAddress: values.clientAddress,
      clientPhone: values.clientPhone,
      clientEmail: values.clientEmail,
      margin: values.margin,
      helperConfig: {
        enabled: values.helperEnabled,
        helpers: values.helpers,
        days: values.helperDays,
        dailyRate: values.helperRate
      },
      travelConfig: {
        ...activeQuote.travelConfig,
        startAddressType: values.startAddressType,
        customAddress: values.customAddress || ''
      }
    });
    setQuotes((prev) => {
      const others = prev.filter((quote) => quote.id !== saved.id);
      return saved.id ? [...others, saved] : prev;
    });
    updateActiveQuote(saved);
  };

  const handleDistanceLookup = async () => {
    if (!activeQuote) return;
    const defaultShop = import.meta.env.VITE_DEFAULT_SHOP_ADDRESS || '123 Main St, Springfield, USA';
    const origin = activeQuote.travelConfig.startAddressType === 'custom'
      ? activeQuote.travelConfig.customAddress
      : defaultShop;
    try {
      const miles = await requestDistance(origin, activeQuote.clientAddress);
      updateTravelConfig({ miles });
    } catch (error) {
      console.error('Distance lookup failed', error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="col-span-1">
          <label className="text-sm font-medium text-slate-600">Client Name*</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
            {...register('clientName')}
          />
          {errors.clientName && <p className="text-xs text-red-500">{errors.clientName.message}</p>}
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium text-slate-600">Client Phone*</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
            {...register('clientPhone')}
          />
          {errors.clientPhone && <p className="text-xs text-red-500">{errors.clientPhone.message}</p>}
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-slate-600">Client Address*</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
            {...register('clientAddress')}
          />
          {errors.clientAddress && <p className="text-xs text-red-500">{errors.clientAddress.message}</p>}
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium text-slate-600">Client Email</label>
          <input
            className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
            {...register('clientEmail')}
          />
          {errors.clientEmail && <p className="text-xs text-red-500">{errors.clientEmail.message}</p>}
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium text-slate-600">Margin %</label>
          <input
            type="number"
            className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
            {...register('margin', { valueAsNumber: true })}
          />
          {errors.margin && <p className="text-xs text-red-500">{errors.margin.message}</p>}
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium text-slate-600">Helpers</label>
          <div className="mt-1 flex items-center gap-2">
            <input type="checkbox" {...register('helperEnabled')} />
            <span className="text-sm text-slate-600">With Helpers</span>
          </div>
          {helperEnabled && (
            <div className="mt-2 space-y-2 text-sm text-slate-600">
              <label className="block">
                # Helpers
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
                  {...register('helpers', { valueAsNumber: true })}
                />
              </label>
              <label className="block">
                # Days
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
                  {...register('helperDays', { valueAsNumber: true })}
                />
              </label>
              <label className="block">
                Daily Rate ($)
                <input
                  type="number"
                  className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
                  {...register('helperRate', { valueAsNumber: true })}
                />
              </label>
            </div>
          )}
        </div>
        <div className="col-span-1">
          <label className="text-sm font-medium text-slate-600">Starting Address</label>
          <select
            className="mt-1 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
            {...register('startAddressType')}
          >
            <option value="default">Default Shop</option>
            <option value="custom">Custom</option>
          </select>
          {startAddressType === 'custom' && (
            <input
              className="mt-2 w-full rounded border border-slate-300 p-2 focus:border-primary focus:outline-none"
              placeholder="123 Custom St, City, ST"
              {...register('customAddress')}
            />
          )}
          <button
            type="button"
            className="mt-3 inline-flex items-center rounded bg-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-300"
            onClick={handleDistanceLookup}
          >
            Fetch Travel Distance
          </button>
        </div>
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <p className="text-sm text-slate-500">Quote Date: {activeQuote ? new Date(activeQuote.quoteDate).toLocaleDateString() : '--'}</p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
          >
            Save Quote Draft
          </button>
        </div>
      </form>
      {summary && (
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="text-lg font-semibold text-slate-800">Financial Summary</h3>
          <dl className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Materials Total</dt>
              <dd className="text-lg font-semibold text-slate-700">{formatCurrency(summary.materialTotal)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Labor Total</dt>
              <dd className="text-lg font-semibold text-slate-700">{formatCurrency(summary.laborTotal)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Helpers</dt>
              <dd className="text-lg font-semibold text-slate-700">{formatCurrency(summary.helperTotal)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Fuel</dt>
              <dd className="text-lg font-semibold text-slate-700">{formatCurrency(summary.fuelTotal)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Total Cost</dt>
              <dd className="text-lg font-semibold text-slate-700">{formatCurrency(summary.totalCost)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Client Price</dt>
              <dd className="text-lg font-semibold text-green-600">{formatCurrency(summary.clientPrice)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Gross Profit</dt>
              <dd className="text-lg font-semibold text-emerald-600">{formatCurrency(summary.grossProfit)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};

export default QuoteForm;
