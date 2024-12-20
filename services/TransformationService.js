
const convertHttpRequestToLambdaPayload = (req) => {

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
    "pathParameters": null,
    "stageVariables": null,
    "body": JSON.stringify(req.body),
    "isBase64Encoded": false
  };
  return JSON.stringify(payload);
};

export { convertHttpRequestToLambdaPayload };