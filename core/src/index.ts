export type Composer<TBase, TCurrent> = {
    withTransform<TInner>(
        transform: (value: TInner) => TCurrent
    ): Composer<TBase, TInner>;

    finish(
        value: TCurrent
    ): TBase;
};

function withTransformFactory<TBase, TCurrent, TInner>(
    currentComposer: Composer<TBase, TCurrent>,
    transform: (value: TInner) => TCurrent,
): Composer<TBase, TInner> {
    const result: Composer<TBase, TInner> = {
        withTransform<TInnerNew>(
            transformNew: (value: TInnerNew) => TInner,
        ): Composer<TBase, TInnerNew> {
            return withTransformFactory<TBase, TInner, TInnerNew>(result, transformNew);
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
export function createComposer<TBase>(): Composer<TBase, TBase> {
    const result: Composer<TBase, TBase> = {
        withTransform<TInner>(
            transform: (value: TInner) => TBase,
        ): Composer<TBase, TInner> {
            return withTransformFactory<TBase, TBase, TInner>(result, transform);
        },

        finish(
            value: TBase,
        ): TBase {
            return value;
        },
    };

    return result;
}
