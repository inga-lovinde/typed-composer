import { equal } from "assert";
import { createComposer } from "./index";

describe("Composer tests", () => {
    it("should return expected result in a basic scenario", () => {
        const composer = createComposer<string>()
            .withTransform((n: number) => `[${n}]`)
            .withTransform((n: number) => n + 2)
            .withTransform((n: number) => n * n);

        equal(composer.finish(10), "[102]");
    });
});
