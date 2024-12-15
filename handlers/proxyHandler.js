
// Make a passthru (proxy) request to something else
const handleRequest = async (req, config, _settings) => {
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

export { handleRequest }