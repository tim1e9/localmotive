# Use the AWS-provided Node.js base image
FROM public.ecr.aws/lambda/python:latest

# Copy the function code to the container
COPY lambda_function.py ${LAMBDA_TASK_ROOT}

# Command to run the Lambda function
CMD ["lambda_function.lambda_handler"]
