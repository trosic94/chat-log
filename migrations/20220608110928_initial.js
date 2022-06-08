exports.up = async (knex) => {
  await knex.schema.createTable("message", (table) => {
    table.text("message");
    table.timestamp("created_at");
  });
};

exports.down = async () => {};
