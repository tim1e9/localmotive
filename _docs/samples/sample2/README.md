# Localmotive - Local DB Support

The purpose of this sample is to show how to locally debug a Lambda function which 
makes use of a database. (In this case, the database is PostgreSQL.)

## Overview

In this sample, all of the API calls are made from a REST client tool. By default,
[Bruno](https://www.usebruno.com/) is used,
but the input file should be compatible with any REST client which supports collections.

## Prerequisites

To run the tutorial, you'll need Docker Desktop or one of the container runtime/cli knock-offs.

## Code Build

The code consists of a single file. However, this file supports GET / POST / PUT and DELETE.
To handle this, the `ANY` method type is used.

## Configuration

The key to running this example is specified in the `config.json` file. Specifically, environment
variables are defined to access the database. When the Lambda function is deployed to the cloud,
the function will expect the exact same environment variables.


## Running the Sample

Build the todo application by creating a zip file out of it, and placing it in the appropriate `zips` folder.
A sample command to do the build is as follows:
```
zip -r ../todo.zip . -x "*/.*"
```

Ensure the `config.json` file is properly configured, and start localmotive. Next, from Bruno (or the equivalent),
perform various calls to the back end to ensure that data can be read, updated, created, and deleted.

## Shutdown

To shut everything down, be sure to stop all containers and remove all unzipped files. There's also a helper function to
remove containers. To use it, run the following from the root of Localmotive:

```
node cleanup.js
```

