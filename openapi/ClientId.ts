/* eslint-disable */
/**
 * This file was automatically generated.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema in the source OAS file,
 * and use `yarn brij dto` to regenerate this file.
 */

import { JSONSchema } from '@kong/brij'

/**
 * ID of the application in the IDP. This is the ID used accross
 * the system and is unique. The format can vary between IDPs.
 *
 */
export type ClientId = string


class ClientIdSchema extends JSONSchema {
  constructor() {
    super({
      "type": "string",
      "description": "ID of the application in the IDP. This is the ID used accross\nthe system and is unique. The format can vary between IDPs.\n",
      "example": "cb9z3HSYhw"
    })
  }
}

export const ClientId = new ClientIdSchema()
