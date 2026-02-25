"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export function useDisplayConfigDraft<T>(open: boolean, value: T) {
  const [draft, setDraft] = useState<T>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(value),
    [draft, value],
  );

  const discard = useCallback(() => {
    setDraft(value);
  }, [value]);

  return {
    draft,
    setDraft,
    isDirty,
    discard,
  };
}
