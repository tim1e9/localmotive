
// Go through the various "stuff" that Lambda can access

exports.handler = async (event, _context) => {
  console.log("Did someone ask for a hot dog?");
  const numHD = Math.floor(Math.random() * 2000);

  const response = {
    statusCode: 200,
    body: JSON.stringify({result: `I am sending you ${numHD} hotdog(s).`}),
  };
  return response;
};
