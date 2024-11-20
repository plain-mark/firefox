# src/App.js
import React, { useState } from 'react';
import TodoList from './components/TodoList';

function App() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');

    const addTodo = (e) => {
        e.preventDefault();
        if (input.trim()) {
            setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
            setInput('');
        }
    };

    return (
        <div className="App">
            <h1>Todo App</h1>
            <form onSubmit={addTodo}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a todo"
                />
                <button type="submit">Add</button>
            </form>
            <TodoList todos={todos} setTodos={setTodos} />
        </div>
    );
}

export default App;