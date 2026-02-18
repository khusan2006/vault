"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appendIdToken } from "@/utils";

export function useIdTokenNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idToken = searchParams.get("id_token");

  const withIdToken = useCallback(
    (path: string) => appendIdToken(path, idToken),
    [idToken],
  );

  const push = useCallback(
    (path: string) => {
      router.push(withIdToken(path));
    },
    [router, withIdToken],
  );

  return { push, withIdToken, idToken, router };
}
