import { ComponentType } from "react";
import withLifecycle, { ReactLifeCycleFunctions } from "@hocs/with-lifecycle";
import { connect } from "react-redux";
import { branch, pure, renderComponent, withHandlers, withProps, withStateHandlers } from "recompose";
import { TransformsType, Transform, InnerProps, StateUpdaters, ExtractStateHandlers, Handlers, ExtractHandlers } from './transform-types';
const mapValues = require("lodash.mapvalues");

type ExtractStateHandlersForRecompose<TOuterProps, TState, TStateName extends string, TStateUpdaters extends StateUpdaters<TOuterProps, TState>> = {
    [handlerName in keyof TStateUpdaters]: (...payload: any[]) => Record<TStateName, TState>;
};
type ExtractStateUpdatersForRecompose<TOuterProps, TState, TStateName extends string, TStateUpdaters extends StateUpdaters<TOuterProps, TState>> = {
    [handlerName in keyof TStateUpdaters]: (state: Record<TStateName, TState>, props: TOuterProps) => (...payload: any[]) => Record<TStateName, ReturnType<ReturnType<TStateUpdaters[handlerName]>>>;
};

function createRecord<TState extends {}, TStateName extends string>(state: TState, stateName: TStateName): Record<TStateName, TState> {
    return { [stateName]: state } as Record<TStateName, TState>;
}

function createTransforms<TCurrentProps>(): TransformsType<TCurrentProps> {
    return {
        withLifecycle<TSnapshot>(spec: ReactLifeCycleFunctions<TCurrentProps, TSnapshot>) {
            return withLifecycle(spec);
        },

        withStateHandlers<TState extends {}, TStateName extends string, TUpdaters extends StateUpdaters<TCurrentProps, TState>>(
            createState: TState | ((props: TCurrentProps) => TState),
            stateName: TStateName,
            stateUpdaters: TUpdaters,
        ) {
            const createStateForRecompose: Record<TStateName, TState> | ((props: TCurrentProps) => Record<TStateName, TState>) =
                (createState instanceof Function)
                    ? (props: TCurrentProps) => createRecord(createState(props), stateName)
                    : createRecord(createState, stateName);

            return withStateHandlers<Record<TStateName, TState>, ExtractStateHandlersForRecompose<TCurrentProps, TState, TStateName, TUpdaters>, TCurrentProps>(
                createStateForRecompose,
                mapValues(
                    stateUpdaters,
                    (updater: (state: TState, props: TCurrentProps) => (...payload: any[]) => TState) : (
                        (state: Record<TStateName, TState>, props: TCurrentProps) => (...payload: any[]) => Record<TStateName, TState>
                    ) => (state, props) => {
                        const handler = updater(state[stateName], props);
                        return (...payload: any[]) => createRecord(handler(...payload), stateName);
                    },
                ) as ExtractStateUpdatersForRecompose<TCurrentProps, TState, TStateName, TUpdaters>,
            ) as Transform<TCurrentProps, InnerProps<TCurrentProps, Record<TStateName, TState> & ExtractStateHandlers<TCurrentProps, TState, TUpdaters>>>;
        },

        withHandlers<THandlers extends Handlers<TCurrentProps>>(
            handlers: THandlers,
        ) {
            return withHandlers(handlers) as Transform<TCurrentProps, InnerProps<TCurrentProps, ExtractHandlers<TCurrentProps, THandlers>>>;
        },

        withRedux<TReduxState extends {} = {}, TStateProps extends {} = {}, TDispatchProps extends { [keyName: string]: Function } = {}>(
            mapStateToProps: ((state: TReduxState, ownProps: TCurrentProps) => TStateProps) | null | undefined,
            mapDispatchToProps: ((dispatch: (action: any) => void, ownProps: TCurrentProps) => TDispatchProps) | null | undefined,
        ) {
            return connect(mapStateToProps, mapDispatchToProps) as Transform<TCurrentProps, InnerProps<TCurrentProps, TStateProps & TDispatchProps>>;
        },

        withProps<TNewProps extends {}>(
            createNewProps: (props: TCurrentProps) => TNewProps
        ) {
            return withProps(createNewProps) as Transform<TCurrentProps, InnerProps<TCurrentProps, TNewProps>>;
        },

        omitProps<TPropsToOmit extends keyof TCurrentProps>() {
            return (component: ComponentType<InnerProps<TCurrentProps, {}, Pick<TCurrentProps, TPropsToOmit>>>) => component as ComponentType<TCurrentProps>;
        },

        branch<TPropsToExclude extends TCurrentProps>(
            test: (props: TCurrentProps) => props is TPropsToExclude,
            trueComponent: ComponentType<TPropsToExclude>,
        ) {
            return branch(test, renderComponent(trueComponent));
        },

        branchByProp<TPropName extends keyof TCurrentProps, TPropToExclude extends TCurrentProps[TPropName]>(
            propName: TPropName,
            test: (prop: TCurrentProps[TPropName]) => prop is TPropToExclude,
            trueComponent: ComponentType<InnerProps<TCurrentProps, Record<TPropName, TPropToExclude>, Pick<TCurrentProps, TPropName>>>,
        ) {
            return branch(({ [propName]: prop }) => test(prop), renderComponent(trueComponent));
        },

        pure() {
            return (component) => pure(component);
        },
    };
}

export default createTransforms;
