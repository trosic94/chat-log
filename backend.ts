import express, { Router } from "express";
import { createClient } from "graphql-ws";
import knexFactory from "knex";
import { join } from "path";
import "pg";
import WebSocket from "ws";

async function start() {
  const knex = knexFactory({
    client: "pg",
    connection: {
      host: "postgres",
      user: "postgres",
      password: "password",
      database: "postgres",
      charset: "utf8",
    },
    migrations: {
      directory: join(__dirname, "migrations"),
    },
  });

  await knex.migrate.latest();

  const app = express();

  const router = Router();

  app.use("/api", router);

  app.use((req, res) => res.send(`${req.path} not found`));

  // eslint-disable-next-line no-unused-vars
  app.use((error, _req, res, _next) => {
    console.log("expressError", error);
    res.json(error);
  });

  app.listen(80);

  const client = createClient({
    url: "wss://api.stake.com/websockets",
    webSocketImpl: WebSocket,
  });

  client.subscribe(
    {
      // english chat room
      query: `subscription {
        chatMessages(chatId: "f0326994-ee9e-411c-8439-b4997c187b95") {
          createdAt
          data {
            ... on ChatMessageDataText {
              message
            }
          }
        }
      }`,
    },
    {
      async next(data) {
        type Message = {
          createdAt: string;
          data: null | { message: string };
        };

        const message = data.data.chatMessages as Message;

        if (!message.data) return;

        await knex("message").insert({
          message: message.data.message,
          created_at: new Date(message.createdAt),
        });
      },
      error(error) {
        console.log("subscriptionError", error);
      },
      complete() {
        console.log("subscriptionComplete");
      },
    }
  );

  router.get("/last-message", async (_req, res) => {
    const [lastMessage = null] = await knex("message")
      .orderBy("created_at", "desc")
      .limit(1);

    res.json(lastMessage);
  });
}

start().catch((e) => {
  console.log("handlerError", e);
  process.exit(1);
});
