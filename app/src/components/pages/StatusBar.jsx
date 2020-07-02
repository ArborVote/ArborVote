import React from "react";
import { connect } from "react-redux";
import { web3Actions, contractActions } from "../../actions";
import ArgumentTree from "./ArgumentTree";
import AddArgumentForm from "./AddArgumentForm";
import VoteForm from "./VoteForm";
import ProcessForm from "./ProcessForm";

const getStageString = num => {
    switch (num) {
        case 0:
            return "INIT";
        case 1:
            return "CREATION";
        case 2:
            return "VOTING";
        case 3:
            return "PROCESS";
        default:
            return "";
    }
};

const getRemainingTime = startTime => {
    const now = new Date();
    const tenMin = 10 * 60 * 1000;
    const endTime = new Date(startTime * 1000 + tenMin);
    const diffMillis = endTime - now;
    const diffMins = Math.round(((diffMillis % 86400000) % 3600000) / 60000);
    return diffMins + " min";
};

class StatusBar extends React.Component {
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
    }

    async componentDidMount() {
        await this.props.loadWeb3();
        await this.refresh();
    }

    async refresh() {
        await this.props.getVoter(this.props.account);
        await this.props.getArgumentsCount();
        await this.props.getStage();
        await this.props.getStartTime();
        await this.props.getAllArguments();
    }

    render() {
        const { totalArguments, stage, voter, startTime } = this.props.data;
        return (
            <div className="statusBar">
                {voter && (
                    <section>
                        <p>{`Remaining Tokens: ${voter.voteTokens}`}</p>
                        <p>{`Joined: ${voter.joined}`}</p>
                        {!voter.joined && (
                            <button
                                onClick={async () => {
                                    await this.props.join();
                                    this.refresh();
                                }}
                            >
                                Join
                            </button>
                        )}
                    </section>
                )}
                {voter && voter.joined && (
                    <>
                        <section>
                            <p>
                                {totalArguments &&
                                    `Total arguments: ${totalArguments}`}
                            </p>
                            <p>
                                {stage &&
                                    `Current stage: ${getStageString(stage)}`}
                            </p>
                            <p>
                                {startTime && stage < 3 && 
                                    `Remaining time: ${getRemainingTime(
                                        startTime
                                    )}`}
                            </p>
                            {(stage === 1 || stage === 2) && (
                                <button
                                    onClick={async () => {
                                        await this.props.advanceStage();
                                        this.refresh();
                                    }}
                                >
                                    Advance Stage
                                </button>
                            )}
                        </section>
                        {stage === 1 && (
                            <AddArgumentForm afterSubmit={this.refresh} />
                        )}
                        {stage === 2 && <VoteForm afterSubmit={this.refresh} />}
                        {stage === 3 && (
                            <ProcessForm afterSubmit={this.refresh} />
                        )}
                    </>
                )}
            </div>
        );
    }
}

function mapState(state) {
    const { account } = state.web3;
    const { data } = state.contract;
    return { data, account };
}

const actionCreators = {
    loadWeb3: web3Actions.loadWeb3,
    join: contractActions.join,
    advanceStage: contractActions.advanceStage,
    getArgumentsCount: contractActions.getArgumentsCount,
    getStartTime: contractActions.getStartTime,
    getStage: contractActions.getStage,
    getVoter: contractActions.getVoter,
    getAllArguments: contractActions.getAllArguments
};

const connectedStatusBar = connect(mapState, actionCreators)(StatusBar);
export default connectedStatusBar;
