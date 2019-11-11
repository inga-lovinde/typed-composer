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

describe("React composer usage suite", () => {
    it("should work as expected", () => {
        const Component = createReactComposer<{ title: string }>()
            .withStateHandlers(
                10,
                "counter",
                {
                    increment: (counter) => (amount: number) => counter + amount,
                    decrement: (counter) => (amount: number) => counter - amount,
                }
            )
            .withLifecycle({
                onDidMount: ({ decrement }) => decrement(3)
            })
            .omitProps('decrement')
            .finishPure(({ title, counter, increment }) => (
                <div>
                    <div className="text">{ `${title}-${counter}` }</div>
                    <button onClick={ () => increment(1) }>Increment</button>
                </div>
            ));

        const wrapper = mount(<Component title="Hello"/>);
        equal(wrapper.find('.text').text(), "Hello-7");
        wrapper.find('button').simulate('click');
        equal(wrapper.find('.text').text(), "Hello-8");
    });
});
