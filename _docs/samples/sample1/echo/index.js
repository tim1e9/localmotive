
// Go through the various "stuff" that Lambda can access

exports.handler = async (event, _context) => {
  console.log("I like to echo");
  const myEcho = JSON.stringify(event);

  const response = {
    statusCode: 200,
    body: myEcho
  };
  return response;
};
