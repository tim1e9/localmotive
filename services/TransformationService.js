
const getPathParameters = (pathTemplate, pathInvoked) => {
  const params = {};
  try {
    const templateParts = pathTemplate.split('/');
    const invokedParts = pathInvoked.split('/');
    for(let i=1; i < templateParts.length; i++) {
      const curTemplatePart = templateParts[i];
      const curInvokedPart = invokedParts[i];
      if (curTemplatePart.startsWith('{') && curTemplatePart.endsWith('}')) {
        const pathVarName = curTemplatePart.substring(1, curTemplatePart.length-1);
        params[pathVarName] = curInvokedPart;
      }
    }
  } catch(exc) {
    console.log(`Path parameters could not be parsed: ${exc.message}`);
  }
  return params;
}

const convertHttpRequestToLambdaPayload = (req, targetEndpoint) => {

  const payload = {
    "resource": req.path,
    "path": req.path,
    "httpMethod": req.method,
    "headers": req.headers,
    "multiValueHeaders": {},
    "queryStringParameters": req.query,
    "multiValueQueryStringParameters": {},
    "requestContext": {
      "accountId": "123456789012",
      "apiId": "abdc1234",
      "authorizer": {
        "claims": null,
        "scopes": null
      },
      "domainName": req.host,
      "domainPrefix": "unsure",
      "extendedRequestId": "avcd1234-extended-id",
      "httpMethod": req.method,
      "identity": {},
      "path": req.path,
      "protocol": "HTTP/1.1",
      "requestId": "id=abcd1234",
      "requestTime": "04/Mar/2020:19:15:17 +0000",
      "requestTimeEpoch": Date.now(),
      "resourceId": null,
      "resourcePath": "/my/path",
      "stage": "$default"
    },
    "pathParameters": getPathParameters(targetEndpoint.path, req.path),
    "stageVariables": null,
    "body": JSON.stringify(req.body),
    "isBase64Encoded": false
  };
  return JSON.stringify(payload);
};

export { convertHttpRequestToLambdaPayload };