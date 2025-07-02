import React, { useEffect, useState } from 'react';
import EditTodo from './EditTodo';
import '../index.css';
import { db } from '../services/firebase.config.ts';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp, // Import Timestamp from firebase/firestore
} from 'firebase/firestore';

// Define an interface for the Task object
interface Task {
  id: string;
  task: string;
  isChecked: boolean;
  timestamp: Timestamp; // Use Firebase Timestamp type
}

const Todo = () => {
  const collectionRef = collection(db, 'tasks');

  // Use the Task interface for the task state
  const [task, setTask] = useState<Task[]>([]);
  // No longer need 'checked' if it's mirroring 'task'
  // const [checked, setChecked] = useState<Task[]>([]);
  const [createTask, setCreateTask] = useState<string>(''); // createTask is a string

  useEffect(() => {
    const getTasks = async () => {
      const queryForTimeStamp = query(collection(db, 'tasks'), orderBy('timestamp'));
      try {
        const querySnapshot = await getDocs(queryForTimeStamp);
        const taskData: Task[] = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as Task)); // Type assertion here
        setTask(taskData);
        // If 'checked' was used for something distinct, keep it. Otherwise, 'task' is sufficient.
        // setChecked(taskData);
      } catch (err: unknown) { // Catch error as 'unknown' for type safety
        if (err instanceof Error) {
          alert(err.message); // Access error message safely
        } else {
          alert('An unknown error occurred.');
        }
      }
    };
    getTasks();
  }, []);

  // Add Task Handler
  const submitTask = async (e: React.FormEvent) => { // Type for form event
    e.preventDefault();
    if (!createTask.trim()) { // Add basic validation
      alert('Task cannot be empty!');
      return;
    }
    try {
      await addDoc(collectionRef, {
        task: createTask,
        isChecked: false,
        timestamp: serverTimestamp(),
      });
      setCreateTask(''); // Clear the input field after submission
      window.location.reload();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unknown error occurred.');
      }
    }
  };

  const deleteTask = async (id: string) => { // id is a string
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const documentRef = doc(db, 'tasks', id);
        await deleteDoc(documentRef);
        window.location.reload();
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert('An unknown error occurred.');
        }
      }
    }
  };

  const checkBoxHandler = async (e: React.ChangeEvent<HTMLInputElement>) => { // Type for change event
    const taskId = e.target.name; // This is the task ID
    const isChecked = e.target.checked; // This is the new checked state

    // Optimistically update the UI
    setTask((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId ? { ...t, isChecked: isChecked } : t
      )
    );

    // Persisting the checkbox value
    try {
      const docRef = doc(db, 'tasks', taskId);
      await runTransaction(db, async (transaction) => {
        const todoDoc = await transaction.get(docRef);
        if (!todoDoc.exists()) {
          throw new Error("Document not found!"); // Throw an error for better handling
        }
        // const newValue = !todoDoc.data().isChecked; // No need to toggle, use current `isChecked` from event
        transaction.update(docRef, { isChecked: isChecked });
      });
      console.log('Transaction successfully committed!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log('Transaction failed: ', error.message);
        alert('Failed to update task status: ' + error.message);
      } else {
        console.log('Transaction failed: ', error);
        alert('Failed to update task status.');
      }
      // Revert UI if transaction fails
      setTask((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, isChecked: !isChecked } : t
        )
      );
    }
  };

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="card card-white">
              <div className="card-body">
                <button
                  data-bs-toggle="modal"
                  data-bs-target="#addModal"
                  type="button"
                  className="btn btn-info"
                >
                  Add Todo
                </button>
                {task.map(({ task: todoTask, id, isChecked, timestamp }) => ( // Renamed 'task' to 'todoTask' to avoid conflict with the prop name
                  <div className="todo-list" key={id}>
                    <div className="todo-item">
                      <hr />
                      <span className={`${isChecked === true ? 'done' : ''}`}>
                        <div className="checker">
                          <span className="">
                            <input
                              type="checkbox"
                              checked={isChecked} // Use 'checked' for controlled component
                              onChange={(e) => checkBoxHandler(e)}
                              name={id}
                            />
                          </span>
                        </div>
                        &nbsp; {todoTask}
                        <br />
                        <i>{new Date(timestamp.seconds * 1000).toLocaleString()}</i>
                      </span>
                      <span className=" float-end mx-3">
                        {/* Pass the task string to EditTodo */}
                        <EditTodo task={todoTask} id={id} />
                      </span>
                      <button
                        type="button"
                        className="btn btn-danger float-end"
                        onClick={() => deleteTask(id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="addModal"
        tabIndex={-1} // tabIndex should be a number
        aria-labelledby="addModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <form className="d-flex" onSubmit={submitTask}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addModalLabel">
                  Add Todo
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add a Task"
                  value={createTask} // Make the input a controlled component
                  onChange={(e) => setCreateTask(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Todo
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default Todo;