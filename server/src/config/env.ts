interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
  NODE_ENV: string;
  JWT_SECRET?: string;
}

export const envConfig: EnvConfig = {
  PORT: parseInt(process.env.PORT || "3000"),
  MONGODB_URI: process.env.MONGODB_URI || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
};

export const validateEnv = (): void => {
  const requiredVars = ["MONGODB_URI"];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌  ${varName} mütləqdir`);
      process.exit(1);
    }
  }

  console.log("✅ Env dəyişənləri təsdiqləndi");
};
