import { h, mount } from "forgo";
import type { ForgoComponentCtor, ForgoElementProps } from "forgo";

import { lazy, LazyCache, LazyOptions } from "./lazy";
import type { LazyResult } from "./lazy";

import { Suspense } from "./suspense";

function createLazy<TProps extends ForgoElementProps>(
  loader: () => Promise<LazyResult<TProps>>,
  options?: LazyOptions
) {
  let resolve;
  const promise = new Promise<LazyResult<TProps>>((res) => {
    resolve = () => {
      Promise.resolve(loader()).then(res);
    };
  });
  const wrappedLoad = () => promise;

  const Component = lazy(wrappedLoad, options);

  return {
    Component,
    resolve,
  };
}

type TestComponentProps = ForgoElementProps & {
  onRender?: () => void;
};

const TestComponent: ForgoComponentCtor<TestComponentProps> = () => {
  return {
    render({ onRender }) {
      onRender?.();
      return <h1>Hello, World!</h1>;
    },
  };
};

describe("lazy", () => {
  it("should fallback when not loaded ctor", async () => {
    const { Component, resolve } = createLazy(async () => TestComponent);
    let onRender: () => void;
    const waitForRender = new Promise<void>((res) => {
      onRender = res;
    });

    const element = document.createElement("div");

    mount(
      <Suspense fallback={() => "Fallback..."}>
        <Component onRender={onRender} />
      </Suspense>,
      element
    );

    expect(element).toHaveTextContent("Fallback...");

    resolve();
    await waitForRender;

    expect(element).toHaveTextContent("Hello, World!");
  });

  it("should fallback when not loaded default", async () => {
    const { Component, resolve } = createLazy(async () => ({
      default: TestComponent,
    }));
    let onRender: () => void;
    const waitForRender = new Promise<void>((res) => {
      onRender = res;
    });

    const element = document.createElement("div");

    mount(
      <Suspense fallback={() => "Fallback..."}>
        <Component onRender={onRender} />
      </Suspense>,
      element
    );

    expect(element).toHaveTextContent("Fallback...");

    resolve();
    await waitForRender;

    expect(element).toHaveTextContent("Hello, World!");
  });

  it("should not fallback on subsequent usages", async () => {
    const { Component, resolve } = createLazy(async () => ({
      default: TestComponent,
    }));
    let onRender: () => void;
    const waitForRender = new Promise<void>((res) => {
      onRender = res;
    });

    const element = document.createElement("div");

    mount(
      <Suspense fallback={() => "Fallback..."}>
        <Component onRender={onRender} />
      </Suspense>,
      element
    );

    expect(element).toHaveTextContent("Fallback...");

    resolve();
    await waitForRender;

    expect(element).toHaveTextContent("Hello, World!");

    const element2 = document.createElement("div");

    mount(
      <Suspense fallback={() => "Fallback..."}>
        <Component />
      </Suspense>,
      element2
    );
    expect(element2).toHaveTextContent("Hello, World!");
  });

  it("should report chunk names", async () => {
    const { Component, resolve } = createLazy(
      async () => ({
        default: TestComponent,
      }),
      {
        chunkName: "test-chunk",
      }
    );
    let onRender: () => void;
    const waitForRender = new Promise<void>((res) => {
      onRender = res;
    });

    const element = document.createElement("div");

    mount(
      <Suspense fallback={() => "Fallback..."}>
        <Component onRender={onRender} />
      </Suspense>,
      element
    );

    expect(element).toHaveTextContent("Fallback...");

    resolve();
    await waitForRender;

    expect(element).toHaveTextContent("Hello, World!");
    const cache: LazyCache = document as any;
    expect(Array.from(cache.__FORGO_LAZY_CHUNKS__)).toEqual(["test-chunk"]);
  });
});
