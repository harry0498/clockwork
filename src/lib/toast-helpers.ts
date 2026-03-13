import { toast } from "sonner";

export function showErrorToast(err: unknown): void {
  toast.error(err instanceof Error ? err.message : "Something went wrong");
}
