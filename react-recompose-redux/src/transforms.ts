import { ComponentType } from "react";
import withLifecycle, { ReactLifeCycleFunctions } from "@hocs/with-lifecycle";
import { branch, pure, renderComponent, withStateHandlers } from "recompose";
import { TransformsType, Transform, InnerProps, StateUpdaters, ExtractStateHandlers } from './transform-types';
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

        omitProps<TPropsToOmit extends keyof TCurrentProps>() {
            return (component: ComponentType<InnerProps<TCurrentProps, {}, Pick<TCurrentProps, TPropsToOmit>>>) => component as ComponentType<TCurrentProps>;
        },

        branch<TPropsToExclude extends TCurrentProps>(
            test: (props: TCurrentProps) => props is TPropsToExclude,
            trueComponent: ComponentType<TPropsToExclude>,
        ) {
            return branch(test, renderComponent(trueComponent));
        },

        pure() {
            return (component) => pure(component);
        },
    };
}

export default createTransforms;
