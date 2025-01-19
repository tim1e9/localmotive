import { updateToDo } from "./dbservice";

export const handler = async (event) => {
  console.log("Updating a todo...");
  const { pathParameters, body } = event;
  const data = body ? JSON.parse(body) : null;

  try {
    const { updatedTitle, updatedDescription, updatedStatus } = data;
    const result = updateToDo(pathParameters.id, updatedTitle, updatedDescription, updatedStatus);
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch(exc) {
    console.error(exc);
    return { statusCode: 400, body: JSON.stringify({error: exc.message})};
  }

};
