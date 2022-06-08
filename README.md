# chat log

website: `https://stake.com`
api: `https://api.stake.com/websockets`
graphQL documentation: `https://api.justsendit.club/graphql`

## get started

```
yarn install
yarn start
```

open `http://localhost` in the browser to open the frontend.

## tasks

the codebase is currently just a skeleton that demonstrates how to subscribe to the stake.com API and expose that data to a frontend.
our support team wants to be able to search the chat messages for certain words and filter them by user names.
for your convenience there is a postgres database setup, but feel free to replace it with any database you prefer.

- add endpoint for search in messages and wire it up in the react app
- subscribe to user data as well, store it in the database and add a GUI to filter by user names
- we currently only subscribe to chat messages, there are different message types (Message.data is a graphQL union type). write tip messages to the database as well.

feel free to reach out if you got further questions.
