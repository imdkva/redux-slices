
export default function createSlice({createActions, createSelectors, createReducers, createSagas, defaultState}) {
    return (mount, opts = {}, actionCreator) => {
        const _initialState = opts.initialState || {}
        const initialState = {...defaultState, ..._initialState}
        const actions = createActions({...opts, action: actionCreator})
        const actionsWithTypes = {}
        Object.keys(actions).map(actionCreatorName => {
            const actionCreator = actions[actionCreatorName]
            if (!actionCreator.nonAction) {
                const namespacedType = actionCreator().type
                actionCreator.__reduxActionType = namespacedType
                actionCreator.toString = function() { return this.__reduxActionType }
            }
            actionsWithTypes[actionCreatorName] = actionCreator
        })
        const reducers = createReducers(actionsWithTypes, initialState, opts)

        const stateKeys = Object.keys(initialState)
        const stateSelectors = stateKeys.map(key => ({[key]: state => mount(state)[key]}))


        const selectors = {
            ...Object.assign({}, ...stateSelectors),
            ...createSelectors(mount, opts),
            state: state => mount(state)
        }
        
        const sagas = (createSagas) ? createSagas(actionsWithTypes, selectors, opts) : null

        return {
            actions: actionsWithTypes,
            selectors,
            sagas,
            reducers,
            initial: initialState
        }
    }
}
