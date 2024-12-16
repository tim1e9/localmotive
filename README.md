# LOCALMOTIVE - Local Knowledge Required

## Goal
Be a front-end API which will invoke Lambda functions with the
appropriate data structures.

## Sample Schema
No need to specify query params - just passthru
Maybe a future inject/remove some headers? (Perhaps even auth)
```
[
{
  "endpoint": "/api/{alpha}/beta",
  "verb": "GET"
  "target": {
    "targetType": "passthru",
    "targetURL": "http://someday/some/way",
  }
},
{
  "endpoint": "/api/{alpha}/gamma",
  "verb": "GET"
  "target": {
    "targetType": "zip",
    "targetLocation": "~/",
  }
}
]

/api/{alpha}/beta
```

## How this stuff works

### Passthru
Pretty dang simple - just pass it on through
- Consider an option to modify headers, the method, and even the payload
- Timeout may need to be significantly increased
- Same approach is leveraged for other choices - after the container has been created

### Zip file
- Write a lambda and zip it up - just like you're going to upload it in the AWS Console
- Use the Lambda runtime image as the base image
- Create the appropriate entries in `config.json`
- unzip the file into a specific directory
- Make a proxy call from localmotive to the newly launched docker container
- TODO: Clean up the container when done



## Other
dunno

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