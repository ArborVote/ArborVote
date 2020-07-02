import React from "react";
import { connect } from "react-redux";
import { contractActions } from "../../actions";
import ArgumentNode from "./ArgumentNode";
import ArgumentTree from "./ArgumentTree";
import "../../assets/scss/argumentTree.scss";

function rootPath(i, list) {
    if (i < 0 || i > list.length) {
        return null;
    }
    let path = [i];
    while (i != 0) {
        i = parseInt(list[i].parentId);
        path.push(i);
    }
    return path;
}

function treeDataFrom(list) {
    var newList = [];
    for (let i = 0; i < list.length; i += 1) {
        newList[i] = {};
        newList[i].id = i;
        newList[i].rootPath = rootPath(i, list);
        newList[i].supporting = list[i].supporting;
        newList[i].attributes = {
            // childVotes: list[i].childVotes,
            // creator: list[i].creator,
            // isFinalized: list[i].isFinalized,
            // numberOfChildren: list[i].numberOfChildren,
            // ownId: list[i].ownId,
            // parentId: list[i].parentId,
            // supporting: list[i].supporting,
            // text: list[i].text,
            // votes: list[i].votes
        };
        newList[i].children = []; // initialize the children
    }
    const root = newList[0];
    for (let i = 1; i < list.length; i += 1) {
        newList[list[i].parentId].children.push(newList[i]);
    }
    return root;
}

class ArgumentExplorer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: null
        };
        this.updateSelected = this.updateSelected.bind(this);
    }

    static getDerivedStateFromProps({ data: { allArguments } }, prevState) {
        const root = allArguments && treeDataFrom(allArguments);
        if (!prevState.selected) {
            return {
                root,
                selected: root
            };
        }
        let item = root;
        const pathFromRoot = prevState.selected.rootPath.reverse();
        for (let i = 0; i < pathFromRoot.length; ++i) {
            if (item && item.children.length > 0) {
                if (item.id === prevState.selected.id) {
                    return {
                        root,
                        selected: item
                    };
                }
                item = item.children[pathFromRoot[i + 1]];
            }
        }
        return { root };
    }

    updateSelected(selected) {
        this.setState({ selected });
    }

    render() {
        const { data } = this.props;
        const { allArguments } = data;
        const selected = this.state.selected;
        const root = this.state.root;
        if (!selected) {
            return null;
        }
        const proNodes = selected.children.filter(
            node => allArguments[node.id].supporting
        );
        const conNodes = selected.children.filter(
            node => !allArguments[node.id].supporting
        );

        return (
            <div className="argumentExplorer">
                {root && (
                    <ArgumentTree
                        root={root}
                        selected={selected}
                        updateSelected={this.updateSelected}
                    />
                )}
                <ArgumentNode
                    node={selected}
                    argument={allArguments[selected.id]}
                    isRoot={true}
                    onClick={this.updateSelected}
                />
                {selected && selected.children.length > 0 && (
                    <div className="argumentList">
                        <div className="argumentListColumn">
                            {proNodes.length > 0 &&
                                proNodes.map(node => (
                                    <ArgumentNode
                                        key={node.id}
                                        node={node}
                                        argument={allArguments[node.id]}
                                        onClick={this.updateSelected}
                                    />
                                ))}
                        </div>
                        <div className="argumentListColumn">
                            {conNodes.length > 0 &&
                                conNodes.map(node => (
                                    <ArgumentNode
                                        key={node.id}
                                        node={node}
                                        argument={allArguments[node.id]}
                                        onClick={this.updateSelected}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

function mapState(state) {
    const { data } = state.contract;
    return { data };
}

const actionCreators = {};

const connectedArgumentExplorer = connect(
    mapState,
    actionCreators
)(ArgumentExplorer);
export default connectedArgumentExplorer;
