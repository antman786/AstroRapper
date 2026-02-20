const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`AstroRapper API listening on port ${config.port}`);
  console.log(`Astrolog binary: ${config.astrologPath}`);
});
