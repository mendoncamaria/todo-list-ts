import React, { useState } from 'react';
import '../index.css';
import { db } from '../services/firebase.config'; // Ensure this path is correct for your .ts file
import { doc, updateDoc } from 'firebase/firestore'; // Changed from '@firebase/firestore' to 'firebase/firestore'

// Define an interface for the component's props
interface EditTodoProps {
  task: string; // The initial task string
  id: string;   // The document ID
}

const EditTodo: React.FC<EditTodoProps> = ({ task, id }) => {
  // Initialize updatedTask with the prop 'task' directly, as it's a string.
  // The original was `useState([task])` which made it an array containing the task string.
  const [updatedTask, setUpdatedTask] = useState<string>(task);

  const updateTask = async (e: React.MouseEvent<HTMLButtonElement>) => { // Type for mouse event on button
    e.preventDefault();
    if (!updatedTask.trim()) { // Add basic validation
      alert('Task cannot be empty!');
      return;
    }
    try {
      const taskDocument = doc(db, 'tasks', id);
      await updateDoc(taskDocument, {
        task: updatedTask,
        // isChecked: false, // If you intend to preserve the existing isChecked status, you might want to fetch it first or omit updating it here.
                          // Otherwise, this will reset it to false every time the task is updated.
                          // For now, I'll keep it as in your original code, but note the potential implication.
        isChecked: false,
      });
      window.location.reload();
    } catch (err) {
      let errorMessage = 'Failed to update task.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target={`#id${id}`}
      >
        Edit Todo
      </button>

      <div
        className="modal fade"
        id={`id${id}`}
        tabIndex={-1} // tabIndex should be a number
        aria-labelledby="editLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editLabel">
                Update Todo Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form> {/* Removed d-flex if it's not strictly needed for form layout */}
                <input
                  type="text"
                  className="form-control"
                  // Use 'value' for a controlled component instead of 'defaultValue'
                  // 'defaultValue' is for uncontrolled components, which are less common with useState
                  value={updatedTask}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUpdatedTask(e.target.value)}
                />
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={updateTask}
              >
                Update Todo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTodo;