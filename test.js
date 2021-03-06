import test from "ava"
import { createStore, applyMiddleware } from "redux"
import { pipe, filter, forEach, map } from "callbag-basics"
import createCallbagMiddleware from "./dist/redux-callbag"
import delay from "callbag-delay"

const todos = (state = [], action) => {
    switch (action.type) {
        case "ADD_TODO":
            return state.concat([action.payload])
        case "REMOVE_TODO":
            return []
        case "ADD_SOMETHING":
            return state.concat([action.payload])
        case "AAAAA":
            console.log(action)
            return state
        default:
            return state
    }
}

const addTodo = payload => {
    return {
        type: "ADD_TODO",
        payload
    }
}

const addSomething = payload => {
    return {
        type: "ADD_SOMETHING",
        payload
    }
}

const removeTodo = () => {
    return {
        type: "REMOVE_TODO"
    }
}

const store = createStore(
    todos,
    ["Hello world"],
    applyMiddleware(
        createCallbagMiddleware((actions, store) => {
            const { select, mapSuccessTo, mapPromise } = actions

            actions |> select() |> mapPromise(d => 123) |> mapSuccessTo("AAAAA")

            actions
                |> select("ADD_SOMETHING")
                |> delay(1000)
                |> forEach(({ payload }) => {
                    console.log("log:" + payload)
                })

            actions
                |> select("ADD_TODO")
                |> delay(1000)
                |> mapSuccessTo(
                    "ADD_SOMETHING",
                    payload => payload + "  23333333"
                )
        })
    )
)

store.dispatch(addTodo("Hello redux"))
store.dispatch(addSomething("This will not add numbers"))

test("sync", t => {
    t.deepEqual(store.getState(), [
        "Hello world",
        "Hello redux",
        "This will not add numbers"
    ])
})
test.cb("async", t => {
    store.subscribe(() => {
        t.deepEqual(store.getState(), [
            "Hello world",
            "Hello redux",
            "This will not add numbers",
            "Hello redux  23333333"
        ])
        t.end()
    })
})
