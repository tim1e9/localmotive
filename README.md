# Localmotive - Local Software Development for Functions

## Goal
Localmotive has one main goal: Provide a simple, lightweight environment for running
and testing functions locally - before deploying them to a shared environment.

## Functions? Don't you mean Lambdas?
Ah, yes. Functions. Different cloud companies call them different things. As of now,
Localmotive is focused on AWS Lambda functions. However, things change over time,
so to keep thing simple, let's just call them functions.

## Tell Me More
A developer specifies details about a set of functions in a configuration file.
Localmotive then reads that file and provides an HTTP API for invoking those functions.
When used in concert with Trylam, it's even possible to locally debug a function.

Since everything runs locally, via Docker containers, all output logs and details are
immediately available. It's no longer necessary to deploy functions with print / console
messages, and then iteratively test the code and review the logs. Do it all in a single place.

Localmotive supports five different types of configurations:
1. Container image - functions built upon one of the existing AWS Lambda container images.
2. Zip file - a zip file containing the function code.
3. Filesystem - unzipped, normal code residing on the local filesystem
4. Lambda - an already running, or possibly remote lambda function
5. Passthru - Just a simple passthru to call something hosted elsewhere

For more thorough tutorial, please view the README file in the `/_docs/samples` subdirectory.

## Docker Containers?
Yes. As of now, Localmotive uses the Docker REST API (v1.41) to manage containers. Other
container runtimes supposedly support this API, so non-Docker container runtimes should
also work. Please refer to the container runtime documentation for more details.

