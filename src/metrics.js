const config = require('./config')
const os = require('os');

function getCpuUsagePercentage() {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  return memoryUsage.toFixed(2);
}

class MetricBuilder {
  constructor() {
    this.metrics = []; 
  }

  addHTTPMetric(metricPrefix, httpMethod, metricName, metricValue) {
    this.metrics.push(`${metricPrefix},source=${config.metrics.source},method=${httpMethod} ${metricName}=${metricValue}`);
  }

  addMetric(metricPrefix, metricName, metricValue) {
    this.metrics.push(`${metricPrefix},source=${config.metrics.source} ${metricName}=${metricValue}`);
  }

  toString(separator = '\n') {
    return this.metrics.join(separator);
  }
}

class Metrics {
  constructor() {
    this.totalRequests = 0;
    this.getRequests = 0;
    this.postRequests = 0;
    this.putRequests = 0;
    this.deleteRequests = 0;
    this.activeUsers = 0;
    this.authSuccess = 0;
    this.authFailure = 0;
    this.pizzasSold = 0;
    this.pizzaCreationFail = 0;
    this.revenue = 0;
    this.pizzaCreationLatency = 0;
    this.serviceLatency = 0;
    //this.pizzaCreationLatency = [];
    //this.serviceLatency = [];

    this.sendMetricsPeriodically(10000);
  }

  httpMetrics(buf) {
    buf.addHTTPMetric('request', 'delete', 'total', this.deleteRequests);
    buf.addHTTPMetric('request', 'get', 'total', this.getRequests);
    buf.addHTTPMetric('request', 'post', 'total', this.postRequests);
    buf.addHTTPMetric('request', 'put', 'total', this.putRequests);
    buf.addHTTPMetric('request', 'total', 'total', this.totalRequests);
  }
  incrementDeleteRequests() {
    this.totalRequests++;
    this.deleteRequests++;
  }
  incrementGetRequests() {
    this.totalRequests++;
    this.getRequests++; 
  }
  incrementPostRequests() {
    this.totalRequests++;
    this.postRequests++;
  }
  incrementPutRequests() {
    this.totalRequests++;
    this.putRequests++;
  }

  userMetrics(buf) {
    buf.addMetric('auth', 'active_users', this.activeUsers);
  }
  userLogin() {
    this.activeUsers++;
  }
  userLogout() {
    this.activeUsers--;
  }

  authMetrics(buf) {
    buf.addMetric('auth', 'success', this.authSuccess);
    buf.addMetric('auth', 'failure', this.authFailure);
  }
  successfulAuth() {
    this.authSuccess++;
  }
  failureAuth() {
    this.authFailure--;
  }

  systemMetrics(buf) {
    buf.addMetric('system', 'cpu', getCpuUsagePercentage());
    buf.addMetric('system', 'memory', getMemoryUsagePercentage());
  }

  purchaseMetrics(buf) {
    buf.addMetric('pizza', 'pizza_purchases', this.pizzasSold);
    buf.addMetric('pizza', 'purchase_failure', this.pizzaCreationFail);
    buf.addMetric('revenue', 'total', this.revenue);
  }
  purchaseSuccess() {
    this.pizzasSold++;
  }
  purchaseFailure() {
    this.pizzaCreationFail++; 
  }
  determineRevenue(order_price) {
    this.revenue += order_price;
  }

  latencyMetrics(buf) {
    //const pizzaLatencyAvg = this.pizzaCreationLatency.reduce((sum, num) => sum + num, 0) / this.pizzaCreationLatency.length;
   // const serviceLatencyAvg = this.serviceLatency.reduce((sum, num) => sum + num, 0) / this.serviceLatency.length;
    buf.addMetric('latency', 'pizza', this.pizzaCreationLatency)// pizzaLatencyAvg);
    buf.addMetric('latency', 'service', this.serviceLatency)// serviceLatencyAvg);
  }
  pizzaLatency(latency) {
    this.pizzaCreationLatency += latency;
   // this.pizzaCreationLatency.push(latency);
  }
  serviceEndpointLatency(latency) {
    this.serviceLatency += latency; //.push(latency);
  }

  sendMetricsPeriodically(period) {
    const timer = setInterval(() => {
      try {
        const buf = new MetricBuilder();
        this.httpMetrics(buf);
        this.userMetrics(buf);
        this.authMetrics(buf);
        this.systemMetrics(buf);
        this.purchaseMetrics(buf);
        this.latencyMetrics(buf);
  
        const metrics = buf.toString('\n');
        this.sendMetricToGrafana(metrics);
      } catch (error) {
        console.log('Error sending metrics', error);
      }
    }, period);
    timer.unref();
  }

  sendMetricToGrafana(metrics) {
    fetch(`${config.metrics.url}`, {
      method: 'post',
      body: metrics,
      headers: { Authorization: `Bearer ${config.metrics.userId}:${config.metrics.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to push metrics data to Grafana');
        } else {
          console.log(`Pushed ${metrics}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }
}

const metrics = new Metrics();
module.exports = metrics;