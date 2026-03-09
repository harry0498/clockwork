"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { memo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateInvoiceTemplate } from "@/actions/invoice-template";

const InvoicePdfPreview = dynamic(
  () => import("@/components/invoice-pdf-preview"),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[1/1.414] w-full items-center justify-center rounded-md border bg-white lg:aspect-auto lg:h-full">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    ),
  },
);

import { inputClassName } from "@/lib/constants";
import {
  FOOTER_PLACEHOLDERS,
  type FooterProfileData,
  type InvoiceTemplateConfig,
  invoiceTemplateSchema,
} from "@/lib/invoice-template";

interface InvoiceTemplateEditorProps {
  config: InvoiceTemplateConfig;
  profile: FooterProfileData;
}

const ColorField = memo(function ColorField({
  label,
  id,
  field,
  value,
  onColorChange,
}: {
  label: string;
  id: string;
  field: keyof InvoiceTemplateConfig;
  value: string;
  onColorChange: (field: keyof InvoiceTemplateConfig, value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onColorChange(field, e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-input"
        />
        <input
          id={id}
          type="text"
          maxLength={7}
          value={value}
          onChange={(e) => onColorChange(field, e.target.value)}
          className={`${inputClassName} font-mono text-xs`}
        />
      </div>
    </div>
  );
});

const Section = memo(function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-3 rounded-md border border-input p-4">
      <legend className="px-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
});

export function InvoiceTemplateEditor({
  config,
  profile,
}: InvoiceTemplateEditorProps) {
  const footerRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<InvoiceTemplateConfig>({
    resolver: zodResolver(invoiceTemplateSchema),
    defaultValues: config,
  });

  const w = watch();

  const setColor = useCallback(
    (field: keyof InvoiceTemplateConfig, value: string) => {
      setValue(field, value, { shouldValidate: true });
    },
    [setValue],
  );

  const insertPlaceholder = useCallback(
    (token: string) => {
      const el = footerRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const current = getValues("footer") ?? "";
      const next = current.slice(0, start) + token + current.slice(end);
      setValue("footer", next, { shouldValidate: true });
      const cursorPos = start + token.length;
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [setValue, getValues],
  );

  const onSubmit = useCallback(async (data: InvoiceTemplateConfig) => {
    try {
      await updateInvoiceTemplate(data);
      toast.success("Template saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }, []);

  const { ref: formRef, ...footerRegister } = register("footer");

  return (
    <div className="flex flex-col gap-6 lg:min-h-0 lg:flex-1 lg:flex-row">
      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 lg:flex-1 lg:overflow-y-auto lg:pb-6"
      >
        {/* Branding */}
        <Section title="Branding">
          <div className="space-y-1">
            <label htmlFor="companyName" className="text-xs font-medium">
              Business Name
            </label>
            <input
              id="companyName"
              type="text"
              maxLength={255}
              placeholder="Uses your profile name if empty"
              {...register("companyName")}
              className={inputClassName}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="titleText" className="text-xs font-medium">
              Title Text
            </label>
            <input
              id="titleText"
              type="text"
              maxLength={50}
              placeholder="INVOICE"
              {...register("titleText")}
              className={inputClassName}
            />
          </div>
        </Section>

        {/* Colours */}
        <Section title="Colours">
          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="Title"
              id="titleColor"
              field="titleColor"
              value={w.titleColor}
              onColorChange={setColor}
            />
            <ColorField
              label="Accent / Borders"
              id="accentColor"
              field="accentColor"
              value={w.accentColor}
              onColorChange={setColor}
            />
            <ColorField
              label="Body Text"
              id="textColor"
              field="textColor"
              value={w.textColor}
              onColorChange={setColor}
            />
            <ColorField
              label="Footer Text"
              id="footerTextColor"
              field="footerTextColor"
              value={w.footerTextColor}
              onColorChange={setColor}
            />
            <ColorField
              label="Table Header BG"
              id="tableHeaderBgColor"
              field="tableHeaderBgColor"
              value={w.tableHeaderBgColor}
              onColorChange={setColor}
            />
            <ColorField
              label="Table Header Text"
              id="tableHeaderTextColor"
              field="tableHeaderTextColor"
              value={w.tableHeaderTextColor}
              onColorChange={setColor}
            />
            <ColorField
              label="Table Borders"
              id="tableBorderColor"
              field="tableBorderColor"
              value={w.tableBorderColor}
              onColorChange={setColor}
            />
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="titleSize" className="text-xs font-medium">
                Title Size
              </label>
              <select
                id="titleSize"
                {...register("titleSize")}
                className={inputClassName}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="bodySize" className="text-xs font-medium">
                Body Size
              </label>
              <select
                id="bodySize"
                {...register("bodySize")}
                className={inputClassName}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="footerSize" className="text-xs font-medium">
                Footer Size
              </label>
              <select
                id="footerSize"
                {...register("footerSize")}
                className={inputClassName}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Layout */}
        <Section title="Layout">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="titleAlignment" className="text-xs font-medium">
                Title Alignment
              </label>
              <select
                id="titleAlignment"
                {...register("titleAlignment")}
                className={inputClassName}
              >
                <option value="left">Left</option>
                <option value="center">Centre</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="clientDetailsPosition"
                className="text-xs font-medium"
              >
                Client Details
              </label>
              <select
                id="clientDetailsPosition"
                {...register("clientDetailsPosition")}
                className={inputClassName}
              >
                <option value="right">Top Right</option>
                <option value="left">Top Left</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="showInvoiceFor"
              type="checkbox"
              {...register("showInvoiceFor")}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor="showInvoiceFor" className="text-xs font-medium">
              Show &ldquo;Invoice For&rdquo; section
            </label>
          </div>
        </Section>

        {/* Table */}
        <Section title="Table">
          <div className="space-y-2">
            <div className="space-y-1">
              <label htmlFor="hoursFormat" className="text-xs font-medium">
                Hours Format
              </label>
              <select
                id="hoursFormat"
                {...register("hoursFormat")}
                className={inputClassName}
              >
                <option value="decimal">Decimal (2.17)</option>
                <option value="hm">Hours & Minutes (2h 10m)</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="showHoursColumn"
                type="checkbox"
                {...register("showHoursColumn")}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="showHoursColumn" className="text-xs font-medium">
                Show Hours column
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="showRateColumn"
                type="checkbox"
                {...register("showRateColumn")}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="showRateColumn" className="text-xs font-medium">
                Show Rate column
              </label>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <Section title="Footer">
          <div className="space-y-1">
            <label htmlFor="footer" className="text-xs font-medium">
              Footer
            </label>
            <textarea
              id="footer"
              maxLength={1000}
              rows={5}
              placeholder="e.g. Account: %accountNumber% | Sort Code: %sortCode%"
              {...footerRegister}
              ref={(e) => {
                formRef(e);
                footerRef.current = e;
              }}
              className={inputClassName}
            />
            <p className="text-xs text-muted-foreground">
              {w.footer?.length ?? 0}/1000
            </p>
            <p className="text-xs text-muted-foreground">
              Wrap text in **double asterisks** to make it bold
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Click to insert placeholder:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FOOTER_PLACEHOLDERS.map(({ token, label }) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => insertPlaceholder(token)}
                  className="rounded-full border bg-muted px-2.5 py-0.5 text-xs hover:bg-muted/70 active:scale-95"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Template"}
        </button>
      </form>

      {/* Preview */}
      <div className="lg:flex-1">
        <InvoicePdfPreview config={w} profile={profile} />
      </div>
    </div>
  );
}
