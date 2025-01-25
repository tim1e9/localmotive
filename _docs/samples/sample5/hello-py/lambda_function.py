import os
import json

def lambda_handler(event, context):

  queries = event['queryStringParameters']
  msg = queries['name'] if queries else ""
  extra_message = os.environ['extraMessage']
  if (msg):
    reply = "Hello " + msg + "! " + extra_message
  else:
    reply = "I received no name, but I am still saying hello!" + extra_message
  
  response = {
    "statusCode": 200,
    "body": json.dumps({"result": reply})
  }
  return response