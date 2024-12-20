import 'dotenv/config'
import express from 'express';

import { handlePassthruRequest,
         handleManagedLambdaRequest,
         handleUnmanagedLambdaRequest } from './handlers/Handlers.js';
import * as containerService from './services/ContainerService.js';
import { convertHttpRequestToLambdaPayload } from './services/TransformationService.js';
import { loadConfig, getFunctionDetailsFromPathAndMethod } from './services/ConfigurationService.js';

const app = express();
app.use(express.json());

const configFile = process.env.CONFIG_FILE;
if (!configFile) {
  throw new Error(`Missing configuration file: (Set CONFIG_FILE in the environment)`);
}
const config = await loadConfig(configFile)
const ADMIN_PATH = config?.settings?.adminPathPrefix ? config.settings.adminPathPrefix : '_admin';

await containerService.init(config.settings);

app.all('/*', async (req, res) => {
  // TODO: Check if this is an admin function. If so, forward to the admin module
  if (req.path.startsWith(ADMIN_PATH)) {
    console.log(`Hey, this has the admin path in the name. That's a TODO! :-)`);
  }

  // Check to see if anything matches the path
  const targetEndpoint = getFunctionDetailsFromPathAndMethod(req.path, req.method);
  if (!targetEndpoint) {
    res.status(404).send("Requested target function not found");
    return;
  }

  if (targetEndpoint.function.type == 'passthru') {
    await handlePassthruRequest(req, res, targetEndpoint);
    return;
  }

  const lambdaPayload = convertHttpRequestToLambdaPayload(req);

  // A value of 'lambda' represents existing (nonmanaged) lambda functions. No need
  // to start up a container or anything else; just make the call and return the results
  if (targetEndpoint.function.type == 'lambda') {
    await handleUnmanagedLambdaRequest(req, res, targetEndpoint, lambdaPayload)
  } else {
    // The remaining types all run from within a container.
    await handleManagedLambdaRequest(req, res, targetEndpoint, lambdaPayload, config.settings);
  }

});

const nodejs_port = process.env.NODEJS_PORT ? process.env.NODEJS_PORT : 3000;

app.listen(nodejs_port, () =>
  console.log(`Example app listening at http://localhost:${nodejs_port}`)
);
