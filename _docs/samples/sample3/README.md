# Localmotive - Multiple functions in a single repo

## Overview

The purpose of this sample is to show how to locally debug multiple Lambda functions
which all reside in a common repository. The code in this sample is similar to 
the previous sample, except instead of handling all methods (GET, POST, etc) in a
single Lambda function, they are spread over multiple functions in different files.

This sample also describes how to send a custom event to a Lambda function. In this
case, it will simlate the event emitted when a file has been added to an S3 bucket.
The Lambda function will then read the file, parse the contents, and perform a bulk-
upload of to-dos into the database.


## Prerequisites

In this sample, all of the API calls are made from a REST client tool. By default,
[Bruno](https://www.usebruno.com/) is used, but the Bruno collection should be compatible
with any REST client which supports their file format.


To run the tutorial, you'll need Docker Desktop or a compatible container runtime environment.


## Code Build

Building and deploying the code is an exercise left to an infrastructure architect. Instead,
the sample will focus on running the code from the filesystem.


## Configuration

The key to running this example is specified in the `config.json` file. Specifically,
environment variables are defined to access the database. There will also be multiple
entry points into the same filesystem, so content will be shared across containers.

It is also necesasry to update the custom event sent to the Lambda function: It's
necessary to alter the name of the S3 bucket and also the filename which gets uploaded
to S3.


## Running the Sample

Ensure the `config.json` file is properly located, and start localmotive. Next,
from Bruno (or the equivalent), perform various calls to the back end to ensure that
data can be read, updated, created, and deleted. Finally, send the custom event
to ensure that the bulk upload function works properly.


## Shutdown

To shut everything down, be sure to stop all containers and remove all unzipped
files. There's also a helper function to remove containers. To use it, run the
following from the root of Localmotive:

```
node cleanup.js
```

This code will look for any container with a tag of 'Localmotive' and a value of
`containerLabelText`. (See the configuration file section for more details.)
