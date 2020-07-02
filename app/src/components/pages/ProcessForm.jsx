import React, { useState } from "react";
import { connect } from "react-redux";
import { contractActions } from "../../actions";

const ProcessForm = ({ finalizeLeaves, afterSubmit }) => {
    const [parentId, setParentId] = useState("");
    const [text, setText] = useState("");
    const [isSupporting, setSupporting] = useState(false);

    return (
        <section>
            <button
                onClick={async e => {
                    await finalizeLeaves();
                    afterSubmit();
                }}
            >
                Finalize Debate
            </button>
        </section>
    );
};

function mapState(state) {
    return {};
}

const actionCreators = {
    finalizeLeaves: contractActions.finalizeLeaves
};

const connectedProcessForm = connect(
    mapState,
    actionCreators
)(ProcessForm);

export default connectedProcessForm;
