// Manage the various functions that run as containers
import * as containerService from "./ContainerService.js"


const getFunction = async (functionConfig) => {
  // Check to see if the container is running. If not, launch it
  const cs = await containerService.getContainer(functionConfig.name)
  if (cs) {
    return cs;
  }

  // The function is not running, so depending on the type of function,
  // launch it appropriately
  if (functionConfig.type == "zip") {
    try {
      // Tailor a few of the configuration properties
      functionConfig.location = functionConfig.settings.zipRootDir + functionConfig.file;
      functionConfig.baseImage = functionConfig.settings.baseImage;
      functionConfig.targetPort = await containerService.getAvailablePort();
      const details = await containerService.launchContainerFromZip(functionConfig);
      return details;
    } catch(exc) {
      const msg = `Exception instantiating a zip-based function: ${exc.message}`;
      console.error(msg);
      return null;
    }
  } else {
    // Only zip is working for now
    return null;
  }
}

export { getFunction };