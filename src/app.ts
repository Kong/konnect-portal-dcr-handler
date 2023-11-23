import fastify from 'fastify'
import { createApplicationHandler, deleteApplicationHandler, createNewSecretHandler, postEventHookHandler } from './handlers/handler'
import { type ApplicationPayload, ApplicationPayloadSchema } from '../openapi/ApplicationPayload'
import { type ClientSecret, ClientSecretSchema } from '../openapi/ClientSecret'
import { type EventHook, EventHookSchema } from '../openapi/EventHook'

function init() {
const app = fastify({ logger: true })
  app.post<{ Body: ApplicationPayload }>('/', {
    schema: {
      body: ApplicationPayloadSchema
    },
    handler: createApplicationHandler
  })

  app.delete('/:application_id', {handler: deleteApplicationHandler})

  app.post('/:application_id/new-secret', {handler: createNewSecretHandler})

  app.post<{ Body: EventHook }>('/:application_id/event-hook',
      {
        schema: {
          body: EventHookSchema
        },
        handler: postEventHookHandler
      })

  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      reply.status(400).send({
        error: 'Bad Request',
        error_description: error.validation
      })
    } else {
      console.log(error)
      reply.status(error.statusCode || 400).send({
        error: error.name,
        error_description: error.message
      })
    }
  })

  return app
}

if (require.main === module) {
  init().listen(3000, '0.0.0.0', (err) => {
    if (err) console.error(err)
  })
}else{
  module.exports = init
}

export default app

  try {
    await app.listen({ port: 3000 })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }


