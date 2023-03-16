import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import React from "react";
import Link from 'next/link';
import { JsonRpcProvider } from '@mysten/sui.js';
import { SUI_PACKAGE, SUI_MODULE } from "../config/constants";

type NumberMap<T> = {
  [key: number]: T;
};
const allStatus: NumberMap<string> = {
  0: "doing",
  1: "done"
}

type TodoListPros = { todos: Array<any>, done: Function, remove: Function };
const TodoList = ({ todos, done, remove }: TodoListPros) => {
  return todos && (
    <div className="card lg:card-side bg-base-100 shadow-xl mt-5">
      <div className="card-body">
        <h2 className="card-title">todo list:</h2>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Id</th>
                <th>title</th>
                <th>description</th>
                <th>status</th>
                <th>-</th>
              </tr>
            </thead>
            <tbody>

              {
                todos.map((item, i) =>
                  <tr>
                    <th>{item.id}</th>
                    <td>{item.title}</td>
                    <td>{item.description} </td>
                    <td>{allStatus[item.status]} </td>
                    <td>
                      <a href="javascript:;" className="link link-hover link-primary" onClick={() => { done(item.id) }}>Done</a>
                      <a href="javascript:;" className="link link-hover link-primary ml-3" onClick={() => { remove(item.id) }}>Remove</a>
                    </td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const provider = new JsonRpcProvider();
  const { account, connected, signAndExecuteTransaction } = useWallet();
  const [formInput, updateFormInput] = useState<{
    title: string;
    description: string;
  }>({
    title: "",
    description: "",
  });
  const [message, setMessage] = useState('');
  const [tx, setTx] = useState('');
  const [todos, setTodos] = useState<Array<any>>([]);
  const [displayModal, toggleDisplay] = useState(false);
  const [recipient, updateRecipient] = useState("");
  const [todo_id, setTodoId] = useState("");

  async function create_new_todo_action() {
    setMessage("");
    try {
      const data = create_todo_data()
      const resData = await signAndExecuteTransaction({
        transaction: {
          kind: 'moveCall',
          data,
        },
      });
      updateFormInput({ title: "", description: "" })
      console.log('success', resData);
      setMessage('Added succeeded');
      if (resData && resData.certificate && resData.certificate.transactionDigest) {
        setTx('https://explorer.sui.io/transaction/' + resData.certificate.transactionDigest)
      }
    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTx('');
    }
  }

  function create_todo_data() {
    const { title, description } = formInput;
    return {
      packageObjectId: SUI_PACKAGE,
      module: 'todo',
      function: 'create_todo_item',
      typeArguments: [],
      arguments: [
        title,
        description,
      ],
      gasBudget: 30000,
    };
  }

  async function doStatusChange(status: string) {
    function makeTranscaction() {
      return {
        packageObjectId: SUI_PACKAGE,
        module: SUI_MODULE,
        function: 'change_todo_status',
        typeArguments: [],
        // 类型错误，传递字符串类型，部分钱包会内部转化
        arguments: [
          todo_id,
          status
        ],
        gasBudget: 30000,
      };
    }

    setMessage("");
    try {
      const data = makeTranscaction();
      const resData = await signAndExecuteTransaction({
        transaction: {
          kind: 'moveCall',
          data,
        },
      });
      console.log('success', resData);
      setMessage('Status changed');
      if (resData && resData.certificate && resData.certificate.transactionDigest) {
        setTx('https://explorer.sui.io/transaction/' + resData.certificate.transactionDigest)
      }
    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTx('');
    }
  }

  async function done_action(id: string) {
    setTodoId(id);
    toggleDisplay(true);
  }

  async function remove_action(todo_id: string) {
    function makeTranscaction() {
      return {
        packageObjectId: SUI_PACKAGE,
        module: SUI_MODULE,
        function: 'delete_todo_item',
        typeArguments: [],
        // 类型错误，传递字符串类型，部分钱包会内部转化
        arguments: [
          todo_id,
        ],
        gasBudget: 30000,
      };
    }

    setMessage("");
    try {
      const data = makeTranscaction();
      const resData = await signAndExecuteTransaction({
        transaction: {
          kind: 'moveCall',
          data,
        },
      });
      console.log('success', resData);
      setMessage('Todo Removed.');
      if (resData && resData.certificate && resData.certificate.transactionDigest) {
        setTx('https://explorer.sui.io/transaction/' + resData.certificate.transactionDigest)
      }
    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTx('');
    }
  }

  async function fetch_todos() {
    const objects = await provider.getObjectsOwnedByAddress(account!.address)
    const todoIds = objects
      .filter(item => item.type === SUI_PACKAGE + "::" + SUI_MODULE + "::TodoItem")
      .map(item => item.objectId)
    const swordObjects = await provider.getObjectBatch(todoIds)
    const todoList = swordObjects.map((item: any) => {
      return {
        id: item.details.data.fields.id.id,
        title: item.details.data.fields.title,
        description: item.details.data.fields.description,
        status: item.details.data.fields.status,
        statusText: ""
      }
    })
    setTodos(todoList)
  }

  useEffect(() => {
    (async () => {
      if (connected) {
        fetch_todos()
      }
    })()
  }, [connected, tx])


  return (
    <div>
      <div className={displayModal ? "modal modal-bottom sm:modal-middle modal-open" : "modal modal-bottom sm:modal-middle"}>
        <div className="modal-box">
          <label onClick={() => { toggleDisplay(false) }} className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>

          <div className="modal-action">
            <label htmlFor="my-modal-6" className="btn" onClick={() => {
              toggleDisplay(!displayModal);
              doStatusChange("1");
            }}>Done!</label>
          </div>
        </div>
      </div>

      <div className="card lg:card-side bg-base-100 shadow-xl mt-5">
        <div className="card-body">
          <h2 className="card-title">Add Todo Item:</h2>
          <input
            placeholder="title"
            className="mt-4 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, title: e.target.value })
            }
          />
          <input
            placeholder="description"
            className="mt-8 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
          <p className="mt-4">{message}{message && <Link href={tx}>, View transaction</Link>}</p>
          <div className="card-actions justify-end">
            <button
              onClick={create_new_todo_action}
              className={
                "btn btn-primary btn-xl"
              }>
              Add Todo
            </button>
          </div>
        </div>
      </div>

      <TodoList todos={todos} done={done_action} remove={remove_action} />
    </div >
  );
}
