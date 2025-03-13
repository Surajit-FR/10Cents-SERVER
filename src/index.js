// import dotenv from "dotenv";
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const connectDB = require('./db/db');
const http = require('http');
const { app } = require('./app');


const server = http.createServer(app);

connectDB().then(() => {
    server.on("error", (error) => {
        console.log(`Server Connection Error: ${error}`);
    });
    server.listen(process.env.PORT || 5500, () => {
        console.log(`⚙️  Server Connected On Port: ${process.env.PORT}\n`);
    });
}).catch((err) => {
    console.log("MongoDB Connection Failed!!", err);
});