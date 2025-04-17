// import dotenv from "dotenv";
import dotenv from'dotenv';
import http from 'http';
import connectDB from './db/db.js';
dotenv.config({ path: './.env' });
import  app  from './app.js';


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