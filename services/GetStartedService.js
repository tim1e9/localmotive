import fs from 'fs'
import path from 'path'
import dotenv, { config } from 'dotenv'
import readline from 'readline/promises';
const LOWER_CASE = 0;
const UPPER_CASE = 1;
const AS_IS_CASE = 2;

// The purpose of this file is to allow people to get started without having
// to go through a bunch confusing configuration. Let's just get it interactively...

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const updateEnvFile = (kvPairs) => {
  let allValues = {};
  try {
    const fileContents = fs.readFileSync('.env')
    allValues = dotenv.parse(fileContents);
  } catch (exc) {
    // no-op - in case .env file doesn't exist
  }
  const combinedValues = { ...allValues, ...kvPairs };
  const updatedEnv = Object.entries(combinedValues).map(([key, value]) => `${key}=${value}`).join('\n');

  // Save back to .env file. Allow an exception to bubble up
  fs.writeFileSync('.env', updatedEnv);
}

// A helper function for reading input from the command line
const prompt = async (text, validValues = [], mode = 0) => {
  const choices = validValues && validValues.length > 0 ? ` (${validValues.join(',')})` : '';
  const reply = await rl.question(text + choices + " ");
  let formattedReply = reply;
  if (mode == LOWER_CASE) {
    formattedReply = reply.toLowerCase();
  } else  if (mode == UPPER_CASE) {
    formattedReply = reply.toUpperCase();
  } 

  if (validValues && validValues.length > 0 && !validValues.includes(formattedReply)) {
    console.log("Invalid value specified. Please retry. (Or ctrl-c to quit.)")
    return await prompt(text, validValues, mode);
  }
  return formattedReply;
};

// Verify that a container manager (such as Docker) exists
const verifyContainerManager = async (configFileLocation) => {
  let cm = process.env.CONTAINER_MANAGER;
  let cliCmd = process.env.CLI_CMD;
  let nodeJsPort = process.env.NODEJS_PORT

  if (!cm || (cm != 'docker' && !cliCmd)) {
    console.log(
      `It appears that your container manager has not been defined. The container
manager is specified as an environment variable, named 'CONTAINER_MANAGER'.
The possible values include: docker, cli, nerdctl, finch, rancher and podman.
When using one of the non-docker tools, it is also necessary to specify
the cli command to use. For example, the CLI command for finch is: 'finch'.`);
    let userInput = await prompt(
      "Would you like to interactively specify this information?", ['y', 'n']);
    if (userInput == 'n') {
      throw new Error(`Missing container management details. Please update environment variables accordingly.`);
    }
    cm = await prompt(
      "Which container manager would you like to use?", ['docker', 'cli',
      'nerdctl', 'finch', 'rancher', 'podman']);
    if (cm != 'docker') {
      cliCmd = await prompt(
        "What is the cli command used to interact with the container manager?",
        ['docker', 'cli', 'nerdctl', 'finch', 'rancher', 'podman']);
    }

    const np = await prompt('What port should Localmotive use? (Leave blank for port 3000.)')
    nodeJsPort = (np == '') ? 3000 : parseInt(np);

    // Update the env vars
    process.env.CONTAINER_MANAGER = cm;
    process.env.CLI_CMD = cliCmd;
    process.env.NODEJS_PORT = nodeJsPort;

    userInput = await prompt(
      "Would you like to save these values to a .env file in the current working directory?",
      ['y', 'n']);
    if (userInput == 'y') {
      updateEnvFile({
        'CONTAINER_MANAGER': cm,
        'CLI_CMD': cliCmd,
        'NODEJS_PORT': nodeJsPort,
        'CONFIG_FILE': configFileLocation
      });
      return false;
    }

  }
  return true;
}

// A config file contains 1 or more endpoints. Allow the user to specify the details here
const gatherEndpoint = async () => {
  // The basics of an endpoint before it's customized:
  const endpoint = {
    'function': {
      'internalPort': 8080,
      'externalPort': 9000,
      'envVars': {
      }
    }
  }
  console.log(`Adding an endpoint...`)
  endpoint['path'] = await prompt("What is the path? Example: /test/endpoint");
  endpoint['method'] = await prompt("Which method?", ["GET", "PUT", "POST", "DELETE"], UPPER_CASE);
  endpoint['function']['name'] = await prompt("What is the name of the function?");
  const mappings = {
    '1': 'zip',
    '2': 'image',
    '3': 'filesystem',
    '4': 'lambda'
  }
  const txt = `How will the function be located?
1) A zip file (zip)
2) A container image (image)
3) On the filesystem (filesystem)
4) Debugger (lambda)
`;
  const fntype = await prompt(txt, ["1", "2", "3", "4"]);
  endpoint['function']['type'] = mappings[fntype];
  // At this point, the road divides...
  if (fntype == '1') {
    endpoint['function']['file'] = await prompt("What is the name of the zip file?");
  }
  if (fntype == '2') {
    endpoint['function']['imageName'] = await prompt(`What is the name of the container image?
(For example: 'some-lambda-fn:latest')`);
  }
  if (fntype == '3') {
    endpoint['function']['rootDir'] = await prompt(`What is the path to the root directory of the function?
(This can be either a relative path, such as './somedir/src', or an absolute path.)`);
  }
  if (fntype == '4') {
    endpoint['function']['host'] = await prompt(`What is the hostname of the machine running the Lambda debugger?
(i.e. 'localhost' or 'lambda.example.com')`);
  }
  // One last catch-all
  if (fntype == '1' || fntype == '3' || fntype == '4') {
    console.log(`What is the name of entry point? For example, if the main file is main.js or main.py, `)
    const ep = await prompt("And the function is named 'handler()', then the entrypoint will be main.handler. ");
    endpoint['function']['entryPoint'] = ep;
  }
  return endpoint;
}

// Every config file has a global 'settings' section. Create this section here...
const gatherConfigSettings = async () => {
  const settings = {
    "adminPathPrefix": "/_admin",
    "containerLabelText": "qwerty",
    "baseImage": "public.ecr.aws/lambda/nodejs:latest",
    "zipSourceDir": "/<replace_with_real_dir>/dev/local/zips/",
    "zipTargetDir": "/<replace_with_real_dir>/dev/local/zipruns",
    "includeCloudVars": true,
  }
  console.log(`The first step is to specify a number of global settings.`)

  // Note: adminPathPrefix and containerLabelText just take the defaults
  let val = await prompt(
    "Will you be working with (1) Python or (2) JavaScript/Typescript", ['1', '2']);
  if (val == '1') {
    settings['baseImage'] = 'public.ecr.aws/lambda/python:latest'
  } else {
    settings['baseImage'] = 'public.ecr.aws/lambda/nodejs:latest'
  }

  let cwd = process.cwd() + path.sep + 'zips' + path.sep;
  val = await prompt(
    `Where should Localmotive look for zipped Lambda functions? (Leave blank to accept the default value of ${cwd})`, null, AS_IS_CASE);
  settings['zipSourceDir'] = val ? val : cwd;

  cwd = process.cwd() + path.sep + 'zipruns' + path.sep;
  val = await prompt(
    `Where should Localmotive extract Lambda zip files so that they can be run? (Leave blank to accept the default value of ${cwd})`, null, AS_IS_CASE);
  settings['zipTargetDir'] = val ? val : cwd;

  val = await prompt(
    `Would you like to allow environment-variable-based AWS credentials to be made available within the Lambda runtime environments?`, ['y', 'n']);
  settings['includeCloudVars'] = (val == 'y');

  return settings;
}

// Verify that a configuration file exists. If not, offer to create one
const verifyConfig = async () => {
  const configFile = process.env.CONFIG_FILE;
  if (configFile) {
    console.log(`Configuration file location: ${configFile}.`);
    return configFile;
  }
  console.log("WARNING: the configuration file was not specified.")
  console.log(
    `Localmotive requires a configuration file to run properly. This file defines all of the relevant endpoints that can be reached.`);
  let userInput = await prompt(
    "Would you like to interactively create this file?", ['y', 'n']);
  if (userInput == 'n') {
    throw new Error(`Missing configuration file. Please update environment variables accordingly (CONFIG_FILE).`);
  }
  const settings = await gatherConfigSettings();
  console.log(`Global settings:
      ${JSON.stringify(settings, null, 2)}`)
  const allEndpoints = [];
  let gatherEndpoints = true;
  let an = 'an';
  while (gatherEndpoints) {
    userInput = await prompt(
      `Would you like to add ${an} endpoint to the configuration file?`, ['y', 'n']);
    an = "another";
    if (userInput == 'n') {
      gatherEndpoints = false;
    } else {
      const endpoint = await gatherEndpoint();
      allEndpoints.push(endpoint);
    }
  }
  console.log(`Endpoints:
      ${JSON.stringify(allEndpoints, null, 2)}`)


  // Final part: Write the file to the filesystem
  const cwd = process.cwd() + path.sep + 'config.json';
  let val = await prompt(
    `Where should Localmotive save this configuration file? (Leave blank to accept the default value of ${cwd})`);
  const targetLocation = val ? val : cwd;
  const fullContents = {
    'settings': settings,
    'endpoints': allEndpoints
  };
  fs.writeFileSync(targetLocation, JSON.stringify(fullContents, null, 2));
  process.env.CONFIG_FILE = targetLocation;
  return targetLocation;
}

// Main entry point to verify that the envrionment has been properly configured
const verifyEnvironment = async () => {
  try {
    const configFile = await verifyConfig();
    await verifyContainerManager(configFile);
    rl.close();
  } catch (exc) {
    const msg = `Exception encountered while configuring Localmotive: ${exc.message}`;
    throw new Error(msg);
  }
}

export { verifyEnvironment }