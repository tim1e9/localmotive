import { getFunctionDetailsFromName } from "./ConfigurationService.js"; 
import { handleManagedLambdaRequest } from "../handlers/Handlers.js";

const handleAdminRequest = async (req, res, settings) => {
  // Grab the path and look for an appropriate admin function
  try {
    const pathParts = req.path.split('/');
    const command = pathParts[2];
    if (command == 'sendEvent') {
      const targetFunctionName = pathParts[3];
      const payload = JSON.stringify(req.body);
      const targetFunction = getFunctionDetailsFromName(targetFunctionName);
      if (targetFunction) {
        await handleManagedLambdaRequest(req, res, targetFunction, payload, settings);
        console.log(`Event sent`);
        return;
      }
    }
    res.status(404).send("Not found");
} catch(exc) {
    const msg = `Error: ${exc.message}`;
    console.log(msg);
    res.status(400).send(msg);
  }
}

export { handleAdminRequest };