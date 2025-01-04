import { proxyLambdaRequest, proxyPassthruRequest } from "../services/ProxyService.js";
import * as containerService from "../services/ContainerService.js"
import { extractZip } from '../services/ZipService.js';

const handlePassthruRequest = async (req, res, targetEndpoint) => {
  try {
    const { status, result } = await proxyPassthruRequest(req, targetEndpoint);
    res.status(status).send(result);
  } catch (exc) {
    const msg = `Exception proxying the request: ${exc.message}`;
    console.log(msg);
    res.status(200).json({ message: msg });
  }
};

const handleUnmanagedLambdaRequest = async (req, res, targetEndpoint, lambdaPayload) => {
  try {
    const { status, result } = await proxyLambdaRequest(targetEndpoint, lambdaPayload);
    res.status(status).send(result);
  } catch (exc) {
    const msg = `Exception proxying the Lambda request: ${exc.message}`;
    console.log(msg);
    res.status(200).json({ message: msg });
  }
}

const handleManagedLambdaRequest = async (req, res, targetEndpoint, lambdaPayload, settings) => {
  try {
    // Check to see if the container is already running
    const containerName = targetEndpoint.function.name;
    let runningContainer = await containerService.getContainer(containerName);

    if (!runningContainer) {
      runningContainer = await bringUpContainer(containerName, targetEndpoint, settings);
    }
    targetEndpoint.function.externalPort = runningContainer.externalPort;
    const { status, result } = await proxyLambdaRequest(targetEndpoint, lambdaPayload);
    const jsonResult = JSON.parse(result);
    res.status(status).json(jsonResult);
  } catch (exc) {
    const msg = `Exception proxying the request to a container: ${exc.message}`;
    console.log(msg);
    res.status(200).json({ message: msg });
  }
}

const bringUpContainer = async (containerName, targetEndpoint, settings) => {
  // If this starts from a zip, then unzip the contents
  let fileMappingSource = null;
  if (targetEndpoint.function.type == 'zip') {
    fileMappingSource = await extractZip(settings.zipSourceDir,
      targetEndpoint.function.file, settings.zipTargetDir);
  } else if (targetEndpoint.function.type == 'filesystem') {
    fileMappingSource = targetEndpoint.function.rootDir;
  } else {
    // This is for containers that run from an image exclusively
    fileMappingSource = null;
  }
  
  const allEnvVars = Object.assign({}, settings.envVars, targetEndpoint.function.envVars);

  if (settings.includeCloudVars == true) {
    allEnvVars['AWS_ACCESS_KEY_ID'] = process.env.AWS_ACCESS_KEY_ID;
    allEnvVars['AWS_SECRET_ACCESS_KEY'] = process.env.AWS_SECRET_ACCESS_KEY;
    allEnvVars['AWS_SESSION_TOKEN'] = process.env.AWS_SESSION_TOKEN;
    allEnvVars['AWS_REGION'] = process.env.AWS_REGION;
  }

  const containerConfig = containerService.getContainerConfig(
    containerName,
    targetEndpoint.function.imageName ? targetEndpoint.function.imageName : settings.baseImage,
    targetEndpoint.function.entryPoint,
    fileMappingSource,
    await containerService.getAvailablePort(),
    targetEndpoint.function.internalPort,
    allEnvVars);

  await containerService.launchContainer(containerName, containerConfig);
  return await containerService.getContainer(containerName);
}

export { handlePassthruRequest, handleUnmanagedLambdaRequest, handleManagedLambdaRequest }