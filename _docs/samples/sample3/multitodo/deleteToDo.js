import { deleteToDo } from "./dbservice.js";

export const handler = async (event) => {
  console.log("Deleting a todo...");
  const { pathParameters } = event;
  console.log(`Event: ${JSON.stringify(event)}`);
  console.log(`Path parameters: ${JSON.stringify(pathParameters)}`);
  try {
    const todoId = pathParameters.todoId;
    console.log(`todoId: ${todoId}`);
    const rc = await deleteToDo(todoId);
    console.log(`Deleted: ${todoId}`);
    return { statusCode: 200, body: JSON.stringify({msg: `To do #${todoId} deleted. (Total rows deleted: ${rc})`})};
  } catch(exc) {
    console.error(exc);
    return { statusCode: 400, body: JSON.stringify({error: exc.message})};
  }
  
};
