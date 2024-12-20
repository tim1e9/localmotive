import { proxyLambdaRequest, proxyPassthruRequest } from "../services/ProxyService.js";
import * as containerService from "../services/ContainerService.js"
import { extractZip } from '../services/ZipService.js';

const handlePassthruRequest = async (req, res, targetFunction, config) => {
  try {
    const { status, result } = await proxyPassthruRequest(req, targetFunction, config.settings);
    res.status(status).send(result);
  } catch (exc) {
    const msg = `Exception proxying the request: ${exc.message}`;
    console.log(msg);
    res.status(200).json({ message: msg });
  }
};

const handleUnmanagedLambdaRequest = async (req, res, targetFunction, config, lambdaPayload) => {
  try {
    config.externalPort = targetFunction.externalPort;
    config.host = targetFunction.host;
    const { status, result } = await proxyLambdaRequest(config, lambdaPayload);
    res.status(status).send(result);
  } catch (exc) {
    const msg = `Exception proxying the Lambda request: ${exc.message}`;
    console.log(msg);
    res.status(200).json({ message: msg });
  }
}

const handleManagedLambdaRequest = async (req, res, targetFunction, config, lambdaPayload) => {
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
    config.host = targetFunction.host;
    const { status, result } = await proxyLambdaRequest(config, lambdaPayload);
    const jsonResult = JSON.parse(result);
    res.status(status).json(jsonResult);
  } catch (exc) {
    const msg = `Exception proxying the request to a container: ${exc.message}`;
    console.log(msg);
    res.status(200).json({ message: msg });
  }
}

export {handlePassthruRequest, handleUnmanagedLambdaRequest, handleManagedLambdaRequest }