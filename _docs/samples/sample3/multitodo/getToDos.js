import { getAllToDos } from "./dbservice.js";

export const handler = async (event) => {
  console.log("Getting Todos...");

  try {
    const items = await getAllToDos();
    return { statusCode: 200, body: JSON.stringify(items) };
  } catch(exc) {
    console.error(exc);
    return { statusCode: 400, body: JSON.stringify({error: exc.message})};
  }
  
};
