export type Composer<TBase, TCurrent, TPlugins> = {
    withTransform<TInner>(
        transform: (value: TInner) => TCurrent
    ): Composer<TBase, TInner, TPlugins>;

    finish(
        value: TCurrent
    ): TBase;
};

function withTransformFactory<TBase, TCurrent, TInner, TPlugins>(
    currentComposer: Composer<TBase, TCurrent, TPlugins>,
    transform: (value: TInner) => TCurrent,
): Composer<TBase, TInner, TPlugins> {
    const result: Composer<TBase, TInner, TPlugins> = {
        withTransform<TInnerNew>(
            transformNew: (value: TInnerNew) => TInner,
        ): Composer<TBase, TInnerNew, TPlugins> {
            return withTransformFactory<TBase, TInner, TInnerNew, TPlugins>(result, transformNew);
        },

        finish(
            value: TInner,
        ): TBase {
            return currentComposer.finish(transform(value));
        },
    };

    return result;
}

// eslint-disable-next-line import/prefer-default-export
export function createComposer<TBase, TPlugins = {}>(): Composer<TBase, TBase, TPlugins> {
    const result: Composer<TBase, TBase, TPlugins> = {
        withTransform<TInner>(
            transform: (value: TInner) => TBase,
        ): Composer<TBase, TInner, TPlugins> {
            return withTransformFactory<TBase, TBase, TInner, TPlugins>(result, transform);
        },

        finish(
            value: TBase,
        ): TBase {
            return value;
        },
    };

    return result;
}
