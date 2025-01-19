import pg from "pg";
//const { Pool } = pg;
import { ToDo } from "../types/ToDo"

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.parseInt(process.env.DB_PORT!),
});

const createToDo = async (todo: ToDo): Promise<number> => {
  const createResult = await pool.query(
    'INSERT INTO todos (title, description, status) VALUES ($1, $2, $3) RETURNING *',
    [todo.title, todo.description, todo.status]
  );
  return createResult.rowCount!;
}

const getAllToDos = async (): Promise<ToDo[]> => {
  const readResult = await pool.query<ToDo>('SELECT * FROM todos');
  return readResult.rows;
}

const updateToDo = async (todo: ToDo): Promise<ToDo> => {
  const updateResult = await pool.query<ToDo>(
    'UPDATE todos SET title = $1, description = $2, status=$3 WHERE id = $4 RETURNING *',
          [todo.title, todo.description, todo.status, todo.id]);
  return updateResult.rows[0];
}

const deleteToDo = async (todoId : number): Promise<number> => {
  const result = await pool.query('DELETE FROM todos WHERE id = $1', [todoId]);
  return result.rowCount!;
}

export { createToDo, getAllToDos, updateToDo, deleteToDo };
