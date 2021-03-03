import { h, rerender } from "forgo";
import type { ForgoComponentCtor, ForgoElementProps, ForgoNode } from "forgo";

export type SuspenseProps = ForgoElementProps & {
  fallback?: () => ForgoNode | ForgoNode[];
};

const SuspenseFallback: ForgoComponentCtor<SuspenseProps> = () => {
  return {
    render({ fallback }) {
      const fallbackResult = fallback?.();
      return fallbackResult || undefined;
    },
  };
};

const SuspenseInternal: ForgoComponentCtor<SuspenseProps> = () => {
  return {
    render({ children }) {
      return children;
    },
  };
};

export const Suspense: ForgoComponentCtor<SuspenseProps> = () => {
  return {
    error({ fallback }, args) {
      if (typeof window === "undefined") {
        throw args.error;
      }

      if (args.error.then) {
        const promise: Promise<void> = args.error;
        promise.then(() => {
          rerender(args.element);
        });
      }

      return <SuspenseFallback fallback={fallback} />;
    },
    render({ children, ...props }) {
      return <SuspenseInternal {...props}>{children}</SuspenseInternal>;
    },
  };
};
