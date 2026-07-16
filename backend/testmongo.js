const { MongoClient } = require('mongodb');

const uri = "mongodb://akashguptaa0702_db_user:xWtnIr70q2L0hDwe@akash007-shard-00-00.ohyg3b1.mongodb.net:27017,akash007-shard-00-01.ohyg3b1.mongodb.net:27017,akash007-shard-00-02.ohyg3b1.mongodb.net:27017/skillhub?ssl=true&replicaSet=atlas-ohyg3b-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Akash007";
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
  } catch (err) {
    console.error("RAW CONNECTION ERROR:", err);
  } finally {
    await client.close();
  }
}
run();
