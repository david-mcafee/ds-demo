import { useEffect, useState } from "react";
import "./App.css";

import Amplify, { DataStore, Predicates } from "aws-amplify";
import { Todo } from "./models";

import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

Amplify.Logger.LOG_LEVEL = "DEBUG";

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

  async function getTodos() {
    const _todos = await DataStore.query(Todo);
    //@ts-ignore
    setTodos(_todos);
    console.log("Todos", _todos);
  }

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
