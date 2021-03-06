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

export type InnerProps<TOuterProps, TAddedProps = {}, TRemovedProps = {}> = Omit<TOuterProps, keyof TRemovedProps & keyof TAddedProps> & TAddedProps;

export type StateUpdaters<TOuterProps, TState extends {}> = {
    [updaterName: string]: (state: TState, props: TOuterProps) => (...payload: any[]) => TState;
};

export type ExtractStateHandlers<TOuterProps, TState, TStateUpdaters extends StateUpdaters<TOuterProps, TState>> = {
    [handlerName in keyof TStateUpdaters]: (...payload: Parameters<ReturnType<TStateUpdaters[handlerName]>>) => void;
};

export type Handlers<TProps> = {
    [handlerName: string]: (props: TProps) => (...payload: any[]) => any;
};

export type ExtractHandlers<TProps, THandlers extends Handlers<TProps>> = {
    [handlerName in keyof THandlers]: (...payload: Parameters<ReturnType<THandlers[handlerName]>>) => ReturnType<ReturnType<THandlers[handlerName]>>;
};

type Coalesce<TA, TB> = TA extends Exclude<TA, null | undefined> ? Exclude<TB, null | undefined> : TB;

export type ExtractPropsAfterDefault<TProps, TDefaultProps> = TProps & {
    [propName in keyof TDefaultProps & keyof TProps]: Coalesce<TDefaultProps[propName], TProps[propName]>;
};

export type Transform<TBaseProps, TCurrentProps> = (component: ComponentType<TCurrentProps>) => ComponentType<TBaseProps>;

export type TransformsType<TCurrentProps> = {
    withLifecycle<TSnapshot>(spec: ReactLifeCycleFunctions<TCurrentProps, TSnapshot>): Transform<TCurrentProps, TCurrentProps>,

    withStateHandlers<TState extends {}, TStateName extends string, TUpdaters extends StateUpdaters<TCurrentProps, TState>>(
        createState: TState | ((props: TCurrentProps) => TState),
        stateName: TStateName,
        stateUpdaters: TUpdaters,
    ): Transform<TCurrentProps, InnerProps<TCurrentProps, Record<TStateName, TState> & ExtractStateHandlers<TCurrentProps, TState, TUpdaters>>>;

    withHandlers<THandlers extends Handlers<TCurrentProps>>(
        handlers: THandlers,
    ): Transform<TCurrentProps, InnerProps<TCurrentProps, ExtractHandlers<TCurrentProps, THandlers>>>;

    withRedux<TReduxState extends {} = {}, TStateProps extends {} = {}, TDispatchProps extends { [keyName: string]: Function } = {}>(
        mapStateToProps: ((state: TReduxState, ownProps: TCurrentProps) => TStateProps) | null | undefined,
        mapDispatchToProps: ((dispatch: (action: any) => void, ownProps: TCurrentProps) => TDispatchProps) | null | undefined,
    ): Transform<TCurrentProps, InnerProps<TCurrentProps, TStateProps & TDispatchProps>>;

    withDefaultProps<TDefaultProps extends Partial<TCurrentProps>>(
        defaultProps: TDefaultProps
    ): Transform<TCurrentProps, ExtractPropsAfterDefault<TCurrentProps, TDefaultProps>>;

    withProps<TNewProps extends {}>(
        createNewProps: (props: TCurrentProps) => TNewProps
    ): Transform<TCurrentProps, InnerProps<TCurrentProps, TNewProps>>;

    omitProps<TPropsToOmit extends keyof TCurrentProps>(): Transform<TCurrentProps, InnerProps<TCurrentProps, {}, Pick<TCurrentProps, TPropsToOmit>>>;

    branch<TPropsToExclude extends TCurrentProps>(
        test: (props: TCurrentProps) => props is TPropsToExclude,
        trueComponent: ComponentType<TPropsToExclude>,
    ): Transform<TCurrentProps, Exclude<TCurrentProps, TPropsToExclude>>;

    branchByProp<TPropName extends keyof TCurrentProps, TPropToExclude extends TCurrentProps[TPropName]>(
        propName: TPropName,
        test: (prop: TCurrentProps[TPropName]) => prop is TPropToExclude,
        trueComponent: ComponentType<InnerProps<TCurrentProps, Record<TPropName, TPropToExclude>, Pick<TCurrentProps, TPropName>>>,
    ): Transform<TCurrentProps, InnerProps<TCurrentProps, Record<TPropName, Exclude<TCurrentProps[TPropName], TPropToExclude>>, Pick<TCurrentProps, TPropName>>>;

    pure(): Transform<TCurrentProps, TCurrentProps>;
};

export type ReactComposerType<TBaseProps, TCurrentProps> = {
    withLifecycle<TSnapshot>(spec: ReactLifeCycleFunctions<TCurrentProps, TSnapshot>): ReactComposerType<TBaseProps, TCurrentProps>;

    withStateHandlers<TState extends {}, TStateName extends string, TUpdaters extends StateUpdaters<TCurrentProps, TState>>(
        createState: TState | ((props: TCurrentProps) => TState),
        stateName: TStateName,
        stateUpdaters: TUpdaters,
    ): ReactComposerType<TBaseProps, InnerProps<TCurrentProps, Record<TStateName, TState> & ExtractStateHandlers<TCurrentProps, TState, TUpdaters>>>;

    withHandlers<THandlers extends Handlers<TCurrentProps>>(
        handlers: THandlers,
    ): ReactComposerType<TBaseProps, InnerProps<TCurrentProps, ExtractHandlers<TCurrentProps, THandlers>>>;

    withRedux<TReduxState extends {} = {}, TStateProps extends {} = {}, TDispatchProps extends { [keyName: string]: Function } = {}>(
        mapStateToProps: ((state: TReduxState, ownProps: TCurrentProps) => TStateProps) | null | undefined,
        mapDispatchToProps: ((dispatch: (action: any) => void, ownProps: TCurrentProps) => TDispatchProps) | null | undefined,
    ): ReactComposerType<TBaseProps, InnerProps<TCurrentProps, TStateProps & TDispatchProps>>;

    withDefaultProps<TDefaultProps extends Partial<TCurrentProps>>(
        defaultProps: TDefaultProps
    ): ReactComposerType<TBaseProps, ExtractPropsAfterDefault<TCurrentProps, TDefaultProps>>;

    withProps<TNewProps extends {}>(
        createNewProps: (props: TCurrentProps) => TNewProps
    ): ReactComposerType<TBaseProps, InnerProps<TCurrentProps, TNewProps>>;

    omitProps<TPropsToOmit extends keyof TCurrentProps>(): ReactComposerType<TBaseProps, InnerProps<TCurrentProps, {}, Pick<TCurrentProps, TPropsToOmit>>>;

    branch<TPropsToExclude extends TCurrentProps>(
        test: (props: TCurrentProps) => props is TPropsToExclude,
        trueComponent: ComponentType<TPropsToExclude>,
    ): ReactComposerType<TBaseProps, Exclude<TCurrentProps, TPropsToExclude>>;

    branchByProp<TPropName extends keyof TCurrentProps, TPropToExclude extends TCurrentProps[TPropName]>(
        propName: TPropName,
        test: (prop: TCurrentProps[TPropName]) => prop is TPropToExclude,
        trueComponent: ComponentType<InnerProps<TCurrentProps, Record<TPropName, TPropToExclude>, Pick<TCurrentProps, TPropName>>>,
    ): ReactComposerType<TBaseProps, InnerProps<TCurrentProps, Record<TPropName, Exclude<TCurrentProps[TPropName], TPropToExclude>>, Pick<TCurrentProps, TPropName>>>;

    finishPure(component: ComponentType<TCurrentProps>): ComponentType<TBaseProps>;
};
