import { Client, Account } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
  .setProject("YOUR_PROJECT_ID"); // Your project ID

export const account = new Account(client);
