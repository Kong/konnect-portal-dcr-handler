import { type ApplicationResponse } from '../../openapi/ApplicationResponse'
import axios, { type AxiosResponse } from 'axios'

export async function createApplicationHandler (request, reply) {
  const payload = request.body

  const payloadOkta = {
    client_name: payload.client_name,
    redirect_uris: payload.redirect_uris,
    response_types: ['code', 'token', 'id_token'],
    grant_types: payload.grant_types,
    token_endpoint_auth_method: payload.token_endpoint_auth_method,
    application_type: 'web'
  }

  const headers = getHeaders(process.env.API_TOKEN)
  const response = await axios.post(
    process.env.OKTA_DOMAIN + 'oauth2/v1/clients',
    payloadOkta,
    { headers }
  )

  const application: ApplicationResponse = {
    client_id: response.data.client_id,
    client_id_issued_at: response.data.client_id_issued_at,
    client_secret: response.data.client_secret,
    client_secret_expires_at: response.data.client_secret_expires_at
  }
  reply.code(201).send({ application })
}

export async function deleteApplicationHandler (request, reply) {
  const id = request.params.application_id
  const headers = getHeaders(process.env.API_TOKEN)
  const response = await axios.delete(
    process.env.OKTA_DOMAIN + 'oauth2/v1/clients/' + id,
    { headers }
  )
  reply.code(204).send()
}

export async function createNewSecretHandler (request, reply) {
  const id = request.params.application_id
  const headers = getHeaders(process.env.API_TOKEN)
  const response = await axios.post(
    process.env.OKTA_DOMAIN + 'oauth2/v1/clients/' + id + '/lifecycle/newSecret',
    {},
    { headers }
  )

  reply.code(200).send({
    client_id: id,
    client_secret: response.data.client_secret
  })
}

export async function postEventHookHandler (request, reply) {
  reply.code(200).send()
}

function getHeaders (token: string) {
  return {
    Authorization: 'SSWS ' + token,
    accept: 'application/json',
    'Content-Type': 'application/json'
  }
}
