import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export const createToDo = async (title, description, status) => {
  const createResult = await pool.query(
    'INSERT INTO todos (title, description, status) VALUES ($1, $2, $3) RETURNING *',
    [title, description, status]
  );
  return createResult.rows[0];
};

export const getAllToDos = async () => {
  const readResult = await pool.query('SELECT * FROM todos');
  return readResult.rows;
};

export const updateToDo = async (todoId, updatedTitle, updatedDescription, updatedStatus) => {
  console.log(`ID: ${todoId}. Title: ${updatedTitle}. D: ${updatedDescription}. Status: ${updatedStatus}`);
  const updateResult = await pool.query(
    'UPDATE todos SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
    [updatedTitle, updatedDescription, updatedStatus, todoId]
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