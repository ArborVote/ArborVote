import Web3 from 'web3';
import contract from 'truffle-contract';
import TodosContract from '../..//build/contracts/Todos.json';
import DebateContract from '../..//build/contracts/Debate.json';
export const WEB3_CONNECTED = 'WEB3_CONNECTED';
export const WEB3_DISCONNECTED = 'WEB3_DISCONNECTED';
export const TODOS_CONTRACT_INSTANTIATED = 'TODOS_CONTRACT_INSTANTIATED';
export const DEBATE_CONTRACT_INSTANTIATED = 'DEBATE_CONTRACT_INSTANTIATED'
export const TODOS_FETCHED = 'TODOS_FETCHED';
export const TODO_ADDED = 'TODO_ADDED';
export const DEBATE_CREATED = 'DEBATE_CREATED';

export const defaultState = {
  web3: null,
  todos: []
};

export function web3connect() {
  return (dispatch) => {
    const web3 = window.web3;

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      dispatch({
        type: WEB3_CONNECTED,
        payload: new Web3(web3.currentProvider)
      });
    } else {
      dispatch({
        type: WEB3_CONNECTED,
        payload: new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
      });
    }
  };
}

export function instantiateTodoContract() {
  return (dispatch, getState) => {
    const web3 = getState().web3;
    const todos = contract(TodosContract);
    todos.setProvider(web3.currentProvider);
    return todos.deployed().then((todosContract) => {
      dispatch({
        type: TODOS_CONTRACT_INSTANTIATED,
        payload: todosContract
      });
    });
  };
}

export function fetchTodos() {
  return (dispatch, getState) => {
    const state = getState();
    const web3 = state.web3;
    const todosContract = state.todosContract;
    todosContract.getTodos().then((todos) => {
      dispatch({
        type: TODOS_FETCHED,
        payload: todos.map((todo) => web3.toAscii(todo))
      });
    });
  };
}

  export function addTodo(payload) {
    return (dispatch, getState) => {
      const web3 = getState().web3;
      const todosContract = getState().todosContract;
      web3.eth.getAccounts((err, accounts) => {
        todosContract.addTodo(web3.fromAscii(payload), {
          from: accounts[0]
        }).then((results) => {
          dispatch({
            type: TODO_ADDED,
            payload
          });
        });
      });
    };    
}

export function instantiateDebateContract() {
  return (dispatch, getState) => {
    const web3 = getState().web3;
    const debate = contract(DebateContract);
    debate.setProvider(web3.currentProvider);
    return debate.deployed().then((DebateContract) => {
      dispatch({
        type: DEBATE_CONTRACT_INSTANTIATED,
        payload: DebateContract
      });
    });
  };
}

export function Debate(payload) {
  return (dispatch, getState) => {
    const web3 = getState().web3;
    const debateContract = getState().debateContract;
    web3.eth.getAccounts((err, accounts) => {
      debateContract.Debate(web3.fromAscii(payload), {
        from: accounts[0]
      }).then((results) => {
        dispatch({
          type: DEBATE_CREATED,
          payload
        });
      });
    });
  };
};