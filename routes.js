const pool = require("./database-config");
const fetch = require("node-fetch");
const _ = require("lodash");

const router = (app) => {
  app.get("/", (request, response) => {
    response.send({
      message: "Hello",
    });
  });

  app.get("/messages", (request, response) => {
    const limit = request.query.limit;
    const channelId = request.query.channelId;

    const channelIdString = channelId
      ? ` WHERE channelId = "${channelId}"`
      : "";

    pool.query(
      `SELECT * FROM messages${channelIdString} ORDER BY id DESC${
        limit ? ` LIMIT ${limit}` : ""
      }`,
      (error, result) => {
        if (error) {
          throw error;
        }

        response.send(result);
      }
    );
  });

  app.get("/messages/last", (request, response) => {
    pool.query(
      "SELECT * FROM messages ORDER BY id DESC LIMIT 1;",
      (error, result) => {
        if (error) {
          throw error;
        }

        response.send(result);
      }
    );
  });

  app.post("/messages", async (request, response) => {
    if (_.isEmpty(request.body)) {
      return response.status(500).send(`Bad request`).end();
    }

    try {
      const gatewayResponse = await fetch(process.env.GATEWAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          api_key: `${process.env.GATEWAY_API_KEY}`,
          ...request.body,
        },
      });

      const channelId = await gatewayResponse.text();

      const data = {
        dataset: JSON.stringify(...request.body),
        channelId,
      };

      pool.query("INSERT INTO messages SET ?", data, (error, result) => {
        if (error) {
          console.log("error", error);
        }

        response.status(201).send(`User added with ID: ${result.insertId}`);
      });
    } catch (error) {
      console.log("error", error);
    }
  });
};

// Export the router
module.exports = router;
