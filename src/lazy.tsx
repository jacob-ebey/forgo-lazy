import { h } from "forgo";
import type { ForgoComponentCtor, ForgoElementProps } from "forgo";

export type DefaultForgoComponent<TProps extends ForgoElementProps> = {
  default: ForgoComponentCtor<TProps>;
};

export type LazyResult<TProps extends ForgoElementProps> =
  | ForgoComponentCtor<TProps>
  | DefaultForgoComponent<TProps>;

export type LazyOptions = {
  chunkName?: string;
};

export type LazyCache = {
  __FORGO_LAZY_CHUNKS__: Set<string>;
};

export function lazy<TProps extends ForgoElementProps>(
  loader: () => Promise<LazyResult<TProps>>,
  options?: LazyOptions
) {
  let Component: ForgoComponentCtor<TProps>;
  let promise: Promise<void> | undefined;

  const Lazy: ForgoComponentCtor<TProps> = (_, args) => {
    const cache: LazyCache = args.environment.document as any;
    cache.__FORGO_LAZY_CHUNKS__ = cache.__FORGO_LAZY_CHUNKS__ || new Set();

    if (!promise) {
      promise = loader().then((result) => {
        Component = typeof result === "function" ? result : result.default;
      });
    }

    return {
      render(props) {
        if (!Component) {
          throw promise;
        }

        if (options?.chunkName) {
          cache.__FORGO_LAZY_CHUNKS__.add(options.chunkName);
        }

        return <Component {...props} />;
      },
    };
  };

  return Lazy;
}
