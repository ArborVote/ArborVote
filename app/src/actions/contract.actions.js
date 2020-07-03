import { getStringFromRole, getRoleFromString } from "../helpers";
import { alertActions } from "./";
import { contractConstants } from "../constants";
import { contractService } from "../services";

export const contractActions = {
    clean,
    getArgumentsCount,
    getStartTime,
    getStage,
    getStageDuration,
    advanceStage,
    getArgument,
    getVoter,
    getAllArguments,
    addArgument,
    finalizeLeaves,
    join,
    voteFor,
    voteAgainst
};

function clean() {
    return dispatch => {
        dispatch({
            type: contractConstants.CLEAN
        });
    };
}


function getAllArguments() {
    return async (dispatch, getState) => {
        dispatch(started());
        let allArguments;
        try {
            const { account, contract } = getState().web3;
            allArguments = await contractService.getAllArguments(
                contract,
                account
            );
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Getting All Arguments"));
            return;
        }
        dispatch(result({ data: { allArguments } }));

        return allArguments;
    };
}

function getStage() {
    return async (dispatch, getState) => {
        dispatch(started());
        let stage;
        try {
            const { account, contract } = getState().web3;
            stage = await contractService.getStage(contract, account);
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Getting Arguments Count"));
            return;
        }
        dispatch(result({ data: { stage } }));
        return stage;
    };
}

function getStageDuration() {
    return async (dispatch, getState) => {
        dispatch(started());
        let stageDuration;
        try {
            const { account, contract } = getState().web3;
            stageDuration = await contractService.getStageDuration(contract, account);
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Getting Arguments Count"));
            return;
        }
        dispatch(result({ data: { stageDuration } }));
        return stageDuration;
    };
}

function advanceStage() {
    return async (dispatch, getState) => {
        dispatch(started());
        let data;
        try {
            const { account, contract } = getState().web3;
            data = await contractService.advanceStage(
                contract,
                account
            );
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Advancing Stage"));
            return;
        }
        if (!data.error) {
            dispatch(done());
        } else {
            dispatch(failure(data.error));
            dispatch(alertActions.error("Error Advancing Stage: " + data.error));
        }
    };
}

function getStartTime() {
    return async (dispatch, getState) => {
        dispatch(started());
        let startTime;
        try {
            const { account, contract } = getState().web3;
            const { data: { stage } } = getState().contract;
            startTime = await contractService.getStartTime(
                contract,
                account,
                stage
            );
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Getting Start Time"));
            return;
        }
        dispatch(result({ data: { startTime } }));
        return startTime;
    };
}

function getArgumentsCount() {
    return async (dispatch, getState) => {
        dispatch(started());
        let totalArguments;
        try {
            const { account, contract } = getState().web3;
            totalArguments = await contractService.getArgumentsCount(
                contract,
                account
            );
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Getting Arguments Count"));
            return;
        }
        dispatch(result({ data: { totalArguments } }));
        return totalArguments;
    };
}

function getVoter(address) {
    return async (dispatch, getState) => {
        dispatch(started());
        let voter;
        try {
            const { account, contract } = getState().web3;
            voter = await contractService.getVoter(contract, account, address);
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Getting Votes"));
            return;
        }
        dispatch(result({ data: { voter } }));
        return voter;
    };
}

function getArgument(argumentId) {
    return async (dispatch, getState) => {
        dispatch(started());
        let argument;
        try {
            const { account, contract } = getState().web3;
            argument = await contractService.getArgument(
                contract,
                account,
                argumentId
            );
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Getting Votes"));
            return;
        }
        dispatch(result({ data: { argument } }));
        return argument;
    };
}

function addArgument(parentId, text, isSupporting) {
    return async (dispatch, getState) => {
        dispatch(started());
        let data;
        try {
            const { account, contract } = getState().web3;
            data = await contractService.addArgument(
                contract,
                account,
                parentId,
                text,
                isSupporting
            );
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Adding Argument"));
            return;
        }
        if (!data.error) {
            dispatch(alertActions.success("Added Argument"));
            dispatch(done());
        } else {
            dispatch(failure(data.error));
            dispatch(
                alertActions.error("Error Adding Argument: " + data.error)
            );
        }
        return;
    };
}

function finalizeLeaves() {
    return async (dispatch, getState) => {
        dispatch(started());
        let data;
        try {
            const { account, contract } = getState().web3;
            data = await contractService.finalizeLeaves(contract, account);
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Finalizing Leaves"));
            return;
        }
        if (!data.error) {
            dispatch(alertActions.success("Finalized Leaves"));
            dispatch(done());
        } else {
            dispatch(failure(data.error));
            dispatch(
                alertActions.error("Error Finalizing Leaves: " + data.error)
            );
        }
        return;
    };
}

function join() {
    return async (dispatch, getState) => {
        dispatch(started());
        let data;
        try {
            const { account, contract } = getState().web3;
            data = await contractService.join(contract, account);
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Joining"));
            return;
        }
        if (!data.error) {
            dispatch(alertActions.success("Joined"));
            dispatch(done());
        } else {
            dispatch(failure(data.error));
            dispatch(alertActions.error("Error Joining: " + data.error));
        }
        return;
    };
}

function voteFor(argumentId, voteStrength) {
    return async (dispatch, getState) => {
        dispatch(started());
        let data;
        try {
            const { account, contract } = getState().web3;
            data = await contractService.voteFor(
                contract,
                account,
                argumentId,
                voteStrength
            );
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Voting"));
            return;
        }
        if (!data.error) {
            if (data.event) {
                dispatch(
                    alertActions.success("Successfully Voted For Argument")
                );
            }
            dispatch(done());
        } else {
            dispatch(failure(data.error));
            dispatch(alertActions.error("Error Voting: " + data.error));
        }
    };
}

function voteAgainst(argumentId, voteStrength) {
    return async (dispatch, getState) => {
        dispatch(started());
        let data;
        try {
            const { account, contract } = getState().web3;
            data = await contractService.voteAgainst(
                contract,
                account,
                argumentId,
                voteStrength
            );
        } catch (e) {
            console.log(e);
            dispatch(failure(e));
            dispatch(alertActions.error("Error Voting"));
            return;
        }
        if (!data.error) {
            if (data.event) {
                dispatch(
                    alertActions.success("Successfully Voted Against Argument")
                );
            }
            dispatch(done());
        } else {
            dispatch(failure(data.error));
            dispatch(alertActions.error("Error Voting: " + data.error));
        }
    };
}

function started() {
    return {
        type: contractConstants.STARTED
    };
}

function done() {
    return {
        type: contractConstants.DONE
    };
}

function cleanSelected(result) {
    return {
        type: contractConstants.CLEAN_SELECTED,
        ...result
    };
}

function result(result) {
    return {
        type: contractConstants.RESULT,
        ...result
    };
}

function failure(error) {
    return {
        type: contractConstants.ERROR,
        error
    };
}
