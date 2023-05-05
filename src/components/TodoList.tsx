type NumberMap<T> = {
    [key: number]: T;
};

const allStatus: NumberMap<string> = {
    0: "doing",
    1: "done"
}

type TodoListPros = { todos: Array<any>, done: Function, remove: Function, loading: Boolean };

export function TodoList({ todos, done, remove, loading }: TodoListPros) {
    return todos && (
        <div className="card lg:card-side bg-base-100 shadow-xl mt-5">
            <div className="card-body">
                <h2 className="card-title">todo list : {loading && "loading..."}</h2>

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
                                todos.map((item) =>
                                    <tr key={item.id}>
                                        <th>{item.id}</th>
                                        <td>{item.title}</td>
                                        <td>{item.description} </td>
                                        <td>{allStatus[item.status]} </td>
                                        <td>
                                            <a className="link link-hover link-primary" onClick={() => { done(item.id) }}>Done</a>
                                            <a className="link link-hover link-primary ml-3" onClick={() => { remove(item.id) }}>Remove</a>
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
