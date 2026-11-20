
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URI!);

const database = mongoClient.db("sharekit");

export const auth = betterAuth({
  database: mongodbAdapter(database, {
    client: mongoClient,
  }),

  baseURL: process.env.BETTER_AUTH_URL,

  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
    },
  },
});
