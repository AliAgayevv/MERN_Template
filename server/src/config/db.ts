import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log("MongoDB artıq bağlıdır");
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || "";

      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // IPv4
      };

      await mongoose.connect(mongoUri, options);

      this.isConnected = true;
      console.log("✅ MongoDB-yə uğurla bağlandı");
      console.log(`📍 Database: ${mongoose.connection.name}`);

      this.setupEventListeners();
    } catch (error) {
      console.error("❌ MongoDB bağlantı xətası:", error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("MongoDB bağlantısı kəsildi");
    } catch (error) {
      console.error("MongoDB bağlantısını kəsmək xətası:", error);
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  private setupEventListeners(): void {
    mongoose.connection.on("connected", () => {
      console.log("🔗 Mongoose MongoDB-yə bağlandı");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("❌ Mongoose MongoDB bağlantısı kəsildi");
      this.isConnected = false;
    });

    mongoose.connection.on("error", (err) => {
      console.error("🚨 MongoDB bağlantı xətası:", err);
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 Mongoose MongoDB-yə yenidən bağlandı");
      this.isConnected = true;
    });
  }
}

export default Database;
