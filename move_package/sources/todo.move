module todo::todo {

    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};

    struct TodoAdmin has key,store {
        id: UID
    }

    struct TodoItem has key,store {
        id: UID,
        title : String,
        description : String,
        status:u8
    }

    fun init(ctx: &mut TxContext){
        let admin = TodoAdmin{
            id: object::new(ctx)
        };
        transfer::transfer(admin,tx_context::sender(ctx));
    }

    fun create_todo(title: vector<u8>, description: vector<u8>,ctx: &mut TxContext): TodoItem {
        TodoItem{
            id:object::new(ctx),
            title:string::utf8(title),
            description:string::utf8(description),
            status:0
        }
    }

    fun modify_status(todo:&mut TodoItem,status: u8){
        todo.status = status;
    }

    fun drop_todo(todo:TodoItem){
        let TodoItem {id,title:_,description:_,status:_} = todo;
        object::delete(id);
    }

    public entry fun create_todo_item(title: vector<u8>, description: vector<u8>,ctx: &mut TxContext) {
        let todo = create_todo(title,description,ctx);
        transfer::transfer(todo,tx_context::sender(ctx));
    }

    public entry fun change_todo_status(todo:&mut TodoItem, status: u8,_ctx: &mut TxContext){
        modify_status(todo,status);
    }

    public entry fun delete_todo_item(todo: TodoItem,_ctx: &mut TxContext){
        drop_todo(todo);
    }

}