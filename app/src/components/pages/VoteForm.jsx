import React, { useState } from "react";
import { connect } from "react-redux";
import { contractActions } from "../../actions";

const VoteForm = ({ voteFor, voteAgainst, afterSubmit }) => {
    const [argumentId, setArgumentId] = useState("");
    const [voteStrength, setVoteStrength] = useState("");

    return (
        <section>
            <input
                type="number"
                placeholder="argumentId"
                value={argumentId}
                onChange={e => setArgumentId(e.target.value)}
            />
            <input
                type="number"
                placeholder="voteStrength(1-3)"
                value={voteStrength}
                onChange={e => setVoteStrength(e.target.value)}
            />
            <div>
                <button
                    onClick={async e => {
                        await voteFor(argumentId, voteStrength);
                        afterSubmit();
                    }}
                >
                    Vote For
                </button>
                <button
                    onClick={async e => {
                        await voteAgainst(argumentId, voteStrength);
                        afterSubmit();
                    }}
                >
                    Vote Against
                </button>
            </div>
        </section>
    );
};

function mapState(state) {
    return {};
}

const actionCreators = {
    voteFor: contractActions.voteFor,
    voteAgainst: contractActions.voteAgainst
};

const connectedVoteForm = connect(mapState, actionCreators)(VoteForm);

export default connectedVoteForm;
