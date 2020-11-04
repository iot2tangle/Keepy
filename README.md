# Keepy

Keepy is a small Nodejs application that sits in front of the Streams Gateway to receive sensors' data and return it on demand. It basically mounts an endpoint you can POST data to. The data is stored on Streams and a local Database that keeps an association between each data set and the Streams channel id containing it. You can query Keepy for a certain number of datasets (i.e. the last one) on a given channel and get an immediate response from the local database, including the datasets requested and their channel ids. This way you get fast read times and the ability to validate the data  integrity against the Tangle.

You can run Keepy on your local computer, a Raspberry or a VPS. 

**Important:** Keepy will only work with the [Streams HTTP Gateway on the return_channel_id branch](https://github.com/iot2tangle/Streams-http-gateway/tree/return_channel_id). While installing the Gateway, be sure to clone that branch:

```
git clone --branch return_channel_id https://github.com/iot2tangle/Streams-http-gateway.git
```

## Preparing the system

Assuming you are on a fresh VPS you will need to install Git, Nodejs, NPM and Mysql. Feel free to skip those you know are already installed on your system.

```
apt update
apt install git nodejs npm mysql-server
```

Next, we will secure our Mysql Server. Here you will be able to define your user password, which will be needed later.

```
mysql_secure_installation
```

## Installation

Get the Keepy repository from the I2T Hub 

```
git clone https://github.com/iot2tangle/Keepy.git
```

Head to the Keepy directory and run this command to import the database and tables that Keepy use.

```
mysql -u root -p < keepy.sql
```

Edit the database-config.js to provide the correct database name (by default, "keepy"), mysql user and password.

```
nano database-config.js
```

Run npm install to get all the needed Nodejs modules and then run Keepy with ENV variables

```
npm install # installs the dependencies from npm
GATEWAY_URL=http://95.216.203.91:8080/sensor_data node index.js

```

## Endpoints

Bu default, Keepy runs on the port 3002. You can change that on the **index.js** file. 

### POST `/messages`

Before pointing your sensors to Keepy, you can test it with Postman or using the following payload.

`  
curl --location --request POST 'KEEPY_IP:3002/messages'   
--header 'Content-Type: application/json'   
--data-raw '{
    "iot2tangle": [
        {
            "sensor": "Gyroscope",
            "data": [
                {
                    "x": "4514"
                },
                {
                    "y": "244"
                },
                {
                    "z": "-1830"
                }
            ]
        },
        {
            "sensor": "Acoustic",
            "data": [
                {
                    "mp": "1"
                }
            ]
        }
    ],  
    "device": "DEVICE_ID_1",  
    "timestamp": 1558511111  
}'  
`  

If the data is valid (validation is performed in the Streams HTTP Gateway, the validation messages are re-routed), the resulting data will be inserted into the database.

### GET `/messages`

Returns all the available messages stored in the database, sorted by descending order.

### GET `/messages?limit=20`

Returns the last 20 messages stored in the database, sorted by descending order. You can specify the limit parameter to the number of messages you wish to retrieve.

### GET `/messages/last`

Returns the last message stored in the database, sorted by descending order.

## Tweak it!
Keepy has been code in an as easy as possible fashion to perform a very specific task. We were going to code it in Rust, but instead went with Nodejs to allow users to easily adapt it to their needs. 

Have fun!
