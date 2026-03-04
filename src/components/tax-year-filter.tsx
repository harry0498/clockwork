"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getAvailableTaxYears } from "@/lib/tax-year";

export function TaxYearFilter({ basePath }: { basePath: string }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentYear = searchParams.get("taxYear");
	const years = getAvailableTaxYears();

	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const params = new URLSearchParams(searchParams.toString());
		params.set("taxYear", e.target.value);
		router.push(`${basePath}?${params.toString()}`);
	}

	return (
		<select
			value={currentYear ?? years[0]?.value.toString()}
			onChange={handleChange}
			className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
		>
			{years.map((y) => (
				<option key={y.value} value={y.value}>
					{y.label}
				</option>
			))}
		</select>
	);
}
