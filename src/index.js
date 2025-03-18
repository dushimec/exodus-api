// index.js
import app from "../app.js";
import { connectToDatabase } from "../src/config/databaseConnection.js";
import "dotenv/config"

connectToDatabase();
const PORT = process.env.PORT || 3000; // Change to a non-privileged port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app

