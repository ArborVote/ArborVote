import React, { Component } from 'react'
import { connect } from 'react-redux'
import contract from 'truffle-contract'
import {web3connect, fetchTodos, addTodo, instantiateTodoContract} from './actions';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      textarea: ''
    }
    this.renderTodos.bind(this);
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See actions/index.js => web3connect for more info.
    window.addEventListener('load', () => {
      this.props.web3connect();
      this.props.instantiateTodoContract().then(() => {
        this.props.fetchTodos();
      });
    });
  }

  handleTextAreaChange(event) {
    this.setState({
      textarea: event.target.value
    });
  }
  renderTodos(todos) {
    return todos.map((todo, i) => {
      return (
        <li key={i}>{todo}</li>
      );
    })
  }
  addTodo() {
    this.props.addTodo(this.state.textarea);
  }

  render() {
    if (!this.props.web3) {
      return (
        <div> Loading web3 </div>
      );
    }
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Todos</h1>
              <textarea id="textarea" value={this.state.textarea} onChange={this.handleTextAreaChange.bind(this)} />
              <button onClick={this.addTodo.bind(this)}>Add Todo</button>
              <ul>
                {this.renderTodos(this.props.todos)}
              </ul>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

const mapDispatchToProps = {
  web3connect,
  instantiateTodoContract,
  fetchTodos,
  addTodo
};

const mapStateToProps = (state) => ({
  web3: state.web3,
  todos: state.todos
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
