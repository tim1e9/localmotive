import * as functionManager from "../services/FunctionManager.js"

const handleRequest = async (req, config, settings) => {
  try {

    // Either verify that a container is running, or launch it via a call to getFunction()
    const functionConfig = {...config, settings}
    const functionDetails = await functionManager.getFunction(functionConfig);

    // Now that the container has been started, proxy a request to it
    const url = `http://localhost:${functionDetails.port}/2015-03-31/functions/function/invocations`;
    const parms = {
      // headers: req.headers,
      method: 'POST',
      body: JSON.stringify({"foo": "bar"}) // req.body
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

export { handleRequest }