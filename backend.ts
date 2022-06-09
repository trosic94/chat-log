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
            id
            data {
              ... on ChatMessageDataText {
                message
              },
              ... on ChatMessageDataTip {
                messageTip : message
                tip{
                  id
                }
              }
            }
            user{
              name
            }
        }
      }`,
    },
    {
      async next(data) {
        type Message = {
          createdAt: string;
          data: null | { message: string };
          id: string;
          user: null | {name: string};
        };

        const message = data.data.chatMessages as Message;

        if (!message.data) return;

        await knex("message").insert({
          message: message.data.message,
          created_at: new Date(message.createdAt),
          id : message.id,
          user : message.user.name 
        });

        //client.dispose();
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

  router.get("/search-message", async (_req, res) => {
    let word,user;
    (_req.query.searchQuery ? (word = _req.query.searchQuery) : (word = ''));
    (_req.query.searchUser ? (user = _req.query.searchUser) : (user = ''));
    const searchMessage = await knex("message as m").select(knex.raw("to_char(created_at,'dd.mm.yyyy hh24:mi:ss') as datecreated,message,m.user,id"))
      .where(function() {
        this.whereRaw(`LOWER(m.message) LIKE LOWER(?)`, [`%${word}%`]).orWhereRaw(`'' LIKE LOWER(?)`, [`%${word}%`])
      })
      .where(function() {
        this.whereRaw(`LOWER(m.user) LIKE LOWER(?)`, [`%${user}%`]).orWhereRaw(`'' LIKE LOWER(?)`, [`%${user}%`])
      })
      .orderBy("created_at", "desc")
      .limit(10000);
      
    res.json(searchMessage);
  });
}

start().catch((e) => {
  console.log("handlerError", e);
  process.exit(1);
});
