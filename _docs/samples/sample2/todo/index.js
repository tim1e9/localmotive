import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export const handler = async (event) => {
  const { httpMethod, queryStringParameters, body } = event;
  const data = body ? JSON.parse(body) : null;

  try {
    switch (httpMethod) {
      case 'POST': {
        const { title, description, status } = data;
        const createResult = await pool.query(
          'INSERT INTO todos (title, description, status) VALUES ($1, $2, $3) RETURNING *',
          [title, description, status]
        );
        return { statusCode: 201, body: JSON.stringify(createResult.rows[0]) };
      }

      case 'GET': {
        const readResult = await pool.query('SELECT * FROM todos');
        return { statusCode: 200, body: JSON.stringify(readResult.rows) };
      }

      case 'PUT': {
        const { id, updatedTitle, updatedDescription, updatedStatus } = data;
        const updateResult = await pool.query(
          'UPDATE todos SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
          [updatedTitle, updatedDescription, updatedStatus, id]
        );
        return { statusCode: 200, body: JSON.stringify(updateResult.rows[0]) };
      }

      case 'DELETE': {
        const toDoId = queryStringParameters.id;
        if (toDoId) {
          await pool.query('DELETE FROM todos WHERE id = $1', [toDoId]);
          return { statusCode: 204, body: JSON.stringify({success: true}) };
        } else {
          return { statusCode: 404, body: JSON.stringify({success: false}) }
        }
      }

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
