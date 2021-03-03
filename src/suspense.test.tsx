import { h, mount } from "forgo";
import type { ForgoComponentCtor, ForgoElementProps } from "forgo";

import { Suspense } from "./suspense";

type TestComponentProps = ForgoElementProps & {
  throwError?: boolean;
  error?: any;
  onRender?: () => void;
};

const TestComponent: ForgoComponentCtor<TestComponentProps> = () => {
  return {
    render({ throwError, error, onRender }) {
      if (throwError && !error?.done) {
        throw error || new Error("test error");
      }

      onRender?.();

      return <h1>Hello, World!</h1>;
    },
  };
};

describe("suspense", () => {
  it("acts as pass through when no error", () => {
    const element = document.createElement("div");

    mount(
      <Suspense>
        <TestComponent />
      </Suspense>,
      element
    );

    expect(element).toHaveTextContent("Hello, World!");
  });

  it("renders empty when error with no fallback", () => {
    const element = document.createElement("div");

    mount(
      <Suspense>
        <TestComponent throwError />
      </Suspense>,
      element
    );

    expect(element).toBeEmptyDOMElement();
  });

  it("renders fallback when error", () => {
    const element = document.createElement("div");

    mount(
      <Suspense fallback={() => "Fallback..."}>
        <TestComponent throwError />
      </Suspense>,
      element
    );

    expect(element).toHaveTextContent("Fallback...");
  });

  it("recovers from fallback once promise is resolved", async () => {
    const element = document.createElement("div");

    let resolveError: () => void;
    let resolve = () => {
      (error as any).done = true;
      resolveError();
    };
    const error = new Promise<void>((res) => {
      resolveError = res;
    });

    let onRender: () => void;
    const waitForRender = new Promise<void>((res) => {
      onRender = res;
    });

    mount(
      <Suspense fallback={() => "Fallback..."}>
        <TestComponent throwError error={error} onRender={onRender} />
      </Suspense>,
      element
    );

    expect(element).toHaveTextContent("Fallback...");

    resolve();
    await waitForRender;

    expect(element).toHaveTextContent("Hello, World!");
  });
});
