import 'dotenv/config'
import { init, destroyAllContainers } from './services/ContainerService.js';
import { loadConfig } from './services/ConfigurationService.js';

const configFile = process.env.CONFIG_FILE;
if (!configFile) {
    throw new Error(`Missing configuration file: (Set CONFIG_FILE in the environment)`);
}
const config = await loadConfig(configFile)
await init(config.settings);
await destroyAllContainers()