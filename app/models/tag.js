const client = require("../config/db");

module.exports = {
  async findAllWithEvents() {
    const result = await client.query("SELECT get_all_tag_with_event()");

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows.map(
      (tagWithEvents) => tagWithEvents.get_all_tag_with_event
    );
  },

  async findAll() {
    const preparedQuery = {
      text: `
          SELECT *
          FROM public.tag
        `,
    };

    const result = await client.query(preparedQuery);

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  },

  async findByPk(tagId) {
    const preparedQuery = {
      text: `
          SELECT *
          FROM public.tag
          WHERE id = $1
        `,
      values: [tagId],
    };
    const result = await client.query(preparedQuery);
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  },
};
