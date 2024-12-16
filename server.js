import 'dotenv/config'
import express from 'express';

import * as containerService from './services/ContainerService.js';
import { extractZip } from './services/ZipService.js';
import { handleContainerRequest, handleExternalRequest } from './handlers/proxyHandler.js';
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

  // Check to see if anything matches the path
  const targetFunction = getFunctionDetailsFromPathAndMethod(req.path, req.method);
  if (!targetFunction) {
    res.status(404).send("Requested target function not found");
    return;
  }

  // targetFunction will be the function to execute. The action depends on the type
  if (targetFunction.type == 'proxy') {
    try {
      const { status, result } = await handleExternalRequest(req, targetFunction, config.settings);
      res.status(status).send(result);
      return;
    } catch (exc) {
      const msg = `Exception proxying the request: ${exc.message}`;
      console.log(msg);
      res.status(200).json({ message: msg });
      return;
    }
  }

  try {
    // Check to see if the container is already running
    const containerName = config.settings.containerNamePrefix + targetFunction.name;
    let runningContainer = await containerService.getContainer(containerName);

    if (!runningContainer) {
      // If this starts from a zip, then unzip the contents
      let fileMappingSource = null;
      if (targetFunction.type == 'zip') {
        fileMappingSource = await extractZip(config.settings.zipSourceDir,
          targetFunction.file, config.settings.zipTargetDir);
      } else if (targetFunction.type == 'filesystem') {
        fileMappingSource = targetFunction.rootDir;
      }
      const containerConfig = containerService.getContainerConfig(containerName,
        config.settings.baseImage, targetFunction.entryPoint,
        fileMappingSource, await containerService.getAvailablePort());
      await containerService.launchContainer(containerName, containerConfig);
      runningContainer = containerService.getContainer(containerName);
    }

    const { status, result } = await handleContainerRequest('localhost', runningContainer.port, null, {});
    const jsonResult = JSON.parse(result);
    jsonResult.body = JSON.parse(jsonResult.body);
    res.status(status).json(jsonResult);


  } catch (exc) {
    const msg = `Exception proxying the request: ${exc.message}`;
    console.log(msg);
    res.status(200).json({ message: msg });
    return;
  }
});

// app.get(`/${ADMIN_PATH}/launchme`, async (req, res) => {
//     const x = await launchContainerFromZip(config.functions[0]);
//     // runningContainers[x.name] = x;
//     res.send(x);
// });

// app.get(`/${ADMIN_PATH}/containers/list`, async (req, res) => {
//     try {
//         const x = await getContainer("");
//         res.send({msg: x});
//     } catch(exc) {
//         console.error(`Exception launching a container: ${exc.message}`);
//         res.status(400).json({msg: exc.message});
//     }
// });

// app.get(`/${ADMIN_PATH}/containers/destroy/:containername`, async (req, res) => {
//     try {
//         const containerName = req.params.containername;
//         const containerDetails = runningContainers[containerName];
//         if (containerDetails) {
//             const c = await destroyContainer(containerDetails);
//             runningContainers[c.name] = c;
//             res.send({msg: c});

//         } else {
//             res.error(`Container with name ${containerName} not found`);
//         }
//     } catch(exc) {
//         console.error(`Exception destroying a container: ${exc.message}`);
//         res.status(400).json({msg: exc.message});
//     }
// });


const port = process.env.NODEJS_PORT ? process.env.NODEJS_PORT : 3000;

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
