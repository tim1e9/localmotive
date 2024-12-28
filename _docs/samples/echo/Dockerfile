# Use the AWS-provided Node.js base image
FROM public.ecr.aws/lambda/nodejs:latest

# Copy the function code to the container
COPY index.js ${LAMBDA_TASK_ROOT}

# Command to run the Lambda function
CMD ["index.handler"]
