"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

interface UseWizardSaveBarOptions {
  id: string;
  isDirty: boolean;
  canSave: boolean;
}

export function useWizardSaveBar({
  id,
  isDirty,
  canSave,
}: UseWizardSaveBarOptions) {
  const saveBarRef = useRef<UISaveBarElement | null>(null);

  useEffect(() => {
    if (isDirty) {
      window.shopify?.saveBar?.show(id);
    } else {
      window.shopify?.saveBar?.hide(id);
    }
  }, [id, isDirty]);

  useEffect(() => {
    return () => {
      window.shopify?.saveBar?.hide(id);
    };
  }, [id]);

  useLayoutEffect(() => {
    const el = saveBarRef.current;
    if (!el) return;

    const btn = el.querySelector('button[variant="primary"]');
    if (!btn) return;

    if (canSave) {
      btn.removeAttribute("disabled");
    } else {
      btn.setAttribute("disabled", "");
    }
  }, [canSave]);

  return saveBarRef;
}
