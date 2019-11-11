import { ComponentType } from "react";
import { ReactLifeCycleFunctions } from '@hocs/with-lifecycle';
import { Composer } from "@typed-composer/core";
import { ReactComposerType, InnerProps, StateUpdaters, ExtractStateHandlers } from "./transform-types";
import createTransforms from "./transforms";

function createReactComposerWithCore<TBaseProps, TCurrentProps>(coreComposer: Composer<ComponentType<TBaseProps>, ComponentType<TCurrentProps>>): ReactComposerType<TBaseProps, TCurrentProps> {
    const transforms = createTransforms<TCurrentProps>();

    return {
        withLifecycle<TSnapshot>(spec: ReactLifeCycleFunctions<TCurrentProps, TSnapshot>) {
            return createReactComposerWithCore(coreComposer.withTransform(transforms.withLifecycle(spec)));
        },
        withStateHandlers<TState extends {}, TStateName extends string, TUpdaters extends StateUpdaters<TCurrentProps, TState>>(
            createState: TState | ((props: TCurrentProps) => TState),
            stateName: TStateName,
            stateUpdaters: TUpdaters,
        ) {
            return createReactComposerWithCore(coreComposer.withTransform(transforms.withStateHandlers(createState, stateName, stateUpdaters)));
        },
        omitProps<TPropsToOmit extends keyof TCurrentProps>() {
            const transform = transforms.omitProps<TPropsToOmit>();
            return createReactComposerWithCore(coreComposer.withTransform(transform));
        },
        branch<TPropsToExclude extends TCurrentProps>(
            test: (props: TCurrentProps) => props is TPropsToExclude,
            trueComponent: ComponentType<TPropsToExclude>,
        ) {
            return createReactComposerWithCore(coreComposer.withTransform(transforms.branch(test, trueComponent)));
        },
        branchByProp<TPropName extends keyof TCurrentProps, TPropToExclude extends TCurrentProps[TPropName]>(
            propName: TPropName,
            test: (prop: TCurrentProps[TPropName]) => prop is TPropToExclude,
            trueComponent: ComponentType<InnerProps<TCurrentProps, Record<TPropName, TPropToExclude>, Pick<TCurrentProps, TPropName>>>,
        ) {
            return createReactComposerWithCore(coreComposer.withTransform(transforms.branchByProp(propName, test, trueComponent)));
        },
        finishPure(component) {
            return coreComposer.withTransform(transforms.pure()).finish(component);
        },
    };
}

export default createReactComposerWithCore;
