
// Handle the different types of proxies: Lambda and straight passthru

const proxyLambdaRequest = async (targetEndpoint, payload) => {
  try {
    const externalPort = targetEndpoint.function.externalPort;
    const host = targetEndpoint.function.host;
    const modifiedHost = host ? host : 'localhost';
    const endpoint = '/2015-03-31/functions/function/invocations';
    const url = `http://${modifiedHost}:${externalPort}${endpoint}`;
    const parms = {
      method: 'POST', // Always POST for a target payload
      body: payload
    };
    console.log(`Making proxy lambda call to ${url}`);
    const lambdaResponse = await fetch(url, parms);
    const lambdaContent = await lambdaResponse.text();
    // This gets odd
    const jsonContent = JSON.parse(lambdaContent);
    const statusCode = jsonContent.statusCode;
    const bodyContent = jsonContent.body;
    return {
      status: statusCode,
      result: bodyContent
    }
  } catch(exc) {
    const msg = `Exception when invoking function: ${exc.message}`;
    console.error(msg);
    return {
      status: 500,
      result: msg
    }
  }
};


// Make a passthru (proxy) request to something else
const proxyPassthruRequest = async (req, targetEndpoint) => {
  try {
    const url = targetEndpoint.function.url;
    const parms = {
      headers: req.headers,
      method: targetEndpoint.function.method
    };
    if (req.method == 'POST' || req.method == 'PUT') {
      parms[body] = req.body;
    }
    const passthruResponse = await fetch(url);

    return {
      status: passthruResponse.status,
      result: await passthruResponse.text()
    }
  } catch(exc) {
    const msg = `Exception when making a passthru call: ${exc.message}`;
    console.error(msg);
    return {
      status: 500,
      result: msg
    }
  }

};

export { proxyLambdaRequest, proxyPassthruRequest }