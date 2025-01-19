import { ToDo } from "./types/ToDo";
import * as db  from "./service/db";

export const handler = async (event: any) => {
  const { httpMethod, pathParameters, body } = event;
  const todoId = pathParameters?.id;
  const data = body ? JSON.parse(body) : null;

  try {
    switch (httpMethod) {
      case 'POST': {
        const newToDo: ToDo = {
          title: data.title,
          description: data.description,
          status: "new"
        };
        const result = await db.createToDo(newToDo);
        return { statusCode: 201, body: JSON.stringify({"rowsCreated": result}) };
      }

      case 'GET': {
        const result = await db.getAllToDos();
        return { statusCode: 200, body: JSON.stringify(result) };
      }

      case 'PUT': {
        const updatedToDo: ToDo = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status
        };
        const result = await db.updateToDo(updatedToDo);
        return { statusCode: 200, body: JSON.stringify(result) };
      }

      case 'DELETE': {
        await db.deleteToDo(todoId);
        return { statusCode: 204 };
      }

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
