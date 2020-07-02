import React from "react";

export const getAccountString = (account) => {
    const len = account.length;
    return account.substr(0, 5) + '...' + account.substr(len-3,len-1);
}

const ArgumentNode = ({ node, argument, isRoot, onClick }) => {
    const supportingClass = argument.supporting ? "pro" : "con";
    const rootClass = isRoot ? "root" : "";
    const hasChildrenClass =
        argument.ownId === argument.parentId ? "hasChildren" : "";
    return (
        <div
            className={`argumentNode ${rootClass} ${supportingClass}`}
            onClick={() => {
                onClick && onClick(node);
            }}
        >
            <p>{"ID: " + argument.ownId}</p>
            <p>{"Text: " + argument.text}</p>
            <p>{"Votes: " + argument.votes}</p>
            <p>{"Creator: " + getAccountString(argument.creator)}</p>
            <p>{"Child Votes: " + argument.childVotes}</p>
            <p>{"Children: " + argument.numberOfChildren}</p>
            <p>{"Finalized: " + argument.isFinalized}</p>
        </div>
    );
};

export default ArgumentNode;
