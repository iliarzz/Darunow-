"use client";

import { useConfirmContext } from "@/components/confirm/ConfirmProvider";
import type { ConfirmOptions } from "@/components/confirm/ConfirmDialog";

export function useConfirm() {
  const { confirm } = useConfirmContext();
  return (options: ConfirmOptions) => confirm(options);
}
