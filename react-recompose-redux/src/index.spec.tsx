import { equal } from "assert";
import { configure, mount } from "enzyme";
import * as React from "react";
import createReactComposer from "./index";
import { JSDOM } from "jsdom";
const Adapter = require("enzyme-adapter-react-16");

function setUpDomEnvironment() {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'http://localhost/'});
    const { window } = dom;

    global.window = window;
    global.document = window.document;
    global.navigator = {
        userAgent: 'node.js',
    };
    copyProps(window, global);
}

function copyProps(src, target) {
    const props = Object.getOwnPropertyNames(src)
        .filter(prop => typeof target[prop] === 'undefined')
        .map(prop => Object.getOwnPropertyDescriptor(src, prop));
    Object.defineProperties(target, props);
}

setUpDomEnvironment();
configure({ adapter: new Adapter() });

const testString = (counter: number | string): counter is string => typeof counter === "string";

describe("React composer usage suite", () => {
    it("should work as expected", () => {
        const logData = [];

        const Component = createReactComposer<{ title: string }>()
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

        const wrapper = mount(<Component title="Hello"/>);
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
