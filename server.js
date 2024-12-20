import 'dotenv/config'
import express from 'express';

import * as containerService from './services/ContainerService.js';
import { convertHttpRequestToLambdaPayload } from './services/TransformationService.js';
import { extractZip } from './services/ZipService.js';
import { handleLambdaRequest, handlePassthruRequest } from './handlers/proxyHandler.js';
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
  const targetFunction = getFunctionDetailsFromPathAndMethod(req.path, req.method);
  if (!targetFunction) {
    res.status(404).send("Requested target function not found");
    return;
  }

  // targetFunction will be the function to execute. The action depends on the type

  // Passthru is a special case - it's not necessary to transform the input
  if (targetFunction.type == 'passthru') {
    try {
      const { status, result } = await handlePassthruRequest(req, targetFunction, config.settings);
      res.status(status).send(result);
      return;
    } catch (exc) {
      const msg = `Exception proxying the request: ${exc.message}`;
      console.log(msg);
      res.status(200).json({ message: msg });
      return;
    }
  }

  // Transform the request from HTTP to a Lambda payload
  const lambdaPayload = convertHttpRequestToLambdaPayload(req);

  // A value of 'lambda' represents existing (nonmanaged) lambda functions. No need
  // to start up a container or anything else; just make the call and return the results
  if (targetFunction.type == 'lambda') {
    try {
      const { status, result } = await handleLambdaRequest(config, lambdaPayload);
      res.status(status).send(result);
      return;
    } catch (exc) {
      const msg = `Exception proxying the request: ${exc.message}`;
      console.log(msg);
      res.status(200).json({ message: msg });
      return;
    }
  }

  // The remaining types all run from within a container.
  try {
    // Check to see if the container is already running
    const containerName = targetFunction.name;
    let runningContainer = await containerService.getContainer(containerName);

    if (!runningContainer) {
      // If this starts from a zip, then unzip the contents
      let fileMappingSource = null;
      if (targetFunction.type == 'zip') {
        fileMappingSource = await extractZip(config.settings.zipSourceDir,
          targetFunction.file, config.settings.zipTargetDir);
      } else if (targetFunction.type == 'filesystem') {
        fileMappingSource = targetFunction.rootDir;
      } else {
        // This is for containers that run from an image exclusively
        fileMappingSource = null;
      }
      const containerConfig = containerService.getContainerConfig(
        containerName,
        targetFunction.imageName ? targetFunction.imageName : config.settings.baseImage,
        targetFunction.entryPoint,
        fileMappingSource,
        await containerService.getAvailablePort(),
        targetFunction.internalPort,
        null);

      await containerService.launchContainer(containerName, containerConfig);
      runningContainer = await containerService.getContainer(containerName);
    }
    config.externalPort = runningContainer.externalPort;
    const { status, result } = await handleLambdaRequest(config, lambdaPayload);
    const jsonResult = JSON.parse(result);
    res.status(status).json(JSON.parse(jsonResult));


  } catch (exc) {
    const msg = `Exception proxying the request: ${exc.message}`;
    console.log(msg);
    res.status(200).json({ message: msg });
    return;
  }
});

// app.get(`/${ADMIN_PATH}/containers/list`, async (req, res) => {
//     try {
//         const x = await getContainer("");
//         res.send({msg: x});
//     } catch(exc) {
//         console.error(`Exception launching a container: ${exc.message}`);
//         res.status(400).json({msg: exc.message});
//     }
// });

const nodejs_port = process.env.NODEJS_PORT ? process.env.NODEJS_PORT : 3000;

app.listen(nodejs_port, () =>
  console.log(`Example app listening at http://localhost:${nodejs_port}`)
);
