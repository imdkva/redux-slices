
export default function createReducer(initialState = {}) {
    let handlers = {}
    const reducer = (state = initialState, action = {}) => {
        const type = action.type
        const payload = action.payload
        const context = action.context
        const handler = handlers[type]
        let result = state

        if (handler) {
            result = handler(state, payload, context, initialState)
        }

        return result
    }

    reducer.handle = (action, mutator) => {
        if (!action) {
            console.warn('reducer handlers: ', handlers)
            throw 'reducer.handle: not an action'
        }
        if (Array.isArray(action)) {
            action.map(item => {
                handlers[item.toString()] = mutator
            })
        } else {
            handlers[action.toString()] = mutator
        }
        return reducer
    }
    reducer.getHandlers = () => handlers
    reducer.assign = (newHandlers) => {
        handlers = {...handlers, ...newHandlers}
        return reducer
    }

    return reducer
}
