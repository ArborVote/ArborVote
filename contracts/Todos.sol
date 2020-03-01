pragma solidity >=0.4.22 <0.7.0;

contract Todos {
    bytes32[] todos;


    function addTodo(bytes32 todo) public {
        todos.push(todo);
    }

    function getTodos() public view returns (bytes32[] memory) {
        return todos;
    }
}
