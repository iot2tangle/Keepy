# Keepy
A Nodejs Streams Gateway Keeper

## Preparing the system

Install Git, Nodejs, NPM and Mysql

```
apt install git nodejs npm  mysql-server
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

Config the Database information

```
nano database-config.js
```

Run Keepy

```
node index.js
```
