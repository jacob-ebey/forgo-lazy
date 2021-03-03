/**
 * @jest-environment node
 */

import { h, createForgoInstance } from "forgo";
import type { ForgoComponentCtor, ForgoElementProps } from "forgo";
import { parseHTML } from "linkedom";

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

describe("suspense server", () => {
  it("acts as pass through when no error", () => {
    const { window, document, HTMLElement } = parseHTML(
      "<html><head></head><body></body></html>"
    );

    window.HTMLElement = HTMLElement;
    window.Text = document.createTextNode().constructor;

    const forgoInstance = createForgoInstance({ window, document });

    const element = document.createElement("div");

    forgoInstance.mount(
      <Suspense>
        <TestComponent />
      </Suspense>,
      element
    );

    expect(element).toHaveTextContent("Hello, World!");

    expect(element).toHaveTextContent("Hello, World!");
  });

  it("throws when error", () => {
    const { window, document, HTMLElement } = parseHTML(
      "<html><head></head><body></body></html>"
    );

    window.HTMLElement = HTMLElement;
    window.Text = document.createTextNode().constructor;

    const forgoInstance = createForgoInstance({ window, document });

    const element = document.createElement("div");

    expect(() => {
      forgoInstance.mount(
        <Suspense>
          <TestComponent throwError />
        </Suspense>,
        element
      );
    }).toThrow("test error");
  });
});
