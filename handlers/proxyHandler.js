
const handleContainerRequest = async (host, port, optionalEndpoint, payload) => {
  try {
    const endpoint = optionalEndpoint ? optionalEndpoint : '/2015-03-31/functions/function/invocations';
    const url = `http://${host}:${port}${endpoint}`;
    const parms = {
      // headers: req.headers,
      method: 'POST',
      body: JSON.stringify(payload)
    };
    const proxyResponse = await fetch(url, parms);
    const proxyContent = await proxyResponse.text();
    return {
      status: proxyResponse.status,
      result: proxyContent
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
const handleExternalRequest = async (req, config, _settings) => {
  try {
    const url = config.url;
    const parms = {
      headers: req.headers,
      method: config.method
    };
    if (req.method == 'POST' || req.method == 'PUT') {
      parms[body] = req.body;
    }
    const proxyResponse = await fetch(url);

    return {
      status: proxyResponse.status,
      result: await proxyResponse.text()
    }
  } catch(exc) {
    const msg = `Exception when making a proxy call to a function: ${exc.message}`;
    console.error(msg);
    return {
      status: 500,
      result: msg
    }
  }

};

export { handleContainerRequest, handleExternalRequest }