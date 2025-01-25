
exports.handler = async (event) => {

  const queries = event.queryStringParameters;
  const msg = queries?.name;
  const extraMessage = process.env.extraMessage;
  const reply = msg ? `Hello, ${msg}! ${extraMessage}` : `I received no name, but I am still saying hello! ${extraMessage}`;
  const response = {
    statusCode: 200,
    body: JSON.stringify({result: reply}),
  };
  return response;
};
