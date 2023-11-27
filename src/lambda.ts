import awsLambdaFastify from 'aws-lambda-fastify'
import { init } from './app'

async function createHandler () {
  const app = await init()
  return awsLambdaFastify(app)
}

module.exports.handler = createHandler()
