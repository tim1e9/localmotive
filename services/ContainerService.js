const containerDriver = process.env.CONTAINER_SERVICE ? process.env.CONTAINER_SERVICE : "cli";
let cs = null;

if (containerDriver == 'cli') {
  cs = await import('./ContainerServiceCli.js');
} else if (containerDriver == 'rest') {
  cs = await import('./ContainerServiceRest.js')
} else {
  throw new Error(`Could not find container service named: ${containerDriver}`);
}
console.log(`Container service being used: ${containerDriver}`);

export const { init, getAvailablePort,  getContainer, getContainerConfig, launchContainer, destroyAllContainers} = cs;