# Localmotive - Tutorial

## Overview

The purpose of this document is to go through the process of creating a collection
of Lambda functions, package them appropriately, and then run them from a
local development environment.

The sample is a ui-based application that makes calls to back-end Lambda functions.
In a fully-deployed cloud environment, the Lambda functions will generally reside
behind an instance of API Gateway, and possibly a CloudFront distribution as well.
Localmotive mimics this API, transforms web requests into events, and dispatches them
appropriately. Logs can be captured, or directly viewed with the standard container
runtime tooling being used. Lastly, standard container management techniques are used
to attach to containers, or stop/start them.


## Prerequisites

To run the tutorial, you'll need Docker Desktop or the equivalent.


## Code Build

There are four Lambda functions in this tutorial:
1. `hello` - Basically a 'Hello world' for Lambda. The code is bundled as a zip
   before being deployed.
2. `echo` - Echo back to the caller all of the information that's available as part
   of a Lambda event. The code is built into a container image before being deployed.
3. `hotdogs` - Return a string with a random number between 1 and 20. (e.g. I am
   sending you 10 hot dogs.) This code will reside on the filesystem. In the 2nd part
   of the tutorial, `Trylam` will be used to debug the code in real time.

Both the `hello` and `echo` projects have simple build instructions recorded in
a README file. Before proceeding, be sure to build both projects. Also be sure to
place the zipped file contents in the appropriate location. (Please see `zipSourceDir`
in the Configuration section for more details.)

## Configuration

Localmotive is driven by a configuration file. The file - named `config.json` - is
located in the same directory as these instructions. At runtime, Localmotive looks
for an envrionment variable named `CONFIG_FILE` to locate configuration data. This
environment variable is mandatory at this time.

The file contains both global values (via "settings"), and individual API endpoint
details. Review the contents of the file to familiarize yourself with what to expect.

### Configuration File Details

The configuration file contains two major sections:
- Settings
- Endpoints

Settings include the following:
- `adminPathPrefix` - There are some custom commands which Localmotive responds to.
  To invoke them, be sure to include this prefix in the URL invoked. (This is
  dicsussed in more detail in sample 3.)
- `containerLabelText` - When Localmotive runs a function, this label is used to
  identify running containers under Localmotive's control.
- `baseImage` - The base image used for launching a Lambda function locally.
- `zipSourceDir` - The local directory which contains zipped Lambda functions.
- `zipTargetDir` - The local directory where zipped Lambda functions should be
  unzipped and mapped to a locally-running container's filesystem.
- `includeCloudVars` - A boolean to specify if local AWS environment variables should
  be included when a local container has been invoked.
- `envVars` - A series of environment variables to include when launching a container.

The endpoints section specifies details about each Lambda function defined within
the system. Each endpoint can be described as follows:
- `path` - The path to match to invoke the Lambda function, such as `/my/path`. 
  It is possible to specify path parameters as follows: `/todo/{todoId}`.
- `method` - Possible values: POST, PUT, GET, DELETE
- `function` - Details about a function:
  - `name` - The name of the function
  - `type` - The type of function. Possible values: zip, image, passthru, filesystem,
             and lambda. These types are further described in the specific samples.
  - `entrypoint` - Specified as the filename and the function name, such as "index.handler"
  - `envVars` - Environment variables specific to a single endpoint. 
  - `internalPort` - The internal port used to listen for Lambda events. Usually set to 8080.
  - `externalPort` - The external port used to listen for Lambda events. Usually set to 9000.
  - `rootDir` - For `filesystem` types of deployments, this points to the root project directory
    on the developers local filesystem.

**NOTE:** The file should work with little to no modification. The only thing
that must be changed is the absolute path being used. Nonetheless, it's a good idea
to review each line of the file to verify the details, and also to better understand
how the configuration file works.

## Start The Localmotive Server

Localmotive is a NodeJS application. To run it, navigate to the appropriate directory,
and run the following commands:

```
npm install
npm start
```

## The User Interface

The sample user interface is a very simple HTML page with some rudimentary
JavaScript. This has been kept as simple as possible on purpose - so that
it's simple to see what's being done.

The UI must be served from something other than the filesystem. On many machines,
the simplest way to do this is via python's built-in HTTP server. To use this,
navigate to the `/uitest` subdirectory, and run the following command: 

```
python -m http.server 8000
```

## Running the Tests

### test 1 - hello

The first test is to call the `hello` Lambda. Enter a name into the UI, and Click
the `Go` button. The following actions will occur behind the scenes:

1. Localmotive will attempt to find a function that matches the API signature
   (method and path). If nothing is found, a 404 status message is returned.
2. If found, details of the Lambda will be loaded. In this case, the packaged code
   is a zip file.
3. Localmotive checks to see if an existing instance of this Lambda is running. If
   so, that instance is used.
4. If an instance is not found, Localmotive uses global settings in `config.json`
   to create a temp directory, unzip the zip file, and start a container runtime image
   with the code.
5. The incoming request is converted to an event. The event is dispatched, and the
   response is returned to the UI.

If all has gone well, then the text "Hello ____" will appear in the output box. It is also possible to view the container logs via the Docker management console.

### test 2 - echo

The next test is to call the `echo` Lambda. There's no input, so simply click the
`Go` button. The following actions will occur behind the scenes:

1. Localmotive will attempt to find a function that matches the API signature
   (method and path). If nothing is found, a 404 status message is returned.
2. If found, details of the Lambda will be loaded. In this case, the packaged code
   is a container image.
3. Localmotive checks to see if an existing instance of this Lambda is running. If
   so, that instance is used.
4. If an instance is not found, Localmotive launches a container instance of the image.
5. The incoming request is converted to an event. The event is dispatched, and the
   response is returned to the UI.

If all has gone well, then extensive event details will appear in the output box.

### test 3 - hotdog

The next test is to call the `hotdog` Lambda. There's no input, so simply click the
`Go` button. The following actions will occur behind the scenes:

1. Localmotive will attempt to find a function that matches the API signature
   (method and path). If nothing is found, a 404 status message is returned.
2. If found, details of the Lambda will be loaded. In this case, the code isn't
   packaged at all - it simply resides on the local filesystem. 
3. Localmotive checks to see if an existing instance of this Lambda is running. If
   so, that instance is used.
4. If an instance is not found, Localmotive uses global settings in `config.json` to
   start a container which includes a mapping to the locally available code.
5. The incoming request is converted to an event. The event is dispatched, and the
   response is returned to the UI.

If all has gone well, then a random number of hotdogs will be present.

## DEBUG

For the final test, an additional Library is required within the hotdogs code
 - [Trylam](https://github.com/tim1e9/trylam).

Since Trylam has not been published to npmjs.com yet, it's necessary to build and
publish it to a local registry container, such as `verdaccio`. In fact, there's a
special file in the `/hotdogs` directory named `.npmrc`. It instructs npm to use
a locally running registry to resolve packages.

Note that the `/hotdogs` directory also contains a debugging profile for Visual
Studio Code. From within VS Code, do the following:
1. Switch to the debugging view.
2. Set a breakpoint in the beginning of the function.
3. Start the debugger.
4. Switch back to the UI, and click the 'Invoke the Hotdog Debugger' button.
   After a moment, the debugger should gain focus and you can begin debugging
   the code. After making some inspections on the debugger, allow the code to
   run to completion.

**NOTE**: An alternative to running `verdaccio` is to simply copy the contents of
`Trylam` into the `node_modules` directory. This is left as an exercise for the reader.

## Shutdown

To shut everything down, be sure to stop all containers and remove all unzipped
files. There's also a helper function to remove containers. To use it, run the
following from the root of Localmotive:

```
node cleanup.js
```

This code will look for any container with a tag of 'Localmotive' and a value of
`containerLabelText`. (See the configuration file section for more details.)
