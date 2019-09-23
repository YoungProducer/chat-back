// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// TODO(jannyHou): This should be moved to @loopback/authentication
export const UserProfileSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: {type: "number"},
    email: {type: "string"},
    name: {type: "string"},
  },
};

// TODO(jannyHou): This is a workaround to manually
// describe the request body of 'Users/login'.
// We should either create a Credential model, or
// infer the spec from User model

const CredentialsSchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
    },
    password: {
      type: "string",
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: "The input of login function",
  required: true,
  content: {
    "application/json": {schema: CredentialsSchema},
  },
};

const PatchingCredentialsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: {
      type: "number",
    },
    email: {
      type: "string",
      format: "email",
    },
    password: {
      type: "string",
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{5,512})",
      minLength: 8,
    },
    newPassword: {
      type: "string",
      pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{5,512})",
      minLength: 8,
    },
    tag: {
      type: "string",
    },
    firstName: {
      type: "string",
    },
    lastName: {
      type: "string",
    },
  },
};

export const PatchingRequestBody = {
  description: "The input of function for change id",
  required: true,
  content: {
    "application/json": {
      schema: PatchingCredentialsSchema,
    },
  },
};
