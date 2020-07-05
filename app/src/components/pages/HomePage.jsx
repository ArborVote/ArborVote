import React from "react";
import { connect } from "react-redux";
import { web3Actions, contractActions } from "../../actions";
import ArgumentExplorer from "./ArgumentExplorer";
import StatusBar from "./StatusBar";
import "../../assets/scss/homePage.scss";

class HomePage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="homePage">
                <StatusBar />
                <div className="homePageInner">
                    <ArgumentExplorer />
                </div>
            </div>
        );
    }
}

function mapState(state) {
    return {};
}

const actionCreators = {};

const connectedHomePage = connect(mapState, actionCreators)(HomePage);
export default connectedHomePage;
