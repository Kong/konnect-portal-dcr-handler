export interface ApplicationResponse {
  /**
   * ID of the application in the IDP. This is the ID used accross
   * the system and is unique. The format can vary between IDPs.
   *
   */
  client_id: string
  /**
   * Secret of the application, this is used for the application to make
   * calls to the IDP and verify its identity. Konnect doesn't store this
   * data, if the secret is lost user should refresh the secret.
   *
   */
  client_secret: string
  /**
   * Date when the client_id has been created
   */
  client_id_issued_at?: string
  /**
   * Date when the client_id expires
   */
  client_secret_expires_at?: string
}

export const ApplicationResponseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    client_id: {
      type: 'string',
      description: 'ID of the application in the IDP. This is the ID used accross\nthe system and is unique. The format can vary between IDPs.\n',
      example: 'cb9z3HSYhw'
    },
    client_secret: {
      type: 'string',
      description: "Secret of the application, this is used for the application to make\ncalls to the IDP and verify its identity. Konnect doesn't store this\ndata, if the secret is lost user should refresh the secret.\n",
      example: '*8pNH%|(9PRH|r3q$#6!*z0B}jMbtQ]-'
    },
    client_id_issued_at: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the client_id has been created'
    },
    client_secret_expires_at: {
      type: 'string',
      format: 'date-time',
      description: 'Date when the client_id expires'
    }
  },
  required: [
    'client_id',
    'client_secret'
  ]
}
