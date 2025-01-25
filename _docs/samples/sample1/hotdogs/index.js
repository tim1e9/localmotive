
exports.handler = async (event, _context) => {
  console.log("Did someone ask for a hot dog?");
  const numHD = Math.floor(Math.random() * 20);

  const response = {
    statusCode: 200,
    body: JSON.stringify({result: `I am sending you ${numHD} hotdog(s).`}),
  };
  return response;
};
