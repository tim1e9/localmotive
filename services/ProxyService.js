import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';

// Events are published so that different types of loggers can jump in and do fun stuff
const PROXY_TOPIC_NAME = "ProxyEvent"
const proxyNotifier = new EventEmitter();
const publishProxyEvent = (evt) => {
  proxyNotifier.emit(PROXY_TOPIC_NAME, evt)
}

// Handle the different types of proxies: Lambda and straight passthru

const proxyLambdaRequest = async (targetEndpoint, payload) => {
  const uniqueID = randomUUID();
  let url = '';
  let parms = {};
  let bodyContent = null;
  try {
    const externalPort = targetEndpoint.function.externalPort;
    const host = targetEndpoint.function.host;
    const modifiedHost = host ? host : 'localhost';
    const endpoint = '/2015-03-31/functions/function/invocations';
    url = `http://${modifiedHost}:${externalPort}${endpoint}`;
    parms = {
      method: 'POST', // Always POST for a target payload
      body: payload
    };
    publishProxyEvent({
      url,
      parms, 
      transactionId: uniqueID
    });
    const lambdaResponse = await fetch(url, parms);
    const lambdaContent = await lambdaResponse.text();
    // This gets odd
    const jsonContent = JSON.parse(lambdaContent);
    const statusCode = jsonContent.statusCode;
    bodyContent = jsonContent.body;

    publishProxyEvent({
      url,
      response : {
        headers: lambdaResponse.headers,
        body: bodyContent
      },
      transactionId: uniqueID
    });

    return {
      status: statusCode,
      result: bodyContent
    }
  } catch(exc) {
    const msg = `Exception when invoking function: ${exc.message}`;
    console.error(msg);
    publishProxyEvent({
      url,
      response : {
        error: msg
      },
      transactionId: uniqueID
    });
    return {
      status: 500,
      result: msg
    }
  }
};


// Make a passthru (proxy) request to something else
const proxyPassthruRequest = async (req, targetEndpoint) => {
  const uniqueID = randomUUID();
  let url = '';
  let parms = {};
  let bodyContent = null;
  try {
    url = targetEndpoint.function.url;
    parms = {
      headers: req.headers,
      method: targetEndpoint.function.method
    };
    if (req.method == 'POST' || req.method == 'PUT') {
      parms[body] = req.body;
    }
    publishProxyEvent({
      url,
      parms, 
      transactionId: uniqueID
    });

    const passthruResponse = await fetch(url, parms);
    const lambdaContent = await passthruResponse.text()

    const jsonContent = JSON.parse(lambdaContent);
    const statusCode = jsonContent.statusCode;
    bodyContent = jsonContent.body;

    publishProxyEvent({
      url,
      response : {
        headers: response.headers,
        body: bodyContent
      },
      transactionId: uniqueID
    });

    return {
      status: statusCode,
      result: bodyContent
    }
  } catch(exc) {
    const msg = `Exception when making a passthru call: ${exc.message}`;
    console.error(msg);
    publishProxyEvent({
      url,
      response : {
        error: msg
      },
      transactionId: uniqueID
    });
    return {
      status: 400,
      result: msg
    }
  }
};

export { proxyLambdaRequest, proxyPassthruRequest, PROXY_TOPIC_NAME, proxyNotifier }