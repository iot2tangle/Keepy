const pool = require("./database-config");
const fetch = require("node-fetch");
const _ = require("lodash");

const router = (app) => {
  app.get("/", (_request, response) => {
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

  app.get("/messages/last", (_request, response) => {
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

    if (process.env.BUFFER_ENABLED === 'FALSE') {
      try {
        const gatewayResponse = await fetch(process.env.GATEWAY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request.body),
        });

        const channelId = await gatewayResponse.text();

        const data = {
          message: JSON.stringify(request.body),
          channelId
        };

        pool.query("INSERT INTO messages SET ?", data, (error, result) => {
          if (error) {
            return response.status(500).send('Error performing INSERT')
          }

          return response.status(201).send(`Message added with ID: ${result.insertId}`).end();
        });
      } catch (error) {
        return response.status(500).send("Something went wrong!");
      }

      return
    }

    const data = {
      message: JSON.stringify(request.body),
    };

    pool.query("INSERT INTO messages SET ?", data, (error, insertResult) => {
      if (error) {
        return response.status(500).send('Error performing INSERT')
      }

      pool.query("SELECT COUNT(*) AS channelIdCount FROM messages WHERE channelId IS NULL", (error, result) => {
        if (error) {
          return response.status(500).send('Error performing COUNT')
        }

        const countChannelId = result[0]['channelIdCount']
  
        if (countChannelId < process.env.BUFFER_SIZE) {
          return response.status(201).send(`Message added with ID: ${insertResult.insertId}`);
        }
        
        pool.query(
          `SELECT * FROM messages WHERE channelId IS NULL LIMIT ${process.env.BUFFER_SIZE}`,
          async (error, result) => {
            if (error) {
              return response.status(500).send('Error performing SELECT')
            }

            const formattedResults = result.map((item) => JSON.parse(item.message))
            const bundle = {
              "bundle": formattedResults
            }

            try {
              const gatewayResponse = await fetch(process.env.GATEWAY_BUNDLE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bundle),
              });

              if (gatewayResponse.status === 400) {
                return response.status(500).send(`Error: Gateway response: ${gatewayResponse.statusText}`)
              }

              if (gatewayResponse.status === 404) {
                return response.status(500).send(`Error: Gateway response: ${gatewayResponse.statusText}`)
              }
    
              const channelId = await gatewayResponse.text();
    
              if (channelId) {
                result.forEach((item) => {
                  pool.query(`UPDATE messages SET channelId = '${channelId}' WHERE ID = ${item.id}`, (error, result) => {
                    if (error) {
                      return response.status(500).send('Error performing UPDATE')
                    }
            
                  });
                });
                
                response.status(201).send(`All messages added with Channel ID: ${channelId}`);
              }
            } catch(error) {
              response.status(500).send('Error while using Gateway');
            }
          }
        );
      });
    });
  });
};

module.exports = router;