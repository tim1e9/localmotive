# Localmotive - Python Samples

## Overview

This set of samples are the same as the contents of sample1, with one big exception:
They're all written in Python.


## Start The Localmotive Server

Even though Localmotive has been written as a NodeJS application, it supports running
Lambda functions written in other languages. A valid NodeJS runtime is required to start
Localmotive, but once up and running, it's possible to launch Lambda functions written
in Python - just like functions written in JavaScript / TypeScript.

To start Localmotive, navigate to the appropriate directory and run the following commands:

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

If all has gone well, then the text "Hello ____" will appear in the output box. It is
also possible to view the container logs via the Docker management console.

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
