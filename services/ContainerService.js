import axios from 'axios';

let containerLabelText = "localknowledgerequired";  // Used to identify running containers owned by Localmotive

const DOCKER_SOCKET = process.env.DOCKER_SOCKET ? process.env.DOCKER_SOCKET : '/var/run/docker.sock';
const DOCKER_API_VERSION = "v1.41";

const dockerDaemon = axios.create({
  socketPath: DOCKER_SOCKET,
  baseURL: `http://localhost/${DOCKER_API_VERSION}`,
  timeout: 5000
});

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

const getAllContainers = async () => {
  try {
    const resp = await dockerDaemon.get('/containers/json');
    // Key all containers by their name
    const containers = {};
    for (const entry of resp.data) {
      const key = entry.Names[0].substring(1);
      const labels = entry.Labels;
      if (labels && labels.localmotive && labels.localmotive == containerLabelText) {
        const externalPort = entry.Ports[0].PublicPort;
        const cur = {
          created: entry.Created,
          id: entry.Id,
          image: entry.Image,
          name: key,
          mounts: entry.Mounts,
          ports: entry.Ports,
          state: entry.State,
          externalPort: externalPort,
          labels: entry.Labels
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

  const containerConfig = {
    "Image": containerImage,
    "name": containerName,
    "Labels": {
      "localmotive": containerLabelText
    },
    "ExposedPorts": {},
    "HostConfig": {
      "AutoRemove": true,
      "PortBindings": {}
    }
  };

  // Port goodness
  containerConfig.ExposedPorts[`${internalPort}/tcp`] = {};
  containerConfig.HostConfig.PortBindings[`${internalPort}/tcp`] = [{"HostPort": `${externalPort}`}];

  // Optionally add the entrypoint. (Not needed for some images). Format:
  // "Cmd": [entryPoint],
  if (entryPoint) {
    containerConfig.Cmd = [ entryPoint ];
  }
  // Add a binding to a local directory if it exists
  if (localDir) {
    containerConfig.HostConfig.Binds = [
      `${localDir}:/var/task`
    ]
  }
  // Add environment variables if they're present. Format:
  //"Env": [
  //  "foo=bar"
  //],
  if (envVars) {
    containerConfig.Env = envVars
  }
  return containerConfig;
}

const launchContainer = async (containerName, containerConfig) => {
  try {

    const response = await dockerDaemon.post(`/containers/create?name=${containerName}`, containerConfig);
    console.log('Container created:', response.data);

    // Start the container
    await dockerDaemon.post(`/containers/${response.data.Id}/start`);
    console.log(`Container started with ID: ${response.data.Id}`);
    return {
      name: containerName,
      containerId: response.data.Id,
    }

  } catch (exc) {
    console.error(`Error launching container: ${exc.message}`);
    throw new Error(exc);
  }
}

const destroyAllContainers = async () => {
  try {
    const resp = await dockerDaemon.get('/containers/json');
    // Key all containers by their name
    const containers = {};
    for (const entry of resp.data) {
      const labels = entry.Labels;
      if (labels && labels.localmovie && labels.localmotive == containerLabelText) {
        await destroyContainer(key);
      }
    }
    console.log("All containers removed");
  } catch (exc) {
    console.log(`Exception destroying containers: ${exc.message}`);
  }
}

const destroyContainer = async (containerName) => {
  // Stop the container
  const response = await dockerDaemon.post(`/containers/${containerName}/stop`, {});
  console.log('Container destroyed:', response.data);

  // TODO: Remove the unzipped files (if type of zip)
  // const delDir = details.tempDir;
  // if (delDir) {
  //     console.log(`Deleting directory: ${delDir}`);
  //     await fs.rm(delDir, { recursive: true, force: true});
  //     console.log("Done");
  // }
  // return true;
};

export { init, getAvailablePort, getContainer, getContainerConfig, launchContainer, destroyAllContainers };