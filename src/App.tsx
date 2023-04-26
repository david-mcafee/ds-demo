import { useEffect, useState } from "react";
import "./App.css";

import { Amplify, DataStore, Predicates, SortDirection } from "aws-amplify";
// import { initSchema } from "@aws-amplify/datastore";
// import { schema } from "./models/schema";
import { Todo } from "./models";

import awsconfig from "./aws-exports";
import DataStoreOperations from "./Components/DataStoreOperations";
Amplify.configure(awsconfig);

// Amplify.Logger.LOG_LEVEL = "DEBUG";

function App() {
  const [todos, setTodos] = useState([]);
  // const [snapshots, setSnapshots] = useState([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const subscription = DataStore.observe(Todo).subscribe((msg) => {
      console.log(msg);
      const { opType, element } = msg;
      //@ts-ignore
      console.log("Version:", element._version);
      if (opType === "UPDATE") {
        //@ts-ignore
        setTodos([element]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // useEffect(() => {
  //   const subscription = DataStore.observeQuery(
  //     Todo,
  //     (q) =>
  //       q.or((q) => [
  //         q.name.contains("should not match this"),
  //         q.description.contains("updated"),
  //       ]),
  //     {
  //       sort: (q) => q.createdAt(SortDirection.DESCENDING),
  //     }
  //   ).subscribe((snapshot) => {
  //     const { items } = snapshot;
  //     console.log("snapshot", snapshot);
  //     //@ts-ignore
  //     setSnapshots((prev) => [...prev, ...items]);
  //   });
  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);

  async function onCreate() {
    return await DataStore.save(
      new Todo({
        name: `name ${Date.now()}`,
        description: `description ${Date.now()}`,
      })
    );
  }

  async function updateLastTodo() {
    const [_todo] = await DataStore.query(Todo);
    setCounter((prev) => prev + 1);
    await DataStore.save(
      Todo.copyOf(_todo, (updated) => {
        updated.description = `updated ${counter}`;
      })
    );
  }

  async function updateManyTimes() {
    const original = await onCreate();

    for (let i = 0; i < 100; i++) {
      const retrieved = await DataStore.query(Todo, original.id);

      await DataStore.save(
        //@ts-ignore
        Todo.copyOf(retrieved, (updated) => {
          updated.description = `updated ${i}`;
        })
      );
    }

    const final = await DataStore.query(Todo, original.id);
    //@ts-ignore
    setTodos([final]);
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

  // async function initSchemaTest() {
  //   const models = initSchema(schema);
  //   const selectedModel = Object.keys(models)[0];
  //   const test = models[selectedModel];
  //   await DataStore.clear();
  //   await DataStore.start();
  //   //@ts-ignore
  //   DataStore.observeQuery(test).subscribe((snapshot) => {
  //     console.log("snapshot", snapshot);
  //   });
  // }

  function clearLocalState() {
    setTodos([]);
    // setSnapshots([]);
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>Basic Amplify DataStore Demo</h1>
          <DataStoreOperations deleteAll={deleteAll} />
          <hr />
          <h2>Todo operations:</h2>
          <button onClick={getTodos}>Query</button>
          <button onClick={onCreate}>NEW</button>
          <button onClick={updateManyTimes}>
            Update one record many times
          </button>
          <button onClick={updateLastTodo}>UPDATE</button>
          <button onClick={clearLocalState}>Clear Local State</button>
          {/* <button onClick={initSchemaTest}>Init schema</button> */}
          <pre>todos: {JSON.stringify(todos, null, 2)}</pre>
          {/* <h3>Only returns snapshots for matching updates:</h3> */}
          {/* <pre>observeQuery: {JSON.stringify(snapshots, null, 2)}</pre> */}
        </div>
      </header>
    </div>
  );
}

export default App;
