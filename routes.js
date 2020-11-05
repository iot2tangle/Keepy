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
    const limitString = limit ? ` LIMIT ${limit}` : "";

    pool.query(
      `SELECT * FROM messages${channelIdString} ORDER BY id DESC${limitString}`,
      (error, result) => {
        if (error) {
          throw error;
        }
        
        let formattedResults = [];
        
        result.forEach(element => {
          try {
            const message = JSON.parse(element.message)

            formattedResults.push({
              id: element.id,
              channelId: element.channelId,
              message,
           })
         } catch(error) {
            formattedResults.push({
              id: element.id,
              channelId: element.channelId,
              message: element.message
            })
         }
        });

        response.send(formattedResults);
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

        let formattedResult;
        
        try {
           formattedResult = {
            id: result[0].id,
            message: JSON.parse(result[0].message),
            channelId: result[0].channelId
          }
        } catch(error) {
          formattedResult = {
            id: result[0].id,
            message: result[0].message,
            channelId: result[0].channelId
          }
        }

        response.send(formattedResult);
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
        body: JSON.stringify(request.body),
      });

      const channelId = await gatewayResponse.text();

      const data = {
        message: JSON.stringify(request.body),
        channelId,
      };

      pool.query("INSERT INTO messages SET ?", data, (error, result) => {
        if (error) {
          console.log("query error", error);
        }

        response.status(201).send(`Message added with ID: ${result.insertId}`);
      });
    } catch (error) {
      console.log("error", error);
      response.status(500).send("Something went wrong!");
    }
  });
};

// Export the router
module.exports = router;
