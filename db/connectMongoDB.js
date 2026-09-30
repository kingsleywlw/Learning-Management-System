import mongoose from "mongoose";

const connectMongoDB = async () => {
  if(mongoose.connections[0].readyState){
    return true;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Mongodb connected')
    return true;
  } catch (error) {
    console.log(error)
  }
}
export default connectMongoDB;