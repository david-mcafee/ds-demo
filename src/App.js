import React, { useEffect, useState } from "react";
import "./App.css";

import { Amplify, API, DataStore, Predicates } from "aws-amplify";
import { Todo } from "./models";
import * as queries from "./graphql/queries";

//Use next two lines only if syncing with the cloud
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

// Amplify.Logger.LOG_LEVEL = "DEBUG";

function App() {
  const [todos, setTodos] = useState([]);

  function onCreate() {
    DataStore.save(
      new Todo({
        name: `name ${Date.now()}`,
      })
    );
  }

  function onDeleteAll() {
    DataStore.delete(Todo, Predicates.ALL);
  }

  // async function onQuery() {
  //   const todos = await DataStore.query(Todo, Predicates.ALL);

  //   console.log(todos);
  // }

  async function getTodos() {
    const _todos = await DataStore.query(Todo);
    setTodos(_todos);
    console.log("Todos", _todos);
    const allRecords = await API.graphql({ query: queries.listTodos });
    console.log("everything in the table:", allRecords);
  }

  // Update
  async function updateTodo() {
    const [originalTodo] = await DataStore.query(Todo);
    console.log("Original Todo:", originalTodo);

    try {
      const todo = await DataStore.save(
        Todo.copyOf(originalTodo, (updated) => {
          updated.id = `name ${Date.now()}`;
        })
      );

      console.log("Todo updated:", todo);
    } catch (error) {
      console.error("Save failed:", error);
    }
  }

  // console.log(msg.model, msg.opType, msg.element);
  useEffect(() => {
    const subscription = DataStore.observe(Todo).subscribe(() => {
      getTodos();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <button onClick={getTodos}>Query</button>
          <input type="button" value="NEW" onClick={onCreate} />
          <input type="button" value="UPDATE" onClick={updateTodo} />
          <input type="button" value="DELETE ALL" onClick={onDeleteAll} />
          <button onClick={() => DataStore.start()}>Start</button>
          <button onClick={() => DataStore.stop()}>Stop</button>
          <button onClick={() => DataStore.clear()}>Clear</button>
          <pre>todos: {JSON.stringify(todos, null, 2)}</pre>
        </div>
      </header>
    </div>
  );
}

export default App;
