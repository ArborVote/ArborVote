import { WEB3_CONNECTED, TODO_ADDED, TODOS_CONTRACT_INSTANTIATED, TODOS_FETCHED, defaultState } from '../actions';

const todos = (state = defaultState, action) => {
  switch (action.type) {
  case WEB3_CONNECTED:
    return {
      ...state,
      web3: action.payload
    };
  case TODOS_CONTRACT_INSTANTIATED:
    return {
      ...state,
      todosContract: action.payload
    };
  case TODOS_FETCHED:
    return {
      ...state,
      todos: action.payload
    };
  case TODO_ADDED:
    return {
      ...state,
      todos: [
        ...state.todos,
        action.payload
      ]
    };
  default:
    return state
  }
};

export default todos;