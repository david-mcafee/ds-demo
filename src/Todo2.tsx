import React, { useEffect, useState } from "react";
import "./App.css";

import { Amplify, DataStore, Predicates, SortDirection } from "aws-amplify";
import { Todo2 } from "./models";

import awsconfig from "./aws-exports";
import DataStoreOperations from "./Components/DataStoreOperations";
Amplify.configure(awsconfig);

// Amplify.Logger.LOG_LEVEL = "DEBUG";

function Todo22() {
  const [todo2s, setTodo2s] = useState([]);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    const subscription = DataStore.observe(Todo2).subscribe(() => {
      getTodo2s();
      DataStore.start();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = DataStore.observeQuery(
      Todo2,
      (q) =>
        q.or((q) => [
          q.name.contains("should not match this"),
          q.description.contains("updated"),
        ]),
      {
        sort: (q) => q.createdAt(SortDirection.DESCENDING),
      }
    ).subscribe((snapshot) => {
      const { items } = snapshot;
      console.log("snapshot", snapshot);
      //@ts-ignore
      setSnapshots((prev) => [...prev, ...items]);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function onCreate() {
    await DataStore.save(
      new Todo2({
        name: [`name ${Date.now()}`],
        description: [`description ${Date.now()}`],
      })
    );
  }

  async function updateLastTodo2() {
    const [todo2] = await DataStore.query(Todo2);
    // setSnapshots((prev) => [...prev, ...items]);
    await DataStore.save(
      Todo2.copyOf(todo2, (updated) => {
        updated.description = [...(todo2.description as any), "updated"];
      })
    );
  }

  function deleteAll() {
    DataStore.delete(Todo2, Predicates.ALL);
  }

  async function getTodo2s() {
    const _todo2s = await DataStore.query(Todo2);
    //@ts-ignore
    setTodo2s(_todo2s);
    console.log("Todo2s", _todo2s);
  }

  function clearLocalState() {
    setTodo2s([]);
    setSnapshots([]);
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>Basic Amplify DataStore Demo</h1>
          <DataStoreOperations deleteAll={deleteAll} />
          <hr />
          <h2>Todo2 operations:</h2>
          <button onClick={getTodo2s}>Query</button>
          <button onClick={onCreate}>NEW</button>
          <button onClick={updateLastTodo2}>UPDATE</button>
          <button onClick={clearLocalState}>Clear Local State</button>
          <pre>todo2s: {JSON.stringify(todo2s, null, 2)}</pre>
          <h3>Only returns snapshots for matching updates:</h3>
          <pre>observeQuery: {JSON.stringify(snapshots, null, 2)}</pre>
        </div>
      </header>
    </div>
  );
}

export default Todo22;
