# LOCALMOTIVE - Local Knowledge Required

## Goal
Be a front-end API which will invoke Lambda functions with the
appropriate data structures.

## Sample Schema
See `config.json`

## How this stuff works

### Passthru
Pretty dang simple - just pass it on through
- Consider an option to modify headers, the method, and even the payload
- Timeout may need to be significantly increased

### Zip file
- Write a lambda and zip it up - just like you're going to upload it in the AWS Console
- Use the Lambda runtime image as the base image
- Create the appropriate entries in `config.json`
- When launched:
  - unzip the file into a specific directory
  - Make a (Lambda) proxy call from localmotive to the newly launched docker container

### Container Image
- Write a lambda and make it into a container image
- Create the appropriate entries in `config.json`
- When launched:
  - Create / launch container (with appropriate localmotive tags)
  - Make a (Lambda) proxy call from localmotive to the newly launched docker container


## TODOs
- Move from unique prefix names to tags
- Integrated logging
- Containers
- Remove zip files after the container is destroyed

get request. One of:
 - proxy
 - zip
 - filesystem
 - container

Proxy is simple
The rest:
 - is container running? proxy request
 - not running?
    Filesystem - map filesystem to container and go
    Zip - extract to filesystem; map filesystem to container and go
    Container - pull container; no map, and go