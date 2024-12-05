const config = require('./config.js');
const os = require('os');
/*
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
*/
class MetricBuilder {
  constructor() {
    this.metrics = [];
  }

  addMetric(metricPrefix, httpMethod, metricName, metricValue) {
    this.metrics.push(`${metricPrefix},source=${config.source},method=${httpMethod} ${metricName}=${metricValue}`);
  }

  toString(separator = '\n') {
    return this.metrics.join(separator);
  }
}
/*
function httpMetrics(buf) {
  buf.addMetric('request', 'get', 'totel', );
  buf.addMetric('http_requests_total', 50, { method: 'POST' });
  buf.addMetric('http_requests_total', 30, { method: 'DELETE' });
}

function systemMetrics(buf) {
  buf.addMetric('cpu', getCpuUsagePercentage(), {})
  buf.addMetric('memory', getMemoryUsagePercentage(), {})
}

function userMetrics(buf) {

}

function purchaseMetrics(buf) {

}

function authMetrics(buf) {
  buf.addMetric('auth_attempts_total', 10, { status: 'success' });
  buf.addMetric('auth_attempts_total', 5, { status: 'failed' });
}
*/
/*
function sendMetricsPeriodically(period) {
    const timer = setInterval(() => {
      try {
        const buf = new MetricBuilder();
        httpMetrics(buf);
        systemMetrics(buf);
        userMetrics(buf);
        purchaseMetrics(buf);
        authMetrics(buf);
  
        const metrics = buf.toString('\n');
        this.sendMetricToGrafana(metrics);
      } catch (error) {
        console.log('Error sending metrics', error);
      }
    }, period);
    timer.unref();
}
*/

class Metrics {
  constructor() {
    this.totalRequests = 0;
    this.getRequests = 0;
    this.postRequests = 0;
    this.putRequests = 0;
    this.deleteRequests = 0;

    this.sendMetricsPeriodically(10000)
  }

  httpMetrics(buf) {
    this.getRequests += 8;
    this.postRequests += 1;
    this.putRequests += 5;
    this.deleteRequests += 3;
    this.totalRequests += this.deleteRequests+this.postRequests+this.putRequests+this.deleteRequests;
    buf.addMetric('request', 'delete', 'totel', this.deleteRequests);
    buf.addMetric('request', 'get', 'totel', this.getRequests);
    buf.addMetric('request', 'post', 'totel', this.postRequests);
    buf.addMetric('request', 'put', 'totel', this.putRequests);
    buf.addMetric('request', 'total', 'totel', this.totalRequests);
  }
/*
  systemMetrics(buf) {
    buf.addMetric('cpu', getCpuUsagePercentage(), {})
    buf.addMetric('memory', getMemoryUsagePercentage(), {})
  }
  
  userMetrics(buf) {
  
  }
  
  purchaseMetrics(buf) {
  
  }
  
  authMetrics(buf) {
    buf.addMetric('auth_attempts_total', 10, { status: 'success' });
    buf.addMetric('auth_attempts_total', 5, { status: 'failed' });
  }
*/
  sendMetricsPeriodically(period) {
    const timer = setInterval(() => {
      try {
        const buf = new MetricBuilder();
        this.httpMetrics(buf);
/*        systemMetrics(buf);
        userMetrics(buf);
        purchaseMetrics(buf);
        authMetrics(buf);*/
  
        const metrics = buf.toString('\n');
        this.sendMetricToGrafana(metrics);
      } catch (error) {
        console.log('Error sending metrics', error);
      }
    }, period);
    timer.unref();
  }

  sendMetricToGrafana(metrics) {
    fetch(`${config.url}`, {
      method: 'post',
      body: metrics,
      headers: { Authorization: `Bearer ${config.userId}:${config.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error('Failed to push metrics data to Grafana');
        } else {
          console.log(`Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error('Error pushing metrics:', error);
      });
  }
}

const metrics = new Metrics();
module.exports = metrics;