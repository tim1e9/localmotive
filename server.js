import 'dotenv/config'
import express from 'express';
import { initProxyLogging } from './services/BasicReqResLoggingService.js';
import { handlePassthruRequest,
         handleManagedLambdaRequest,
         handleUnmanagedLambdaRequest } from './handlers/Handlers.js';
import { handleAdminRequest } from './services/AdminService.js';
import * as containerService from './services/ContainerService.js';
import { convertHttpRequestToLambdaPayload } from './services/TransformationService.js';
import { loadConfig, getFunctionDetailsFromPathAndMethod } from './services/ConfigurationService.js';

const app = express();
app.use(express.json());

const configFile = process.env.CONFIG_FILE;
if (!configFile) {
  throw new Error(`Missing configuration file: (Set CONFIG_FILE in the environment)`);
} else {
  console.log(`Configuration file location: ${configFile}.`);
}
const config = await loadConfig(configFile)
const ADMIN_PATH = config?.settings?.adminPathPrefix ? config.settings.adminPathPrefix : '/_admin';

initProxyLogging();
await containerService.init(config.settings);

// Remember: This is development. The following should scare you if you don't know what you're doing.
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', '*'); // Allow all headers
      res.setHeader('Access-Control-Allow-Credentials', 'true'); // Optional: Allow credentials (cookies, etc.)
      res.status(204).send();
  } else {
      next();
  }
});

app.all('/*', async (req, res) => {
  // TODO: Check if this is an admin function. If so, forward to the admin module
  if (req.path.startsWith(ADMIN_PATH)) {
    handleAdminRequest(req, res, config.settings);
    return;
  }

  // Be careful v2
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Check to see if anything matches the path
  let targetEndpoint = getFunctionDetailsFromPathAndMethod(req.path, req.method);
  if (!targetEndpoint) {
    if (config?.settings?.unmatchedFunctionPassthruURL) {
      // Treat this like a passthru request
      targetEndpoint = {
        function: {
          "type": "passthru",
          "method": req.method,
          "url": config.settings.unmatchedFunctionPassthruURL + req.path
        }
      };
    } else {
      // No passthru URL and no function match - not found
      res.status(404).send("Requested target function not found");
      return;
    }
  }

  if (targetEndpoint.function.type == 'passthru') {
    await handlePassthruRequest(req, res, targetEndpoint);
    return;
  }

  const lambdaPayload = convertHttpRequestToLambdaPayload(req, targetEndpoint);

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
