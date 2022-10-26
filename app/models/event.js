const client = require("../config/db");
const { ApiError } = require("../services/errorHandler");
const tagDataMapper = require("../models/tag.js");

module.exports = {
  async findAll() {
    const result = await client.query("SELECT get_all_events_with_infos()");
    if (!result)
      if (result.rowCount === 0) {
        return null;
      }

    return result.rows.map(
      (allEventsWithInfo) => allEventsWithInfo.get_all_events_with_infos
    );
  },

  async findByPin(userId) {
    const preparedQuery = {
      text: `SELECT 
        events.id,
        events.title,
        events.start,
        events.media,
        events.start,
        events.slug
      FROM user_pin_event
          JOIN event as events ON user_pin_event.code_event = events.id
      WHERE code_user = $1`,
      values: [userId],
    };

    const result = await client.query(preparedQuery);
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  },

  async findByAttend(userId) {
    const preparedQuery = {
      text: `SELECT 
      events.id,
      events.title,
      events.start,
      events.media,
      events.start,
      events.slug
    FROM user_attend_event
        JOIN event as events ON user_attend_event.code_event = events.id
    WHERE code_user = $1`,
      values: [userId],
    };

    const result = await client.query(preparedQuery);
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  },

  async findByPk(eventId) {
    const preparedQuery = {
      text: `
          SELECT *
          FROM public.event
          WHERE id = $1
        `,
      values: [eventId],
    };
    const result = await client.query(preparedQuery);
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows[0];
  },

  async findBySlug(eventSlug) {
    const preparedQuery = {
      text: `
        SELECT get_event_with_infos($1)
        `,
      values: [`${eventSlug}`],
    };
    const result = await client.query(preparedQuery);
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows.map(
      (eventWithInfo) => eventWithInfo.get_event_with_infos
    );
  },

  async findByTitle(eventParams) {
    const preparedQuery = {
      text: `
          SELECT *
          FROM public.event
          WHERE title ILIKE $1
        `,
      values: [`%${eventParams}%`],
    };

    const result = await client.query(preparedQuery);

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  },

  async findByTagId(tagId) {
    const tag = await tagDataMapper.findByPk(tagId);
    if (!tag) {
      throw new ApiError("Tag not found", { statusCode: 404 });
    }

    const result = await client.query(`SELECT get_event_by_tag($1)`, [tagId]);
    if (result.rowCount === 0) {
      return null;
    }

    return result.rows.map((eventByTag) => eventByTag.get_event_by_tag);
  },

  async insert(event) {
    const fields = Object.keys(event).map((props) => `${props}`);
    const fieldsToken = Object.keys(event).map((_, index) => `$${index + 1}`);
    const values = Object.values(event);

    const savedEvent = await client.query(
      `
            INSERT INTO public.event (${fields}) VALUES (${fieldsToken})
            RETURNING *
        `,
      [...values]
    );
    return savedEvent.rows[0];
  },

  async pinEvent(userId, eventId) {
    const pinEvent = await client.query(
      `
      INSERT INTO public.user_pin_event (code_user, code_event) VALUES ($1, $2)
      RETURNING *
      `,
      [userId, eventId]
    );
    return pinEvent.rows;
  },

  async unpinEvent(userId, eventId) {
    const unpinEvent = await client.query(
      `
    DELETE FROM public.user_pin_event 
    WHERE code_user= $1 AND code_event=$2
    `,
      [userId, eventId]
    );

    return !!unpinEvent.rowCount;
  },

  async pinAttendEvent(userId, eventId) {
    const pinAttendEvent = await client.query(
      `
        INSERT INTO public.user_attend_event (code_user, code_event) VALUES ($1, $2)
        RETURNING *
        `,
      [userId, eventId]
    );
    return pinAttendEvent.rows;
  },

  async unpinAttendEvent(userId, eventId) {
    const unpinAttendEvent = await client.query(
      `
        DELETE FROM public.user_attend_event 
        WHERE code_user= $1 AND code_event=$2
        `,
      [userId, eventId]
    );

    return !!unpinAttendEvent.rowCount;
  },

  async update(id, event) {
    const fields = Object.keys(event).map(
      (prop, index) => `"${prop}" = $${index + 1}`
    );
    const values = Object.values(event);
    const preparedQuery = {
      text: `
        UPDATE public.event SET
        ${fields}, update_at = CURRENT_TIMESTAMP
        WHERE id = $${fields.length + 1}
        RETURNING *        
        `,
      values: [...values, id],
    };

    const result = await client.query(preparedQuery);

    return result.rows[0];
  },

  async delete(id) {
    const preparedQuery = {
      text: `
          DELETE
          FROM public.event
          WHERE id = $1
        `,
      values: [id],
    };

    const result = await client.query(preparedQuery);

    return !!result.rowCount;
  },
};
