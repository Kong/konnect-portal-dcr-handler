import awsLambdaFastify from 'aws-lambda-fastify'
import { init } from './app'

async function createHandler () {
  const app = await init({ isLambda: true })
  return awsLambdaFastify(app)
}

module.exports.handler = createHandler()
