# Localmotive - TypeScript Support

## Overview

The purpose of this sample is to show how to locally run a Lambda function which 
is written in TypeScript. This sample is very similar to sample two. However, the
codebase has been altered to more closely represent a typical TypeScript Lambda
function.


## Prerequisites

In this sample, all of the API calls are made from a REST client tool. By default,
[Bruno](https://www.usebruno.com/) is used, but the Bruno collection should be compatible
with any REST client which supports their file format.

To run the tutorial, you'll need Docker Desktop or a compatible container runtime environment.


## Code Build

The code consists of a single file. However, this file supports GET / POST / PUT and DELETE.
To handle this, the `ANY` method type is used.


## Configuration

This sample contains a special Visual Studio debug configuration. It demonstrates some
special flags necessary to execute a TypeScript-based Lambda funciton.

It is also valuable to inspect `package.json` and `tsconfig.json`. They include critical
settings necessary to successfully execute the code.


## Running the Sample

This sample is run directly from the local filesystem. It's therefore not necessary
to build the application into either a zip file or a container image.

Ensure the `config.json` file is properly configured, and start localmotive.
Next, from Bruno (or the equivalent), perform various calls to the back end to
ensure that data can be read, updated, created, and deleted.

## Shutdown

To shut everything down, be sure to stop all containers and remove all unzipped
files. There's also a helper function to remove containers. To use it, run the
following from the root of Localmotive:

```
node cleanup.js
```

This code will look for any container with a tag of 'Localmotive' and a value of
`containerLabelText`. (See the configuration file section for more details.)
