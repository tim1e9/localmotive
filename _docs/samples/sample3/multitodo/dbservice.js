import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export const createToDo = async (title, description) => {
  const createResult = await pool.query(
    'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
    [title, description]
  );
  return createResult.rows[0];
};

export const getAllToDos = async () => {
  const readResult = await pool.query('SELECT * FROM todos');
  return readResult.rows;
};

export const updateToDo = async (updatedTitle, updatedDescription) => {
  const updateResult = await pool.query(
    'UPDATE todos SET title = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [updatedTitle, updatedDescription, todoId]
  );
  return updateResult.rows[0];
};

export const deleteToDo = async (todoId) => {
  const rc = await pool.query('DELETE FROM todos WHERE id = $1', [todoId]);
  if (rc.rowCount < 1) {
    throw new Error(`The todo was not deleted. Zero rows deleted`);
  }
  return rc.rowCount;
}