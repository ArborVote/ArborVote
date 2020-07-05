import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMessage: ""
        };
    }
    static getDerivedStateFromError(error) {
        return { errorMessage: error.toString() };
    }
    componentDidCatch(error, info) {
        console.log(error.toString(), info.componentStack);
    }

    render() {
        if (this.state.errorMessage) {
            return <p>{this.state.errorMessage}</p>;
        }
        return this.props.children;
    }
}

export { ErrorBoundary };
