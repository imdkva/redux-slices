// FIXME: should return FSA 
export default function configureActionCreator(domain) {
    return function createAction(type, payload, context) {
        const actionObj = {type: `${domain}${type}`, payload}
        Object.assign(actionObj,
            context ? {context} : null
        )
        return actionObj
    }
}
