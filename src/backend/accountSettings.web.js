/************
.web.js file
************

Backend '.web.js' files contain functions that run on the server side and can be called from page code.

Learn more at https://dev.wix.com/docs/develop-websites/articles/coding-with-velo/backend-code/web-modules/calling-backend-code-from-the-frontend

****/

import { Permissions, webMethod } from "wix-web-module";
import { members } from "wix-members-backend";
import wixSecretsBackend from "wix-secrets-backend";
import crypto from 'crypto'; // Import the crypto module

export const myGetMember = webMethod(
  Permissions.Anyone,
  (id, options) => {
    return members
      .getMember(id, options)
      .then((member) => {
        console.log(member)
        const slug = member.profile.slug;
        const name = `${member.contactDetails.firstName} ${member.contactDetails.lastName}`;
        const contactId = member.contactId;
        return member;
      })
      .catch((error) => {
        console.error(error);
      });
  },
);

export const myUpdateMember = webMethod(
  Permissions.Anyone,
  (id, member) => {
    return members
      .updateMember(id, member)
      .then((member) => {
        console.log('User info updated in the backend')
        return member;
      })
      .catch((error) => {
        console.error(error);
      });
  },
);

// Reference: https://dev.wix.com/docs/velo/api-reference/wix-secrets-backend/get-secret$0
export const encryptCardDigits = webMethod(
  Permissions.Anyone, 
  (cardDigits) => {
  return wixSecretsBackend
    .getSecret("ENCRYPTION_KEY")
    .then((secret) => {
      const algorithm = 'aes-256-cbc';
      const iv = crypto.randomBytes(16); // Initialization vector for encryption
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(secret, 'hex'), iv);

      let encrypted = cipher.update(cardDigits, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return iv.toString('hex') + ':' + encrypted; // Return IV + encrypted text
    })
    .catch((error) => {
      console.error(error);
    });
});