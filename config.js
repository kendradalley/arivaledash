module.exports = {
  TOKEN_SECRET: process.env.TOKEN_SECRET || 'thebestsecretpassword',
  MONGODB_URI: process.env.MONGO_URI_MOOD || 'localhost',
  HS_SECRET: process.env.HS_SECRET || 's3AwsN8kxkKHHe1b5wv64-eI'
}