import json
import random

def lambda_handler(event, context):
  print("Did someone ask for a hot dog?")
  num_hd = random.randint(0, 2000)
  message = "I am sending you {num_hd} hotdog(s)".format(num_hd=num_hd)
  response = {
    "statusCode": 200,
    "body": json.dumps({"result": message})
  }
  return response