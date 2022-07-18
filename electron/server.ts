import express from "express";
import { PrismaClient } from "@prisma/client";

// import { handler } from "./build/handler.js";

const prisma = new PrismaClient();
const app = express();

// let SvelteKit handle everything else, including serving prerendered pages and static assets
// app.use(handler);

// add a route that lives separately from the SvelteKit app
app.get("/healthcheck", (req, res) => {
  res.end("ok");
});

// Basic route to test the server can reach the database
app.get("/db", async (req, res) => {
  const transactions = await prisma.transactionCategory.findMany();
  res.json(transactions);
});

let server: any;
export const startServer = () => {
  server = app.listen(process.env.SERVER_PORT, () => {
    console.log(
      `🚀 Server ready at: http://localhost:${process.env.SERVER_PORT}`
    );
  });
};

export const stopServer = () => {
  server.close();
};
