import { PROXY_TOPIC_NAME, proxyNotifier } from './ProxyService.js';

const initProxyLogging = () => {
  proxyNotifier.on(PROXY_TOPIC_NAME, logReqResDetails);
}

const logReqResDetails = (msg) => {
  const { url, transactionId } = msg;
  delete msg.url;
  delete msg.transactionId;

  // For now, write this to the logs, but consider sending it to a file or a db
  console.log(`Event received.
    TXN=${transactionId}
    URL=${url},
    Details=${JSON.stringify(msg)}`);
}

export { initProxyLogging }