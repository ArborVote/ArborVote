import React from "react";

const BoxFilled = ({ keyValue, onClick, className }) => (
    <span key={keyValue} onClick={onClick} className={`box filled ${className}`}>
        {"\u25c6"}
    </span>
);
const BoxOutline = ({ keyValue, onClick, className }) => (
    <span key={keyValue} onClick={onClick} className={`box outline ${className}`}>
        {"\u25c7"}
    </span>
);

const ArgumentTree = ({ root, selected, updateSelected }) => {
    const numLevels = selected.rootPath.length;
    const boxFilled = (
        <BoxFilled
            key={root.id}
            keyValue={root.id}
            onClick={() => {
                updateSelected(root);
            }}
        />
    );
    const levels = [[boxFilled]];
    let item = root;
    for (let i = 1; i <= numLevels; ++i) {
        if (item && item.children && item.children.length > 0) {
            levels.push(
                item.children.map(child => {
                    if (selected.rootPath.indexOf(parseInt(child.id)) > -1) {
                        item = child;
                        return (
                            <BoxFilled
                                key={child.id}
                                keyValue={child.id}
                                className={child.isSupporting ? "pro" : "con"}
                                onClick={() => {
                                    updateSelected(child);
                                }}
                            />
                        );
                    }
                    return (
                        <BoxOutline
                            key={child.id}
                            keyValue={child.id}
                            className={child.isSupporting ? "pro" : "con"}
                            onClick={() => {
                                updateSelected(child);
                            }}
                        />
                    );
                })
            );
        }
    }
    return (
        <div className="argumentTree">
            {levels &&
                levels.map((level, index) => (
                    <div className="level" key={index}>
                        {level.length && level}
                    </div>
                ))}
        </div>
    );
};

export default ArgumentTree;
