const containerManager = process.env.CONTAINER_MANAGER ? process.env.CONTAINER_MANAGER : "docker";
let cs = null;

if (!["docker", "finch", "podman"].includes(containerManager)) {
  throw new Error(`Container manager not recognized: ${containerManager}`)
}

if (containerManager == 'cli' || containerManager == 'finch' || containerManager == 'podman') {
  console.log(`Using the 'cli' container service. CLI command: ${process.env.CLI_CMD}`);
  cs = await import('./ContainerServiceCli.js');
} else if (containerManager == 'docker') {
  console.log("Using the Docker REST container service");
  cs = await import('./ContainerServiceRest.js')
} else {
  throw new Error(`Could not find container service named: ${containerManager}`);
}
console.log(`Container service being used: ${containerManager}`);

export const { init, getAvailablePort,  getContainer, getContainerConfig, launchContainer, destroyAllContainers} = cs;