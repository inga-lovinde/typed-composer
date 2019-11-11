import { ComponentClass } from "react";
import { createComposer } from "@typed-composer/core";
import createReactComposerWithCore from "./composer";
import { ReactComposerType } from "./transform-types";

function createReactComposer<TExternalProps>() : ReactComposerType<TExternalProps, TExternalProps> {
    return createReactComposerWithCore(createComposer<ComponentClass<TExternalProps>>());
}

export default createReactComposer;