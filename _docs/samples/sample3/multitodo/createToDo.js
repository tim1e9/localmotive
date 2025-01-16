import { createToDo } from "./dbservice.js";

export const handler = async (event) => {
  console.log("Creating a todo...");
  const { body } = event;
  const data = body ? JSON.parse(body) : null;

  try {
    const { title, description } = data;
    const result = await createToDo(title, description);
    return { statusCode: 201, body: JSON.stringify(result) };
  } catch(exc) {
    console.error(exc);
    return { statusCode: 400, body: JSON.stringify({error: exc.message})};
  }
        
};
