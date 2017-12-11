import {combineReducers} from 'redux'
import flatten from 'lodash/flatten'
import merge from 'lodash/merge'
import configureActionCreator from './actionCreator'
import createReducer from './createReducer'

export default function composeSlices(schema, config = {}, mount = root => root, domainPrefix = '') {
    const keys = Object.keys(schema)
    const reducers = {}
    const sagas = []
    const slices = {}


    keys.map((key) => {
        const command = schema[key]
        const domain = domainPrefix + key.toUpperCase() + '/'
        const actionCreator = configureActionCreator(domain)

        if (typeof command == 'function') {
            const createSlice = command
            const slice = createSlice(root => mount(root)[key], config[key], actionCreator)
            reducers[key] = slice.reducers
            if (slice.sagas) sagas.push(slice.sagas)
            slices[key] = {
                ...slice.actions,
                ...slice.selectors
            }
        } else if (!Array.isArray(command) && typeof command == 'object') {
            const nestedSchema = command
            const composedSlice = composeSlices(nestedSchema, config[key], root => mount(root)[key], domain)
            reducers[key] = composedSlice.reducer
            if (composedSlice.sagas) sagas.push(composedSlice.sagas)
            slices[key] = {
                ...composedSlice.slices
            }
        } else if (Array.isArray(command)) {
            const sliceFactoryArray = command
            const createdSlices = sliceFactoryArray.map(sliceCreator => sliceCreator(root => mount(root)[key], config[key], actionCreator))

            reducers[key] = createReducer(
                merge({}, ...createdSlices.map(sliceItem => sliceItem.initial))
            ).assign(merge({}, ...createdSlices.map(sliceItem => sliceItem.reducers.getHandlers())))

            slices[key] = {
                ...merge({}, ...createdSlices.map(sliceItem => sliceItem.actions)),
                ...merge({}, ...createdSlices.map(sliceItem => sliceItem.selectors))
            }
            createdSlices.map(sliceItem => { sagas.push(sliceItem.sagas) })
        } else {
            throw {message: 'Compose slices unknown command', got: {key, command}}
        }
    })

    return {
        reducer: combineReducers(reducers),
        sagas: flatten(sagas),
        slices
    }
}

