import { ComponentType } from "react";

export type ReactLifeCycleFunctions<TProps, TSnapshot> = {
    onConstructor?: (props: TProps) => void;
    onWillMount?: (props: TProps) => void;
    onDidMount?: (props: TProps) => void;
    onReceiveProps?: (props: TProps, nextProps: TProps) => void;
    onGetSnapshotBeforeUpdate?: (prevProps: TProps, props: TProps) => TSnapshot;
    onDidUpdate?: (prevProps: TProps, props: TProps, snapshot: TSnapshot) => void;
    onWillUnmount?: (props: TProps) => void;
    onDidCatch?: (error: Error, info: React.ErrorInfo) => void;
}

export type InnerProps<TOuterProps, TAddedProps = {}, TRemovedProps = {}> = Omit<TOuterProps, keyof TRemovedProps> & TAddedProps;

export type StateUpdaters<TOuterProps, TState extends {}> = {
    [updaterName: string]: (state: TState, props: TOuterProps) => (...payload: any[]) => TState;
};

export type ExtractStateHandlers<TOuterProps, TState, TStateUpdaters extends StateUpdaters<TOuterProps, TState>> = {
    [handlerName in keyof TStateUpdaters]: (...payload: Parameters<ReturnType<TStateUpdaters[handlerName]>>) => void;
};

export type Transform<TBaseProps, TCurrentProps> = (component: ComponentType<TCurrentProps>) => ComponentType<TBaseProps>;

export type TransformsType<TCurrentProps> = {
    withLifecycle<TSnapshot>(spec: ReactLifeCycleFunctions<TCurrentProps, TSnapshot>): Transform<TCurrentProps, TCurrentProps>,

    withStateHandlers<TState extends {}, TStateName extends string, TUpdaters extends StateUpdaters<TCurrentProps, TState>>(
        createState: TState | ((props: TCurrentProps) => TState),
        stateName: TStateName,
        stateUpdaters: TUpdaters,
    ): Transform<TCurrentProps, InnerProps<TCurrentProps, Record<TStateName, TState> & ExtractStateHandlers<TCurrentProps, TState, TUpdaters>>>;

    omitProps<TPropsToOmit extends keyof TCurrentProps>(): Transform<TCurrentProps, InnerProps<TCurrentProps, {}, Pick<TCurrentProps, TPropsToOmit>>>;

    branch<TPropsToExclude extends TCurrentProps>(
        test: (props: TCurrentProps) => props is TPropsToExclude,
        trueComponent: ComponentType<TPropsToExclude>,
    ): Transform<TCurrentProps, Exclude<TCurrentProps, TPropsToExclude>>;

    pure(): Transform<TCurrentProps, TCurrentProps>;
};

export type ReactComposerType<TBaseProps, TCurrentProps> = {
    withLifecycle<TSnapshot>(spec: ReactLifeCycleFunctions<TCurrentProps, TSnapshot>): ReactComposerType<TBaseProps, TCurrentProps>;

    withStateHandlers<TState extends {}, TStateName extends string, TUpdaters extends StateUpdaters<TCurrentProps, TState>>(
        createState: TState | ((props: TCurrentProps) => TState),
        stateName: TStateName,
        stateUpdaters: TUpdaters,
    ): ReactComposerType<TBaseProps, InnerProps<TCurrentProps, Record<TStateName, TState> & ExtractStateHandlers<TCurrentProps, TState, TUpdaters>>>;

    omitProps<TPropsToOmit extends keyof TCurrentProps>(): ReactComposerType<TBaseProps, InnerProps<TCurrentProps, {}, Pick<TCurrentProps, TPropsToOmit>>>;

    branch<TPropsToExclude extends TCurrentProps>(
        test: (props: TCurrentProps) => props is TPropsToExclude,
        trueComponent: ComponentType<TPropsToExclude>,
    ): ReactComposerType<TBaseProps, Exclude<TCurrentProps, TPropsToExclude>>;

    finishPure(component: ComponentType<TCurrentProps>): ComponentType<TBaseProps>;
};
