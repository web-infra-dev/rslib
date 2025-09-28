import type { JSX, ReactNode } from 'react';
import type { App1ButtonProps, App1CProps, App1Namespace } from './App1';
import * as NamespaceImportApp1 from './App1';
import { App1A, App1C, App1C as C } from './App1';
import type { AsyncComponentLoader } from './App2';
import { App2, app2Props } from './App2';

interface DynamicComponentState {
  Component: typeof App1A | typeof App1C;
}

const DynamicComponent: AsyncComponentLoader<DynamicComponentState> = () => {
  const Component: DynamicComponentState['Component'] =
    Math.random() > 0.5 ? App1A : App1C;
  return import('./App1').then((mod) => {
    const Dynamic = mod[Component === App1A ? 'App1A' : 'App1C'];
    return <Dynamic />;
  });
};

const NamespaceComponents: App1Namespace = {
  Button: ({ label, ...rest }: App1ButtonProps) => (
    <button type="button" {...rest}>
      {label}
    </button>
  ),
};

const SectionWithSpread = (props: Record<string, unknown>) => (
  <section {...props} />
);

const spreadChildren: ReactNode[] = [
  <span key="first">First</span>,
  <span key="second">Second</span>,
];

export default function Root(): JSX.Element {
  return (
    <>
      <React.Fragment>
        <>
          <App1A />
          <React.Suspense fallback={<div>Loading...</div>}>
            <DynamicComponent />
          </React.Suspense>
        </>
      </React.Fragment>
      <C>
        {x ? (
          <App1A>
            <NamespaceImportApp1.App1B>
              <App2 props={app2Props}>
                <C props={NamespaceImportApp1.app1cProps as App1CProps} />
              </App2>
            </NamespaceImportApp1.App1B>
          </App1A>
        ) : (
          <NamespaceImportApp1.App1B />
        )}
      </C>
      <C className="c" />
      <App1C className="app1c"></App1C>
      <NamespaceImportApp1.App1B />
      <NamespaceComponents.Button
        label="Namespace button"
        {...{ title: 'extra', ['data-role']: 'primary' }}
        data-count={3}
        icon={<App1A />}
        fragmentContent={
          <>
            <span>Nested</span>
            <span>Fragment</span>
          </>
        }
      />
      <div className="wrapper">
        {[
          <section key="namespace-import" data-index="0">
            <NamespaceImportApp1.App data-dynamic="registry" data-item="one" />
            <foo:bar value="namespaced" />
            <svg:path d="M0,0 L10,10" xlink:href="#one" />
            <span>{'item-one'.toUpperCase()}</span>
            {/* JSXEmptyExpr in action */}
          </section>,
          <section key="legacy-widget" data-index="1">
            <App2 data-dynamic="registry" data-item="two" {...app2Props} />
            app2
            <App2 />
            <foo:bar value="namespaced-two" />
            <svg:path d="M10,10 L20,20" xlink:href="#two" />
            <App1A />
            {/* JSXEmptyExpr in action */}
          </section>,
          <section key="external-app" data-index="2">
            <App1A data-dynamic="registry" data-item="fallback" />
            <foo:bar value="namespaced-three" />
            <svg:path d="M20,20 L30,30" xlink:href="#three" />
            {(() => (
              <NamespaceComponents.Button label="Inline child" />
            ))()}
            {/* JSXEmptyExpr in action */}
          </section>,
        ]}
        <group-container>{...spreadChildren}</group-container>
        <text-block
          dangerouslySetInnerHTML={{ __html: '<strong>bold</strong>' }}
        />
        <SectionWithSpread
          {...{ 'data-testid': 'component-with-spread', role: 'region' }}
        />
      </div>
    </>
  );
}
