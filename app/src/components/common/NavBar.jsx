import React from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import loading from "../../assets/img/loading.gif";
import "../../assets/scss/navBar.scss";

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pathname: this.props.location.pathname
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.location.pathname !== state.pathname) {
            return {
                pathname: props.location.pathname
            };
        }
        return null;
    }

    render() {
        const { inProgress, account } = this.props;
        return (
            <div className="navBarContainer">
                <img
                    className="loading"
                    src={loading}
                    style={inProgress ? { opacity: 1 } : { opacity: 0 }}
                />
                <div className="navBarLogo">🌳 ArborVote 🗳</div>
                <div className="navBarAddress">
                    {account !== undefined
                        ? "Logged in as " + account
                        : "Metamask not connected"}
                </div>
            </div>
        );
    }
}
function mapState(state) {
    const { account } = state.web3;
    const inProgress =
        state.contract.inProgress ||
        state.web3.inProgress;
    return { inProgress, account };
}

const actionCreators = {};

const connectedNavBar = withRouter(connect(mapState, actionCreators)(NavBar));
export { connectedNavBar as NavBar };
