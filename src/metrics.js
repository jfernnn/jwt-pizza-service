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

  addMetric(metricPrefix, httpMethod, metricName, metricValue) {
    this.metrics.push(`${metricPrefix},source=${config.metrics.source},method=${httpMethod} ${metricName}=${metricValue}`);
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
    this.deleteRequests = 0;/*
    this.activeUsers = 0;
    this.authSuccess = 0;
    this.authFailure = 0;
    this.pizzasSold = 0;
    this.pizzaCreationFail = 0;
    this.revenue = 0;*/

    this.sendMetricsPeriodically(10000)
  }

  httpMetrics(buf) {
    buf.addMetric('request', 'delete', 'total', this.deleteRequests);
    buf.addMetric('request', 'get', 'total', this.getRequests);
    buf.addMetric('request', 'post', 'total', this.postRequests);
    buf.addMetric('request', 'put', 'total', this.putRequests);
    buf.addMetric('request', 'total', 'total', this.totalRequests);
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
/*
  userMetrics(buf) {
    buf.addMetric('', '', '', this.activeUsers)
  }
  userLogin() {
    this.activeUsers++;
  }
  userLogout() {
    this.activeUsers--;
  }

  authMetrics(buf) {
    buf.addMetric('', '', '', this.authSuccess);
    buf.addMetric('', '', '', this.authFailure);
  }
  successfulAuth() {
    this.authSuccess++;
  }
  failureAuth() {
    this.authFailure++;
  }

  systemMetrics(buf) {
    buf.addMetric('cpu', '', '', getCpuUsagePercentage())
    buf.addMetric('memory', '', '', getMemoryUsagePercentage())
  }

  purchaseMetrics(buf) {
  
  }

  latencyMetrics(buf) {

  }
*/
  sendMetricsPeriodically(period) {
    const timer = setInterval(() => {
      try {
        const buf = new MetricBuilder();
        this.httpMetrics(buf);
   /*     this.systemMetrics(buf);
        this.userMetrics(buf);
        this.purchaseMetrics(buf);
        this.authMetrics(buf);
        this.latencyMetrics(buf);*/
  
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