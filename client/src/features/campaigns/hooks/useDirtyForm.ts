"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function useDirtyForm() {
  const [isDirty, setIsDirty] = useState(false);
  const initialValues = useRef<string>("");

  const setClean = useCallback((currentValues: unknown) => {
    initialValues.current = JSON.stringify(currentValues);
    setIsDirty(false);
  }, []);

  const checkDirty = useCallback((currentValues: unknown) => {
    const current = JSON.stringify(currentValues);
    setIsDirty(current !== initialValues.current);
  }, []);

  // Warn on browser navigation when dirty
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return { isDirty, setClean, checkDirty, setIsDirty };
}
