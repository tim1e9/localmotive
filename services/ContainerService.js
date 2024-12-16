import axios from 'axios';
// import { promises as fs } from 'fs';
// import path from 'path';
// import os from 'os';
// import * as unzipper from 'unzipper';

let containerNamePrefix = "";  // Used to identify running containers owned by this app

const DOCKER_SOCKET = process.env.DOCKER_SOCKET ? process.env.DOCKER_SOCKET : '/var/run/docker.sock';

const dockerDaemon = axios.create({
  socketPath: DOCKER_SOCKET,
  baseURL: 'http://localhost/v1.41', // Docker API Version
  timeout: 5000
});

const init = async (settings) => {
  containerNamePrefix = settings.containerNamePrefix;
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
      if (key.startsWith(containerNamePrefix)) {
        const publicPort = entry.Ports[0].PublicPort;
        const cur = {
          created: entry.Created,
          id: entry.Id,
          image: entry.Image,
          name: key,
          mounts: entry.Mounts,
          ports: entry.Ports,
          state: entry.State,
          port: publicPort
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

const getContainerConfig = (containerName, containerImage, entryPoint, localDir, port) => {
  // Create the configuration for the container
  //const containerName = config.settings.containerNamePrefix + config.name;
  const containerConfig = {
    "Image": containerImage, //config.baseImage,
    "Env": [
      "foo=bar"
    ],
    "Cmd": [entryPoint],
    "name": containerName,
    "Labels": {
      "localmotive": "active"
    },
    "ExposedPorts": {
      "8080/tcp": {}
    },
    "HostConfig": {
      "AutoRemove": true,
      // "Binds": [
      //   `${localDir}:/var/task`
      // ],
      "PortBindings": {
        "8080/tcp": [{
          "HostPort": `${port}`
        }]
      }
    }
  };
  // Add a binding to a local directory if it exists
  if (localDir) {
    containerConfig.HostConfig.Binds = [
      `${localDir}:/var/task`
    ]
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
      port: config.targetPort
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
      const key = entry.Names[0].substring(1);
      if (key.startsWith(containerNamePrefix)) {
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

const launchContainerOld = async () => {
  try {
    const containerConfig = {
      Image: 'alpine',
      Cmd: ['echo', 'Hello, Docker!'],
      name: 'my-nodejs-container'
    };

    const response = await dockerDaemon.post('/containers/create', containerConfig);
    console.log('Container created:', response.data);

    // Start the container
    await dockerDaemon.post(`/containers/${response.data.Id}/start`);
    console.log(`Container started with ID: ${response.data.Id}`);
  } catch (error) {
    console.error('Error creating container:', error.message);
  }
}

export { init, getAvailablePort, getContainer, getContainerConfig, launchContainer, destroyAllContainers };