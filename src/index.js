const app = require('./service.js');

const port = process.argv[2] || 3000;
const metrics = require('./metrics.js');

app.listen(port, () => {
  metrics.sendMetricsPeriodically(10000)
  console.log(`Server started on port ${port}`);
});
 