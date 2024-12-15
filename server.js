import 'dotenv/config'
import express from 'express';

import { init as initContainerService} from './services/ContainerService.js';
import { handleRequest as handleProxyRequest } from './handlers/proxyHandler.js';
import { handleRequest as handleZipRequest  } from './handlers/zipHandler.js';
import { loadConfig, getFunctionFromPathAndMethod } from './services/ConfigurationService.js';
const app = express();
app.use(express.json());

const configFile = process.env.CONFIG_FILE;
if (!configFile) {
    throw new Error(`Missing configuration file: (Set CONFIG_FILE in the environment)`);
}
const config = await loadConfig(configFile)
const ADMIN_PATH= config?.settings?.adminPathPrefix ? config.settings.adminPathPrefix : '_admin';

await initContainerService(config.settings);

app.all('/*', async (req, res) => {
  // TODO: Check if this is an admin function. If so, forward to the admin module
  
  // Check to see if anything matches the path
  const targetFunction = getFunctionFromPathAndMethod(req.path, req.method);
  if (!targetFunction) {
    res.status(400).send("Requested target function not found");
    return;
  }

  // targetFunction will be the function to execute. The action depends on the type
  if (targetFunction.type == 'proxy') {
    try {
      const {status, result} = await handleProxyRequest(req, targetFunction, config.settings);
      res.status(status).send(result);
    } catch( exc ) {
      const msg = `Exception proxying the request: ${exc.message}`;
      console.log(msg);
      res.status(200).json({message: msg});
      return;
    }
  } else if (targetFunction.type == 'zip') {
    try {
      const {status, result} = await handleZipRequest(req, targetFunction, config.settings);
      const jsonResult = JSON.parse(result);
      jsonResult.body = JSON.parse(jsonResult.body);
      res.status(status).json(jsonResult);
    } catch( exc ) {
      const msg = `Exception proxying the request: ${exc.message}`;
      console.log(msg);
      res.status(200).json({message: msg});
      return;
    }
  } else if (targetFunction.type == 'image') {

  } else if (targetFunction.type == 'filesystem') {

  } else {
    res.status(404).send("resource not found");
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
