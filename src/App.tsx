import { useEffect, useState } from "react";
import "./App.css";

import { Amplify, DataStore, Predicates } from "aws-amplify";
import { Todo } from "./models";

import awsconfig from "./aws-exports";
import DataStoreOperations from "./Components/DataStoreOperations";
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

  function deleteAll() {
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
      DataStore.start();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>Basic Amplify DataStore Demo</h1>
          <DataStoreOperations deleteAll={deleteAll} />
          <button onClick={getTodos}>Query</button>
          <input type="button" value="NEW" onClick={onCreate} />
          <pre>todos: {JSON.stringify(todos, null, 2)}</pre>
        </div>
      </header>
    </div>
  );
}

export default App;
