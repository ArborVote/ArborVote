import { getStringFromRole, getRoleFromString, logReceipt } from "../helpers";

export const contractService = {
    getArgumentsCount,
    getStartTime,
    getStageDuration,
    getStage,
    advanceStage,
    getAllArguments,
    getArgument,
    getVoter,
    addArgument,
    finalizeLeaves,
    join,
    voteFor,
    voteAgainst
};

async function getArgumentsCount(contract, account) {
    const totalArguments = await contract.methods
        .argumentsCount()
        .call({ from: account });
    return parseInt(totalArguments);
}

async function getStartTime(contract, account, stage) {
    const startTime =
        stage === 3
            ? await contract.methods.countingStartTime().call({ from: account })
            : stage === 2
            ? await contract.methods.votingStartTime().call({ from: account })
            : await contract.methods
                  .debatingStartTime()
                  .call({ from: account });
    return parseInt(startTime);
}

async function getStage(contract, account) {
    const stage = await contract.methods.currentStage().call({ from: account });
    return parseInt(stage);
}

async function getStageDuration(contract, account) {
    const stageDuration = await contract.methods
        .stageDurationBaseValue()
        .call({ from: account });
    return parseInt(stageDuration);
}

async function advanceStage(contract, account) {
    return await contract.methods.advanceStage().send({ from: account });
}

async function getVoter(contract, account, address) {
    const voter = await contract.methods
        .voters(address)
        .call({ from: account });
    return voter;
}

async function getArgument(contract, account, id) {
    const argument = await contract.methods
        .arguments(parseInt(id))
        .call({ from: account });
    return argument;
}

async function getAllArguments(contract, account) {
    const totalArguments = await contract.methods
        .argumentsCount()
        .call({ from: account });

    const result = await Promise.all(
        Array(parseInt(totalArguments))
            .fill(1)
            .map((el, i) => getArgument(contract, account, i))
    );
    return result;
}

async function addArgument(contract, account, parentId, text, isSupporting) {
    const receipt = await contract.methods
        .addArgument(parseInt(parentId), text, isSupporting)
        .send({ from: account });
    if (!receipt.status) {
        logReceipt(receipt);
        return { error: "Transaction failed" };
    }
    return {};
}

async function finalizeLeaves(contract, account) {
    const receipt = await contract.methods
        .finalizeLeaves()
        .send({ from: account });
    if (!receipt.status) {
        logReceipt(receipt);
        return { error: "Transaction failed" };
    }
    return {};
}

async function join(contract, account) {
    const receipt = await contract.methods.join().send({ from: account });
    if (!receipt.status) {
        logReceipt(receipt);
        return { error: "Transaction failed" };
    }
    return {};
}

async function voteFor(contract, account, id, voteStrength) {
    const receipt = await contract.methods
        .voteFor(parseInt(id), parseInt(voteStrength))
        .send({ from: account });
    if (!receipt.status) {
        logReceipt(receipt);
        return { error: "Transaction failed" };
    }
    return { event: receipt.events["Voted"] };
}

async function voteAgainst(contract, account, id, voteStrength) {
    const receipt = await contract.methods
        .voteAgainst(parseInt(id), parseInt(voteStrength))
        .send({ from: account });
    if (!receipt.status) {
        logReceipt(receipt);
        return { error: "Transaction failed" };
    }
    return { event: receipt.events["Voted"] };
}
