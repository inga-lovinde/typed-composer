import { equal } from "assert";
import * as React from "react";
import createReactComposer from "../src";
import { mount } from "./enzyme";

const testString = (counter: number | string): counter is string => typeof counter === "string";

describe("React composer usage suite", () => {
    it("should work as expected", () => {
        const logData = [];

        const Component = createReactComposer<{ titleRaw: string }>()
            .withProps(({ titleRaw }) => ({
                title: `${titleRaw.substring(0, 1).toUpperCase()}${titleRaw.substring(1).toLowerCase()}`,
            }))
            .omitProps<'titleRaw'>()
            .withStateHandlers(
                10 as (number | string),
                "counter",
                {
                    increment: (counter) => (amount: number) =>
                        testString(counter)
                            ? counter
                            : counter > 10
                                ? "overload"
                                : counter + amount,
                    decrement: (counter) => (amount: number) =>
                        testString(counter)
                            ? counter
                            : counter - amount,
                }
            )
            .withLifecycle({
                onDidMount: ({ decrement }) => decrement(4)
            })
            .omitProps<"decrement">()
            .branchByProp(
                "counter",
                testString,
                ({ counter }) => <div className="text">{ `Fail: ${counter}/${counter.length}` }</div>
            )
            .withHandlers({
                writeLog: ({ counter, increment }) => (prefix: string) => {
                    logData.push(`${prefix}-${counter * 2}`);
                    increment(1);
                    return true;
                },
            })
            .finishPure(({ title, counter, increment, writeLog }) => (
                <div>
                    <div className="text">{ `${title}-${counter * counter}` }</div>
                    <button className="increment" onClick={ () => increment(1) }>Increment</button>
                    <button className="logA" onClick={ () => writeLog("A") }>Write A</button>
                    <button className="logB" onClick={ () => writeLog("B") }>Write B</button>
                </div>
            ));

        const wrapper = mount(<Component titleRaw="hElLo"/>);
        equal(wrapper.find('.text').text(), "Hello-36");
        wrapper.find('.increment').simulate('click');
        equal(wrapper.find('.text').text(), "Hello-49");
        wrapper.find('.logA').simulate('click');
        equal(logData.join(), "A-14");
        equal(wrapper.find('.text').text(), "Hello-64");
        wrapper.find('.increment').simulate('click');
        wrapper.find('.logB').simulate('click');
        wrapper.find('.increment').simulate('click');
        equal(wrapper.find('.text').text(), "Hello-121");
        wrapper.find('.logA').simulate('click');
        equal(wrapper.find('.text').text(), "Fail: overload/8");
        equal(logData.join(), "A-14,B-18,A-22");
    });
});
