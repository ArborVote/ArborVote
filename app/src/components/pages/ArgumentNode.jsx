import React from "react";
import { Icon } from "@iconify/react";
import hasChildrenIcon from "@iconify/icons-carbon/parent-child";

export const getAccountString = account => {
    const len = account.length;
    return account.substr(0, 5) + "..." + account.substr(len - 3, len - 1);
};

const ArgumentNode = ({ node, argument, isRoot, onClick }) => {
    const supportingClass = argument.isSupporting ? "pro" : "con";
    const rootClass = isRoot ? "root" : "";
    const hasChildren = !isRoot && node.children && node.children.length > 0;
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
            <p>{"Child Votes: " + argument.accumulatedChildVotes}</p>
            <p>{"Finalized: " + argument.isFinalized}</p>
            {hasChildren && (
                <Icon icon={hasChildrenIcon} className="hasChildren" />
            )}
        </div>
    );
};

export default ArgumentNode;
