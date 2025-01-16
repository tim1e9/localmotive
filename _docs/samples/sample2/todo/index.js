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
  console.log("VAN HALEN");
  const { httpMethod, pathParameters, body } = event;
  const todoId = pathParameters?.id;
  const data = body ? JSON.parse(body) : null;

  try {
    switch (httpMethod) {
      case 'POST': {
        const { title, description } = data;
        const createResult = await pool.query(
          'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
          [title, description]
        );
        return { statusCode: 201, body: JSON.stringify(createResult.rows[0]) };
      }

      case 'GET': {
        const readResult = await pool.query('SELECT * FROM todos');
        return { statusCode: 200, body: JSON.stringify(readResult.rows) };
      }

      case 'PUT': {
        const { updatedTitle, updatedDescription } = data;
        const updateResult = await pool.query(
          'UPDATE todos SET title = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
          [updatedTitle, updatedDescription, todoId]
        );
        return { statusCode: 200, body: JSON.stringify(updateResult.rows[0]) };
      }

      case 'DELETE': {
        await pool.query('DELETE FROM todos WHERE id = $1', [todoId]);
        return { statusCode: 204 };
      }

      case 'PATCH': {
        if (event.path.endsWith('/complete')) {
          const completeResult = await pool.query(
            'UPDATE todos SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            ['completed', todoId]
          );
          return { statusCode: 200, body: JSON.stringify(completeResult.rows[0]) };
        }
        break;
      }

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
