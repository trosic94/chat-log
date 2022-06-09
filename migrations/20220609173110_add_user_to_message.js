exports.up = async (knex) => {
    await knex.schema.table("message", (t) => {
        t.text("user");
    });
};

exports.down = async () => { };