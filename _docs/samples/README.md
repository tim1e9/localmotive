# Samples

## Overview

This directory contains a number of sample projects which demonstrate how
to use Localmotive. Each sample contains one or more Lambda functions which
can be developed, tested, packaged, and executed locally.

The following provides a brief overview of each sample:

### Sample 1 - Basic Examples and a Web UI

The [first sample](./sample1) contains the basics of how to configure and
run the different types of Lambda functions. The sample functions are very
simple because the focus is on how to properly configure and run Localmotive.

Sample Lambda functions include:
- `echo`  - Build a Lambda function into a container image and run it.
- `hello` - Zip the contents of a Lambda function and deploy it as if it were
  being deployed via the Lambda web console. 
- `hotdogs` - Execute a Lambda function without having to compile, build, or zip
  anything.

In addition, a modified configuration in the `hotdots` sample allows one
to locally debug a Lambda function.

All of these samples can be invoked from either an included browser-based
user interface, or via a REST client.


### Sample 2 - Environment Variables and Dependencies

The [second sample](./sample2) demonstrates how to specify environment variables
which will be passed to the Localmotive container runtime environment. In this
sample, an instance of PostgreSQL is used to persist a series of "to dos".

All functions within this sample are invoked via a REST client.


### Sample 3 - Multiple Entry Points, Custom Lambda Events

The [third sample](./sample3) demonstrates how to invoke different Lambda functions
which all reside in the same project. In other words, it simulates having many
Lambda functions in a single source code repository. Different entry points are
defined without having to duplicate the codebases locally.

This example also demonstrates how to emulate a Lambda function receiving
a standard S3 event. The sample allows a user to upload a file to an S3 bucket,
and then notify the Lambda function that the file has been uploaded. The Lambda
function then reads the file contents, and processes it appropriately.

### Sample 4 - TypeScript Support

The [fourth sample](./sample4/) is very similar to Sample 2. However, it's
developed in TypeScript, and written in a more TypeScript-friendly manner.