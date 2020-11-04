# Keepy

A Nodejs Streams Gateway Keeper

## Preparing the system

Install Git, Nodejs, NPM and Mysql

```
apt update
apt install git nodejs npm mysql-server
```

Setup the Mysql User password

```
mysql_secure_installation
```

Get the Keepy repo

```
git clone https://github.com/iot2tangle/Keepy.git
```

Head to the Keepy directory and create the DB

```
mysql -u root -p < keepy.sql
```

From the Keepy directory, config the database information (by default it uses root)

```
nano database-config.js
```

From the Keepy directory, run npm install and then run Keepy with ENV variables

```
npm install # installs the dependencies from npm
GATEWAY_URL=http://95.216.203.91:8080/sensor_data node index.js

```

You can use any Streams HTTP Gateway URL, you can even host your own.

## POST `/messages`

On default port 3002.

Example payload:

```
{ "iot2tangle": [ { "sensor": "Gyroscope", "data": [ { "x": "4514" }, { "y": "244" }, { "z": "-1830" } ] }, { "sensor": "Acoustic", "data": [ { "mp": "1" } ] } ], "device": "ESP32-HTTP", "timestamp": "1558511111" }
```

Using "content-type": "application/json".

If the data is valid (validation is performed in the Streams HTTP Gateway, the validation messages are re-routed), the resulting data will be inserted into the database.

## GET `/messages`

Returns all the available messages stored in the database, sorted by descending order.

## GET `/messages?limit=20`

Returns the last 20 messages stored in the database, sorted by descending order. You can specify the limit parameter to the number of messages you wish to retrieve.

## GET `/messages/last`

Returns the last message stored in the database, sorted by descending order.
