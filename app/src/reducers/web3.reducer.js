import { web3Constants } from "../constants";

export function web3(state = {account: ""}, action) {
    switch (action.type) {
        case web3Constants.STARTED:
            return {
                ...state,
                inProgress: true
            };
        case web3Constants.LOADED:
            return {
                ...state,
                inProgress: false,
                ...action
            };
        case web3Constants.ERROR:
            return {
                ...state,
                inProgress: false,
                error: action.error
            };
        default:
            return state;
    }
}
