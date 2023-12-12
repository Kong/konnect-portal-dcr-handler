// This file is the Lambda handler
// it wraps the fastify application in the `@fastify/aws-lambda` wrapper
// to be able to execute the lambda request as an http call
// more informations on: https://github.com/fastify/aws-lambda-fastify

import awsLambdaFastify from '@fastify/aws-lambda'
import { init } from './app'

async function createHandler () {
  const app = await init()
  return awsLambdaFastify(app)
}

const fastifyHandler = createHandler()

export const handler = async (event, context) => {
  const proxy = await fastifyHandler
  return proxy(event, context)
}
