import { useWallet } from "@suiet/wallet-kit";
import { useEffect, useState } from "react";
import React from "react";
import Link from 'next/link';
import { JsonRpcProvider, SuiPackage } from '@mysten/sui.js';
import { SUI_PACKAGE, SUI_MODULE } from "../config/constants";
import * as tweetnacl from 'tweetnacl';
import { toHEX } from '@mysten/bcs';


type SwordListPros = { swords: Array<any>, transfer: Function };
const SwordList = ({ swords, transfer }: SwordListPros) => {
  return swords && (
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
                swords.map((item, i) =>
                  <tr>
                    <th>{item.id}</th>
                    <td>{item.title}</td>
                    <td>{item.description} </td>
                    <td>{item.status} </td>
                    <td>
                      <a href="javascript:;" className="link link-hover link-primary" onClick={() => { transfer(item.id) }}>Transfer</a>
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
    name: string;
    url: string;
    description: string;
  }>({
    name: "",
    url: "",
    description: "",
  });
  const [message, setMessage] = useState('');
  const [tx, setTx] = useState('');
  const [swords, setSword] = useState<Array<any>>([]);
  const [displayModal, toggleDisplay] = useState(false);
  const [recipient, updateRecipient] = useState("");
  const [transfer_id, setTransferId] = useState("");

  async function mint_example_nft() {
    setMessage("");
    try {
      const data = create_example_nft()
      const resData = await signAndExecuteTransaction({
        transaction: {
          kind: 'moveCall',
          data,
        },
      });
      console.log('success', resData);
      setMessage('Mint succeeded');
      if (resData && resData.certificate && resData.certificate.transactionDigest) {
        setTx('https://explorer.sui.io/transaction/' + resData.certificate.transactionDigest)
      }
    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTx('');
    }
  }

  function create_todo() {
    const { name, url, description } = formInput;
    return {
      packageObjectId: SUI_PACKAGE,
      module: 'todo',
      function: 'mint',
      typeArguments: [],
      arguments: [
        name,
        description,
        url,
      ],
      gasBudget: 30000,
    };
  }

  async function doTransfer() {
    function makeTranscaction() {
      return {
        packageObjectId: SUI_PACKAGE,
        module: SUI_MODULE,
        function: 'sword_transfer',
        typeArguments: [],
        // 类型错误，传递字符串类型，部分钱包会内部转化
        arguments: [
          transfer_id,
          recipient,
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
      setMessage('Mint succeeded');
      if (resData && resData.certificate && resData.certificate.transactionDigest) {
        setTx('https://explorer.sui.io/transaction/' + resData.certificate.transactionDigest)
      }
    } catch (e) {
      console.error('failed', e);
      setMessage('Mint failed: ' + e);
      setTx('');
    }
  }

  async function transferSword(id: string) {
    setTransferId(id);
    toggleDisplay(true);
  }

  async function fetch_sword() {
    const objects = await provider.getObjectsOwnedByAddress(account!.address)
    const todoIds = objects
      .filter(item => item.type === SUI_PACKAGE + "::" + SUI_MODULE + "::TodoItem")
      .map(item => item.objectId)
    const swordObjects = await provider.getObjectBatch(todoIds)
    const todoList = swordObjects.map((item: any) => {
      console.log(item);
      return {
        id: item.details.data.fields.id.id,
        title: item.details.data.fields.title,
        description: item.details.data.fields.description,
        status: item.details.data.fields.status
      }
    })
    setSword(todoList)
  }

  useEffect(() => {
    (async () => {
      if (connected) {
        fetch_sword()
      }
    })()
  }, [connected, tx])


  return (
    <div>
      <div className={displayModal ? "modal modal-bottom sm:modal-middle modal-open" : "modal modal-bottom sm:modal-middle"}>
        <div className="modal-box">
          <label onClick={() => { toggleDisplay(false) }} className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
          <h3 className="font-bold text-lg">Input recent address</h3>
          <input
            placeholder="Recipient"
            className="mt-8 p-4 input input-bordered input-primary w-full"
            value={recipient}
            onChange={(e) =>
              updateRecipient(e.target.value)
            }
          />
          <div className="modal-action">
            <label htmlFor="my-modal-6" className="btn" onClick={() => {
              toggleDisplay(!displayModal);
              doTransfer();
            }}>Done!</label>
          </div>
        </div>
      </div>

      <div className="card lg:card-side bg-base-100 shadow-xl mt-5">
        <div className="card-body">
          <h2 className="card-title">Add Todo Item:</h2>
          <input
            placeholder="NFT Name"
            className="mt-4 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <input
            placeholder="NFT Description"
            className="mt-8 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
          <input
            placeholder="NFT IMAGE URL"
            className="mt-8 p-4 input input-bordered input-primary w-full"
            onChange={(e) =>
              updateFormInput({ ...formInput, url: e.target.value })
            }
          />
          <p className="mt-4">{message}{message && <Link href={tx}>, View transaction</Link>}</p>
          <div className="card-actions justify-end">
            <button
              onClick={mint_example_nft}
              className={
                "btn btn-primary btn-xl"
              }>
              Add Todo
            </button>
          </div>
        </div>
      </div>

      <SwordList swords={swords} transfer={transferSword} />
    </div >
  );
}
