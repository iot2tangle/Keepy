# Keepy

![Keepy!](https://iot2tangle.io/assets/screenshots/keepy_header.jpg)

Keepy is a small Nodejs application that sits in front of the Streams Gateway to receive sensors' data and return it on demand. It basically mounts an endpoint you can POST data to. The data is stored on Streams and a local Database that keeps an association between each data set and the Streams channel id containing it. You can query Keepy for a certain number of datasets (i.e. the last one) on a given channel and get an immediate response from the local database, including the datasets requested and their channel ids. This way you get fast read times and the ability to validate the data integrity against the Tangle.

You can run Keepy on your local computer, a Raspberry or a VPS.

**Important:** Keepy will only work with the [Streams HTTP Gateway on the return_channel_id branch](https://github.com/iot2tangle/Streams-http-gateway/tree/return_channel_id). While installing the Gateway, be sure to clone that branch:

```
git clone --branch return_channel_id https://github.com/iot2tangle/Streams-http-gateway.git
```

## Preparing the system

Assuming you are on a fresh VPS you will need to install Git, Nodejs, NPM and Mysql. Feel free to skip those you know are already installed on your system.

```
sudo apt update
sudo apt install git nodejs npm mysql-server
```

Next, we will secure our Mysql Server. Here you will be able to define your user password, which will be needed later.
You should answer "Yes" to most of the questions the script will do in order to get a secure/clean Mysql Server.

```
sudo mysql_secure_installation
```

By default, Keepy runs on the port 3002. We found that some Raspberries do not have that port available, so if you are going to be using the default port you may want to be sure it is open. Install **ufw**, enable it and allow traffic on the port 3002.
If you are installing Keepy on a VPS, this step is not needed.

```
sudo apt-get install ufw
sudo ufw enable 
sudo ufw allow 3002
```

## Keepy Installation

Get the Keepy repository from the I2T Hub

```
git clone https://github.com/iot2tangle/Keepy.git
```

Head to the Keepy directory and edit the **_keepy.sql_** file to setup your mysql user and password.
By default the user is **keepy** but you can change that.

```
CREATE USER 'keepy'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON * . * TO 'keepy'@'localhost';
ALTER USER 'keepy'@localhost IDENTIFIED WITH mysql_native_password BY 'your_password';
```

Once all the mysql related changes are done, run this command to import the database and tables needed by Keepy (it will ask for the mysql root password you set during the **_mysql_secure_installation_** configuration)

```
sudo mysql -u root -p < keepy.sql
```

Edit the **_database-config.js_** to provide the correct database name (by default, "keepy"), mysql user and password.

```
nano database-config.js
```

Run npm install to get all the needed Nodejs modules.

```
npm install 
```

Edit the .env.example file and set your Streams Gateway URL, port and endpoint. 
```
# Rename this file to .env
GATEWAY_URL=http://YOUR_GW_IP:8080/sensor_data
```

Then rename `.env.example` to `.env` to launch Keepy with the necessary ENV variables.

```
mv .env.example .env
```

Finally, run Keepy!

```
node keepy.js
```

You can now send POST/GET requests with your sensors data formatted with the I2T Standard to Keepy. Check the Endpoints section coming next to learn more about it. 

```
http://YOUR_KEEPY_HOST:3002/messages
```



## Endpoints

By default, Keepy runs on the port 3002. You can change that on the ***keepy.js*** file.

### POST `/messages`

Before pointing your sensors to Keepy, you can test it with Postman or using the following payload.

`curl --location --request POST 'YOUR_KEEPY_HOST:3002/messages' --header 'Content-Type: application/json' --data-raw '{ "iot2tangle": [ { "sensor": "Gyroscope", "data": [ { "x": "4514" }, { "y": "244" }, { "z": "-1830" } ] }, { "sensor": "Acoustic", "data": [ { "mp": "1" } ] } ], "device": "DEVICE_ID_1", "timestamp": 1558511111 }'`

[Note: When using Postman, send the data in the Body using the raw tab, and don't forget to specify the body as JSON(application/json)]

If the data is valid (validation is performed in the Streams HTTP Gateway, the validation messages are re-routed), the resulting data will be inserted into the database.

### GET `/messages`

Returns all the available messages stored in the database, sorted by descending order. It accepts the filters `limit`, which takes a number of elements, and `channelId`, which filters by Channel ID.

### GET `/messages?limit=20`

Returns the last 20 messages stored in the database, sorted by descending order. You can specify the limit parameter to the number of messages you wish to retrieve.

### GET `/messages?channelId=YOUR_CHANNEL_ID`

Returns the last 20 messages stored in the database, sorted by descending order. You can specify the limit parameter to the number of messages you wish to retrieve.

### GET `/messages?channelId=YOUR_CHANNEL_ID&limit=5`

Returns the last 5 messages that match the specified channelId, sorted by descending order.

### GET `/messages/last`

Returns the last message saved to the database.

## Tweak it!

Keepy has been coded in an as easy as possible fashion to perform a very specific task. We were going to code it in Rust, but instead went with Nodejs to allow users to easily adapt it to their needs.

Have fun!
