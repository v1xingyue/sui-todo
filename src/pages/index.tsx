import React, { useEffect, useState } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { JsonRpcProvider, TransactionBlock, devnetConnection, testnetConnection, Connection } from '@mysten/sui.js';
import { SUI_PACKAGE, SUI_MODULE, NETWORK } from "../config/constants";
import Head from 'next/head';
import { TodoList } from "../components/TodoList";

function Home() {
  let connection = devnetConnection;
  if (NETWORK == "testnet") {
    connection = testnetConnection;
  }
  if (NETWORK == "mainnet") {
    connection = new Connection({
      fullnode: "https://fullnode.mainnet.sui.io:443/",
      faucet: "",
    });
  }
  const provider = new JsonRpcProvider(connection);
  const { account, connected, signAndExecuteTransactionBlock } = useWallet();
  const [todoLoading, updateTodoLoading] = useState(true);
  const [formInput, updateFormInput] = useState<{
    title: string;
    description: string;
  }>({
    title: "",
    description: "",
  });
  const [message, setMessage] = useState('');
  const [transaction, setTransaction] = useState('');
  const [todos, setTodos] = useState<Array<any>>([]);
  const [displayModal, toggleDisplay] = useState(false);
  const [todo_id, setTodoId] = useState("");

  async function create_new_todo_action() {
    const { title, description } = formInput;
    setMessage("");
    try {
      const tx = new TransactionBlock()

      tx.moveCall({
        target: SUI_PACKAGE + "::todo::create_todo_item" as any,
        arguments: [
          tx.pure(title),
          tx.pure(description)
        ]
      })

      const resData = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      updateFormInput({ title: "", description: "" })
      console.log('success', resData);
      setMessage('Added succeeded');
      if (resData && resData.digest && resData.digest) {
        setTransaction('https://explorer.sui.io/transaction/' + resData.digest + "?network=" + NETWORK);
      }


    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTransaction('');
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
    function make_status_change() {
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
      const tx = new TransactionBlock()
      tx.moveCall({
        target: SUI_PACKAGE + "::todo::change_todo_status" as any,
        arguments: [
          tx.pure(todo_id),
          tx.pure(status)
        ]
      })

      const resData = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      console.log('success', resData);
      setMessage('Status changed');
      if (resData && resData.digest && resData.digest) {
        setTransaction('https://explorer.sui.io/transaction/' + resData.digest + "?network=" + NETWORK);
      }
    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTransaction('');
    }
  }

  async function done_action(id: string) {
    setTodoId(id);
    toggleDisplay(true);
  }

  async function remove_action(todo_id: string) {
    setMessage("");
    try {
      const tx = new TransactionBlock()
      tx.moveCall({
        target: SUI_PACKAGE + "::todo::delete_todo_item" as any,
        arguments: [
          tx.pure(todo_id)
        ]
      })

      const resData = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      console.log('success', resData);
      setMessage('Todo Removed.');
      if (resData && resData.digest && resData.digest) {
        setTransaction('https://explorer.sui.io/transaction/' + resData.digest + "?network=" + NETWORK);
      }
    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTransaction('');
    }
  }

  async function fetch_todos() {
    console.log("loading todos");
    updateTodoLoading(true);
    const todoItemType = SUI_PACKAGE + "::" + SUI_MODULE + "::TodoItem"
    if (account != null) {
      const objects = await provider.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: todoItemType
        },
        options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        }
      })
      if (objects.data && objects.data.length > 0) {
        let todolist = objects.data.map(item => {
          const { objectId } = item.data as any;
          let content = item.data?.content as any;
          let { title, description, status } = content.fields as any;
          return {
            title,
            description,
            status,
            id: objectId
          }
        })
        setTodos(todolist);
      } else {
        console.log("no objects found");
      }
    }
    updateTodoLoading(false);
  }

  useEffect(() => {
    (async () => {
      if (connected) {
        await fetch_todos()
      }
    })()
  }, [connected, transaction])


  return (
    <div>
      <Head>
        <title>Sui Todo List</title>
      </Head>
      <div className={displayModal ? "modal modal-bottom sm:modal-middle modal-open" : "modal modal-bottom sm:modal-middle"}>
        <div className="modal-box">
          <label onClick={() => { toggleDisplay(false) }} className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
          <h3 className="font-bold text-lg">You will change this todo status!</h3>
          <div className="modal-action">
            <label htmlFor="my-modal-6" className="btn" onClick={() => {
              toggleDisplay(!displayModal);
              doStatusChange("1");
            }}>Yes, It's done!! 📒 </label>
          </div>
        </div>
      </div>

      <div className="card lg:card-side bg-base-100 shadow-xl mt-3">
        <div className="card-body">
          {
            message && (
              <div className="alert alert-info shadow-lg">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>{message}!</span>
                  <a className="link link-warning" href={transaction} target="_blank"> View transaction</a>
                </div>
              </div>
            )
          }
          <h2 className="card-title">Add Todo Item:</h2>
          <input
            placeholder="title"
            value={formInput.title}
            className="mt-4 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, title: e.target.value })
            }
          />
          <input
            placeholder="description"
            value={formInput.description}
            className="mt-8 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
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

      <TodoList todos={todos} done={done_action} remove={remove_action} loading={todoLoading} />
    </div >
  );
}

export default Home;