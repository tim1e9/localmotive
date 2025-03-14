
  let cs = null;

  const initializeCS = async () => {
    const containerManager = process.env.CONTAINER_MANAGER ? process.env.CONTAINER_MANAGER : "docker";
    const allCM = ["docker", "cli", "nerdctl", "finch", "rancher", "podman"];
    const allClonez = ["cli", "nerdctl", "finch", "rancher", "podman"]

    if (!allCM.includes(containerManager)) {
      throw new Error(`Container manager not recognized: ${containerManager}`)
    }

    if (allClonez.includes(containerManager)) {
      console.log(`Using the 'cli' container service. CLI command: ${process.env.CLI_CMD}`);
      cs = await import('./ContainerServiceCli.js');
    } else if (containerManager == 'docker') {
      console.log("Using the Docker REST container service");
      cs = await import('./ContainerServiceRest.js')
    } else {
      throw new Error(`Could not find container service named: ${containerManager}`);
    }
    console.log(`Container service being used: ${containerManager}`);
  }

  const getContainerManager = () => {
    return cs;
  }

export { initializeCS, getContainerManager };