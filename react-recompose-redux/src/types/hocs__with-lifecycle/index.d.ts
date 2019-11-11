declare module '@hocs/with-lifecycle' {
    // Inspired by https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/recompose/index.d.ts

    import * as React from 'react';
    import * as Recompose from 'recompose';

    export interface ReactLifeCycleFunctions<TProps, TSnapshot> {
        onConstructor?: (props: TProps) => void;
        onWillMount?: (props: TProps) => void;
        onDidMount?: (props: TProps) => void;
        onReceiveProps?: (props: TProps, nextProps: TProps) => void;
        onGetSnapshotBeforeUpdate?: (prevProps: TProps, props: TProps) => TSnapshot;
        onDidUpdate?: (prevProps: TProps, props: TProps, snapshot: TSnapshot) => void;
        onWillUnmount?: (props: TProps) => void;
        onDidCatch?: (error: Error, info: React.ErrorInfo) => void;
    }

    export default function withLifecycle<TProps, TSnapshot>(
        spec: ReactLifeCycleFunctions<TProps, TSnapshot>
    ): Recompose.InferableComponentEnhancerWithProps<TProps, TProps>;
}
