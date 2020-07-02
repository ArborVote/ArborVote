import React, { useState } from "react";
import { connect } from "react-redux";
import { contractActions } from "../../actions";

const AddArgumentForm = ({ addArgument, afterSubmit }) => {
    const [parentId, setParentId] = useState("");
    const [text, setText] = useState("");
    const [isSupporting, setSupporting] = useState(false);

    return (
        <section>
            <input
                type="number"
                placeholder="parentId"
                value={parentId}
                onChange={e => setParentId(e.target.value)}
            />
            <input
                type="text"
                placeholder="text"
                value={text}
                onChange={e => setText(e.target.value)}
            />
            <div>
                <span>Supporting?</span>
                <input
                    type="checkbox"
                    value={isSupporting}
                    onChange={e => {
                        setSupporting(isSupporting => !isSupporting);
                    }}
                />
            </div>
            <button
                onClick={async e => {
                    await addArgument(parentId, text, isSupporting);
                    afterSubmit();
                }}
            >
                Add Argument
            </button>
        </section>
    );
};

function mapState(state) {
    return {};
}

const actionCreators = {
    addArgument: contractActions.addArgument
};

const connectedAddArgumentForm = connect(
    mapState,
    actionCreators
)(AddArgumentForm);

export default connectedAddArgumentForm;
