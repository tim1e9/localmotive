import 'dotenv/config'
import { rm, mkdir } from 'fs/promises';

import { initializeCS, getContainerManager } from './services/ContainerService.js';
import { loadConfig } from './services/ConfigurationService.js';

const configFile = process.env.CONFIG_FILE;
if (!configFile) {
    throw new Error(`Missing configuration file: (Set CONFIG_FILE in the environment)`);
}

const config = await loadConfig(configFile)

try {
    await initializeCS();
    const cm = getContainerManager();
    await cm.init(config.settings);
    await cm.destroyAllContainers();

    // Clean up any previously unzipped zip files
    const zipRootDir = config.settings.zipTargetDir;
    await rm(zipRootDir, { recursive: true, force: true });
    await mkdir(zipRootDir);
    console.log("Done.");
} catch(exc) {
    console.log(`Error: ${exc.message}`);
}
