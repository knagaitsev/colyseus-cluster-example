//
// This example shows how to use the "cluster" module with Colyseus.
//
// You must specify the `presence` option on Colyseus.Server when using multiple
// processes.
//

const os = require('os');
const cluster = require('cluster');
const http = require('http');
const colyseus = require('colyseus');

const MainRoom = require('./rooms/room.js');

const config = require('./../config.json');

const express = require('express');
const app = express();

const port = Number(process.env.PORT || config.serverDevPort);
const endpoint = "localhost";

if (cluster.isMaster) {
    // This only happens on the master server
    console.log("Starting master server.");
    console.log(`Running on Node.js ${process.version}.`);

    const cpus = os.cpus().length;
    for (let i = 0; i < cpus; ++i) {
        cluster.fork();
    }

} else {
    // This happens on the slave processes.

    // We create a new game server and register the room.
    const gameServer = new colyseus.Server({
        server: http.createServer(app),
        presence: new colyseus.MemsharedPresence()
    });

    gameServer.register("main", MainRoom);
    gameServer.listen(port);

    app.use(express.static(__dirname + "/../client/public", {
        extensions: "html"
    }));

    console.log(`Listening on ws://${endpoint}:${port}`)

    var production = process.env.NODE_ENV == "production";

    if (production) {

    }
    else {
        const livereload = require('livereload');

        const reloadServer = livereload.createServer({
            exts: [ 'js', 'html', 'css', 'png', 'json' ],
            debug: true
        });

        reloadServer.watch([__dirname + "/../client/public"]);
    }
}