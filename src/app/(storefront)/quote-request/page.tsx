import { QuoteRequestForm } from "@/features/quotes/quote-request-form";

export default function StorefrontQuoteRequestPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-14">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Quote Request
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
          Tell us about your project
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Submit a product or shade request and the shop team can turn it into a tailored estimate.
        </p>
      </div>

      <div className="mt-10">
        <QuoteRequestForm />
      </div>
    </div>
  );
}
