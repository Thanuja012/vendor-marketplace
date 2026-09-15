require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  connectRedis();
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
};

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
