# Netlify Addon example using serverless framework

Uses serverless framework and DynamoDB for an example provider integration.

## About

See `/lib/` for the functions that `Create/Get/Update/Delete` instances

The API is deployed through `serverless.yml` into AWS. The service used lambda functions and API gateway and instance info is persisted in DynamoDB.

See `functions` in `serverless.yml` to see how the endpoints are wired up


## (Devops) How to deploy this service

1. Install dependencies

  ```bash
  npm install
  ```

  [Install & setup the serverless framework for AWS](https://serverless.com/framework/docs/providers/aws/guide/quick-start/).

2. Set AWS credentials

  [Getting AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

  ```bash
  export AWS_ACCESS_KEY_ID=<your-key-here>
  export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
  ```

3. Deploy

  ```bash
  npm run deploy
  ```
