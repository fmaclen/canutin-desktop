import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();

// Basic route to test the server can reach the database
app.get("/", async (req, res) => {
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
