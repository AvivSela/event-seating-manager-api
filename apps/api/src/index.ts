import app from "./app";

const DEFAULT_PORT = 3000;

// Parse port from environment variable
const portFromEnv = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;

// Validate port number
const PORT = isNaN(portFromEnv) ? (() => {
  console.error('Invalid port number, using default port 3000');
  return DEFAULT_PORT;
})() : portFromEnv;

try {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error(error);
  throw error;
}
