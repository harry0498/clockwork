import { useRouter, useSearchParams } from "next/navigation";

export function useFilterParam(
  paramName: string,
  basePath: string,
  options?: { defaultValue?: string },
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get(paramName);

  function setValue(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== options?.defaultValue) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return [currentValue, setValue] as const;
}
