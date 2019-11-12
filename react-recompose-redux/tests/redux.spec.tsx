import { equal } from "assert";
import * as React from "react";
import { Provider } from 'react-redux';
import { combineReducers, createStore, Reducer } from 'redux';
import createReactComposer from "../src";
import { mount } from "./enzyme";

const testString = (counter: number | string): counter is string => typeof counter === "string";

const COUNTERA_INCREMENT_ACTION = "COUNTERA_INCREMENT_ACTION";
const COUNTERB_INCREASE_ACTION = "COUNTERB_INCREASE_ACTION";

const counterActions = {
    incrementCounterA: () => ({
        type: COUNTERA_INCREMENT_ACTION,
    }),
    increaseCounterB: (amount: number) => ({
        type: COUNTERB_INCREASE_ACTION,
        payload: amount,
    }),
};

const initialCounterState = {
    counterA: 101,
    counterB: 201,
};

const counterReducer = (state = initialCounterState, action: any = {}) => {
    switch (action.type) {
        case COUNTERA_INCREMENT_ACTION:
            return ({
                ...state,
                counterA: state.counterA + 1
            });
        case COUNTERB_INCREASE_ACTION:
            return ({
                ...state,
                counterB: state.counterB + (action.payload as number)
            });
        default:
            return state;
    }
};

const reducers = combineReducers({
    counter: counterReducer,
});

type InferReduxStateType<TReducer> = TReducer extends Reducer<infer TReduxState> ? TReduxState : never;

type ReduxState = InferReduxStateType<typeof reducers>;

const counterSelectors = {
    getCounterA: (state: ReduxState) => state.counter.counterA,
    getCounterB: (state: ReduxState) => state.counter.counterB,
};

describe("React composer redux usage suite", () => {
    it("should work as expected", () => {
        const logData = [];
        const store = createStore(reducers);

        const InnerComponent = createReactComposer<{ title: string }>()
            .withRedux(
                (state: ReduxState) => ({
                    firstCounter: counterSelectors.getCounterA(state),
                    secondCounter: counterSelectors.getCounterB(state),
                }),
                (dispatch) => ({
                    incrementFirstCounter() {
                        dispatch(counterActions.incrementCounterA());
                    },
                    increaseSecondCounter(amount: number) {
                        dispatch(counterActions.increaseCounterB(amount));
                    },
                }),
            )
            .finishPure(({ title, firstCounter, secondCounter, incrementFirstCounter, increaseSecondCounter }) => (
                <div>
                    <div className="text">{ `${title}-${firstCounter}-${secondCounter}` }</div>
                    <button className="incrementFirst" onClick={ () => incrementFirstCounter() }>A++</button>
                    <button className="increaseSecond" onClick={ () => increaseSecondCounter(10) }>B+=10</button>
                </div>
            ));

        const wrapper = mount(
            <Provider store={ store }>
                <InnerComponent title="Hello" />
            </Provider>
        );

        equal(wrapper.find('.text').text(), "Hello-101-201");
        wrapper.find('.incrementFirst').simulate('click');
        equal(wrapper.find('.text').text(), "Hello-102-201");
        wrapper.find('.increaseSecond').simulate('click');
        equal(wrapper.find('.text').text(), "Hello-102-211");
        wrapper.find('.incrementFirst').simulate('click');
        wrapper.find('.incrementFirst').simulate('click');
        wrapper.find('.increaseSecond').simulate('click');
        wrapper.find('.increaseSecond').simulate('click');
        wrapper.find('.increaseSecond').simulate('click');
        equal(wrapper.find('.text').text(), "Hello-104-241");
    });
});
