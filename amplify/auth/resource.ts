import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['admin','sabadell','purificacion','astara','desigual','hipoges','mahou','marykay','nmprogram','naturgy','rba','redofisat','renault','svhcac','vantagetowers'],
  userAttributes: {
    // specify a "givenName" attribute
    givenName: {
      mutable: true,
      required: false,
    }
  },
  multifactor: {
    mode: 'REQUIRED',
    totp: true
  }
});