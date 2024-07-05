import mongoose from "mongoose";
import "dotenv/config";
const connectDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB Connected"))
    .catch((error) => {
      console.log("DB cONNECTION FAILED");
      console.error(error);
    });
};
export default connectDB;
