
exports.handler = async (event) => {

  const queries = event.queryStringParameters;
  const msg = queries?.name;
  const reply = msg ? `Hello, ${msg}!` : `I received no name, but I am still saying hello!`;
  const response = {
    statusCode: 200,
    body: JSON.stringify({result: reply}),
  };
  return response;

  return response;
};
