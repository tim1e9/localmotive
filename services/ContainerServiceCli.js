// Attempt to use a CLI to run the various container commands. Oof.
import { exec } from 'child_process';
import { promisify } from 'util';

const containerManager = process.env.CONTAINER_MANAGER ? process.env.CONTAINER_MANAGER : "docker";

const cliCmd = process.env.CLI_CMD ? process.env.CLI_CMD : 'docker';
console.log(`CLI docker command (or equivalent): ${cliCmd}`);

const execPromise = promisify(exec);

let containerLabelText = "localknowledgerequired";  // Used to identify running containers owned by Localmotive

const init = async (settings) => {
  containerLabelText = settings.containerLabelText;
};

const getContainer = async (containerName) => {
  const myContainers = await getAllContainers();
  const myContainer = myContainers[containerName];
  if (myContainer) {
    console.log(`Found container with name: ${myContainer.name}`)
  }
  return myContainer;
}

const splitLabels = (rawString) => {
  // When using the CLI, all labels are provided as a string. Split them apart.
  const entries = rawString.split(',');
  const labels = {};
  entries.forEach( (elem) => {
    const kvPair = elem.split('=');
    labels[kvPair[0]] = kvPair[1];
  });
  return labels;
}

const getPortsFromString = (rawString) => {
  // Format is like this: '0.0.0.0:1234->8080/tcp' We want the 1234
  const start = rawString.indexOf(':');
  const end = rawString.indexOf('-');
  return rawString.substring(start+1, end);
}

const getAllContainers = async () => {
  try {
    const resp = await runCliCommandAndGetOutput(`${cliCmd} ps --format json --no-trunc`, 'json');
    // Key all containers by their name
    const containers = {};
    for (const entry of resp) {
      const key = entry.Names;
      const labels = splitLabels(entry.Labels);
      if (labels && labels.localmotive && labels.localmotive == containerLabelText) {
        const externalPort = getPortsFromString(entry.Ports);
        const cur = {
          created: entry.CreatedAt,
          id: entry.ID,
          image: entry.Image,
          name: key,
          mounts: entry.Mounts,
          ports: entry.Ports,
          state: entry.State,
          externalPort: externalPort,
          labels: labels
        };
        containers[key] = cur;
      }
    };
    console.log(`Number of containers running: ${Object.keys(containers).length}`)
    return containers;
  } catch (exc) {
    console.error(`Error getting containers: ${exc.message}`);
    return [];
  }
}

// Get an available random port between 10,000 and 50,000
const getAvailablePort = async () => {
  // TODO: Check to see if the port is actually open
  return Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000;
}

const getContainerConfig = (containerName, containerImage, entryPoint, localDir, externalPort, internalPort, envVars) => {
  // Create the configuration for the container
  const envArray = Object.keys(envVars).map( (key) => {
    return `--env=${key}="${envVars[key]}"`;
  });
  const envString = envArray.join(" ");
  const mapLocal = localDir ? `-v ${localDir}:/var/task` : '';
  const ep = entryPoint ? entryPoint : '';

  const containerConfig = `${cliCmd} run -d --name ${containerName} ${envString}`
  + ` --label localmotive=${containerLabelText} ${mapLocal} -p ${externalPort}:${internalPort} ${containerImage} ${ep}`;
  console.log(containerConfig);
  return containerConfig;
}

const pauseToLaunch = async (durationInSeconds) => {
  await new Promise(resolve => setTimeout(resolve, durationInSeconds * 1000));
}

const launchContainer = async (containerName, containerConfig) => {
  try {

    const response = await runCliCommandAndGetOutput(containerConfig, 'text');
    console.log('Container created:', response);

    // Some container managers don't return until the container is running
    // Others return immediately. If that's the case, wait a little bit...
    if (containerManager == "finch") {
      await pauseToLaunch(5);
    }

    return {
      name: containerName,
      containerId: response.Id,
    }

  } catch (exc) {
    const msg = `Error launching container: ${exc.message}. ` 
      +"404 errors can occur when local images are not found. "
      +"Pull / build the image locally and try again"
    console.error(msg);
    throw new Error(msg);
  }
}

const destroyAllContainers = async () => {
  try {
    const resp = await getAllContainers();
    const containers = {};
    for (const key of Object.keys(resp)) {
      const entry = resp[key];
      const labels = entry.labels;
      if (labels && labels.localmotive && labels.localmotive == containerLabelText) {
        await destroyContainer(key);
      }
    }
    console.log("All containers removed");
  } catch (exc) {
    console.log(`Exception destroying containers: ${exc.message}`);
  }
}

const destroyContainer = async (containerName) => {
  // Stop the container. (All containers should have --rm, so stop will also remove them)
  const response = await runCliCommandAndGetOutput(`${cliCmd} rm -f ${containerName}`);
  console.log(`Container destroyed: ${containerName}`, response);
};


const runCliCommandAndGetOutput = async (cmd, format) => {
  const { stdout, stderr } = await execPromise(cmd);
  if (stderr) {
    throw new Error(stderr);
  }
  if (format == 'json') {
    // JSON Output from the CLI... is not valid JSON. Um, ok.
    const entries = stdout.trim().split('\n');
    const responseString = `[${entries.join(',')}]`;
    const response = JSON.parse(responseString);
    return response;
  } else {
    const response = stdout.trim();
    return { id : response };
  }
}

export { init, getAvailablePort, getContainer, getContainerConfig, launchContainer, destroyAllContainers };