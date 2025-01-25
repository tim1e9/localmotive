import os
import json

def lambda_handler(event, context):
  print("I like to echo")
  my_echo = json.dumps(event)
  
  response = {
    "statusCode": 200,
    "body": my_echo
  }
  return response