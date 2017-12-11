# redux-slices

TODO: readme, examples, eslint, flowtype

```js
import {takeEvery, select} from 'redux-saga/effects'
import update from 'immutability-helper'
import {createReducer, createSlice} from 'redux-slices'

// selectors created automatically based on defaultState fields
export const defaultState = {
    field: 'defaultValue' 
}

// optional custom selectors
export const createSelectors = (mount) => ({
    fieldUpper: state => mount(state).field.toUpperCase()
}) 

// actions automatically namespaced and injected with meta "__reduxType" property, which uses instead of constants
export const createActions = ({action}) => ({ 
    onSomethingHappened: (dataForPayload, possiblySomeMeta) => action('ACTION1', dataForPayload, possiblySomeMeta), // FSA creator
    onNothingHappened: () => action('ACTION2'),
    onNothingHappenedAtAll: () => action('ACTION3')
})

// reducer as a hashtable
export const createReducers = (actions, initialState) => createReducer(initialState) 
    // hanlers can be overrided at composeSlices
    .handle(actions.onSomethingHappened, (state, payload, meta) => update(state, { 
        field: {$set: (!meta.isError) ? 'newValue with ' + payload : 'oops'}
    }))
    // handle multiple actions
    .handle([
        actions.onNothingHappened,
        actions.onNothingHappenedAtAll
    ], state => state)

// optional saga with namespaced actions and relative selectors, automatically launched by composeSlices
export const createSagas = (actions, selectors) => function* saga() {
    const field = yield select(selectors.field)
    const fieldUpper = yield select(selectors.fieldUpper)
    yield takeEvery(actions.onSomethingHappened, () => console.log('side effect!', field, fieldUpper))
}

// slice with namespaced actions, reducers and relative selectors for composing by composeSlices
export default createSlice({
    createActions, createSelectors, createReducers, createSagas, defaultState
})
```

