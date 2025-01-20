# Localmotive - Local Software Development for Functions

## Overview

Localmotive has one main goal: Provide a simple, lightweight environment for running
and testing AWS Lambda functions locally - before deploying them to a shared environment.

Localmotive allows a developer to define a series of HTTP-based endpoints. These endpoints
can be invoked from either a web browser, or a REST client.

When an endpoint is invoked, Localmotive does the following:
1. Locate the Lambda function associated with the URL path and method
2. Attempt to locate an already-running instance of the function.
3. If not found, launch a new instance of the function.
4. Convert the HTTP request into a Lambda event and send it to the function.
   (This conversion mimics the transformation that occurs when an API Gateway request
   is converted to a Lambda event.)
5. The response from the Lambda function is converted back into an HTTP response, and
   returned to the caller.


## Functions Supported

Localmotive supports four different types of packaged Lambda functions:
1. Container image - Lambda functions built upon one of the existing AWS Lambda container images.
2. Zip file - Lambda functions built by zipping up a directory's contents and uploading it via
   the Lambda web console.
3. Filesystem - Unpackaged, normal code residing on the local filesystem
4. Lambda - an already running, or possibly remote lambda function

In addition to these four deployment types, Localmotive also supports debugging a locally-running
Lambda function. To do this, Localmotive works in concert with another project:
[Trylam](https://github.com/tim1e9/trylam).

### How it Works

In most scenarios, Localmotive runs functions as follows:
1. Identify the type of function to run. Locate the appropriate Lambda function
   artifacts within the local filesystem.
2. Start a locally-running container and provide the entrypoint to the Lambda
   function. This leverages the 
   (Lamda runtime API)[https://docs.aws.amazon.com/lambda/latest/dg/runtimes-api.html]
   for sending events to the function.
3. Convert an HTTP-based invocation into a Lambda event, and send the event to the
   Lambda function.
4. Await the results. When received, convert the response into the HTTP equivalent,
   and return the results to the caller.
5. Monitor the logs via standard container runtime logging facilities.
6. Stop containers via standard container management tooling.


## Prerequisites

Localmotive uses container technology to run functions locally. This allows a developer to have
significant control over starting and stopping functions, and even how to manage and review
logs.

Localmotive supports the Docker REST API to manage these containers. It also supports a
compatibility mode which allows other container management tools to work as well.

As of this writing, Localmotive has been tested with:
- Docker Desktop
- Finch

A REST client, such as Bruno, is also recommended, but not required. 


## Working Examples

This repository contains a number of samples, which show how to develop, package, and test
Lambda functions. To get started, please see the
[README](https://github.com/tim1e9/localmotive/tree/main/_docs/samples)
file in the `/_docs/samples` subdirectory.

As of now, Localmotive supports both JavaScript and TypeScript projects. It is the
intent of the author to also include Python support in the near future.

## Additional Information
Localmotive is currently in pre-alpha. No support or warranty is provided. However, suggestions
are welcome, so please feel free to open issues within this repository.