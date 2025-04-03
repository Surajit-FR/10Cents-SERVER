const mongoose = require("mongoose");
const { DB_NAME } = require("../constants");
// const { DBInfo } = require("../../types/commonType");

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect("mongodb+srv://georgesteve31019:g4yoassTjrhxnMdl@ariprodesigns.zohzg3t.mongodb.net/10cents")
        //current date and time
        const currentDate = new Date().toLocaleString();
        const dbInfo = {
            STATUS: "Connected",
            HOST: connectionInstance.connection.host,
            DATE_TIME: currentDate,
        }
        console.log("\n🛢  MongoDB Connection Established");
        console.table(dbInfo);
    } catch (error) {
        console.log("MongoDB Connection Error", error);
        process.exit(1);
    }
};

module.exports = connectDB;