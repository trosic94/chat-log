exports.up = async (knex) => {
    await knex.schema.table("message", (t) => {
        t.text("id");
    });
};

exports.down = async () => { };