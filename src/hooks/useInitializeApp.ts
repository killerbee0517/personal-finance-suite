import { useEffect } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";

export const useInitializeApp = () => {
  const init = useFinanceStore((s) => s.init);
  const ready = useFinanceStore((s) => s.ready);
  const loading = useFinanceStore((s) => s.loading);

  useEffect(() => {
    if (!ready && !loading) {
      init();
    }
  }, [init, ready, loading]);

  return { ready, loading };
};
