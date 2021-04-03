function setOnPage(statistics, machine, user, belonging) {
  console.log(statistics, machine, user, belonging);
  $('#loading').css('display', 'none');
  $('#contents').css('display', 'block');
  $('#todayUserCount').text(statistics.todayUserCount);
  $('#totalUserCount').text(addComma(statistics.totalUserCount));
  $('#todaySales').text(addComma(statistics.todaySales));
  $('#totalSales').text(addComma(statistics.totalSales));
      
  let machineRatio = machine.sort((a, b) => parseFloat(b.usageCount) - parseFloat(a.usageCount));
  let machineRatioCOLORS = interpolateColors(machineRatio.length, d3.interpolateCool, {
    colorStart: 0,
    colorEnd: 0.8,
    useEndAsStart: false,
  });
  let machineRatioChart = new Chart(document.getElementById("machine_usage_ratio_chart"), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: machineRatio.map(o => o.usageCount),
        backgroundColor: machineRatioCOLORS,
        hoverBackgroundColor: machineRatioCOLORS
      }],
      labels: machineRatio.map(o => o.machine)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = machineRatioChart.data.labels.indexOf(legendItem.text);
          const activeSegment = machineRatioChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          machineRatioChart.tooltip._active = [activeSegment];
          machineRatioChart.tooltip.update();
          machineRatioChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ' + data['datasets'][0]['data'][tooltipItem['index']] + '건';
      	  },
    	    afterLabel: function(tooltipItem, data) {
  	        let dataset = data['datasets'][0];
	          let percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]['total']) * 1000) / 10;
  	        return '(' + percent + '%)';
	        }
     	  }
      } 
    }
  });
  
  let belongingRatio = belonging.sort((a, b) => parseFloat(b.usageCount) - parseFloat(a.usageCount));
  let belongingRatioCOLORS = interpolateColors(belongingRatio.length, d3.interpolateCool, {
    colorStart: 0,
    colorEnd: 0.8,
    useEndAsStart: false,
  });
  let belongingRatioChart = new Chart(document.getElementById("belonging_usage_ratio_chart"), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: belongingRatio.map(o => o.usageCount),
        backgroundColor: belongingRatioCOLORS,
        hoverBackgroundColor: belongingRatioCOLORS
      }],
      labels: belongingRatio.map(o => o.affiliation)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = belongingRatioChart.data.labels.indexOf(legendItem.text);
          const activeSegment = belongingRatioChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          belongingRatioChart.tooltip._active = [activeSegment];
          belongingRatioChart.tooltip.update();
          belongingRatioChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ' + data['datasets'][0]['data'][tooltipItem['index']] + '건';
      	  },
    	    afterLabel: function(tooltipItem, data) {
            let dataset = data.datasets[tooltipItem.datasetIndex];
            let total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) { return previousValue + currentValue; });
            let currentValue = dataset.data[tooltipItem.index];
            let percentage = Math.round((currentValue / total) * 1000) / 10;
            return '(' + percentage + "%)";
	        }
     	  }
      } 
    }
  });
  
  let userRatio = user.sort((a, b) => parseFloat(b.usageCount) - parseFloat(a.usageCount));
  let userRatioCOLORS = interpolateColors(userRatio.length, d3.interpolateCool, {
    colorStart: 0,
    colorEnd: 0.8,
    useEndAsStart: false,
  });
  let userRatioChart = new Chart(document.getElementById("user_usage_ratio_chart"), {
    type: 'doughnut',
    data: {
      datasets: [{
        data: userRatio.map(o => o.usageCount),
        backgroundColor: userRatioCOLORS,
        hoverBackgroundColor: userRatioCOLORS
      }],
      labels: userRatio.map(o => o.identity)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = userRatioChart.data.labels.indexOf(legendItem.text);
          const activeSegment = userRatioChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          userRatioChart.tooltip._active = [activeSegment];
          userRatioChart.tooltip.update();
          userRatioChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ' + data['datasets'][0]['data'][tooltipItem['index']] + '건';
      	  },
    	    afterLabel: function(tooltipItem, data) {
            let dataset = data.datasets[tooltipItem.datasetIndex];
            let total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) { return previousValue + currentValue; });
            let currentValue = dataset.data[tooltipItem.index];
            let percentage = Math.round((currentValue / total) * 1000) / 10;
            return '(' + percentage + "%)";
	        }
     	  }
      } 
    }
  });
  
  let machineFreeRatio = machine.sort((a, b) => parseFloat(Math.round(b.freeUsageCount / b.usageCount * 1000) / 10) - parseFloat(Math.round(a.freeUsageCount / a.usageCount * 1000) / 10));
  let machineFreeRatioCOLORS = interpolateColors(machineFreeRatio.length, d3.interpolateCool, {
    colorStart: 0,
    colorEnd: 0.8,
    useEndAsStart: false,
  });
  let machineFreeRatioChart = new Chart(document.getElementById("machine_free_usage_ratio_chart"), {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: machineFreeRatio.map(o => Math.round(o.freeUsageCount / o.usageCount * 1000) / 10),
        backgroundColor: machineFreeRatioCOLORS,
        hoverBackgroundColor: machineFreeRatioCOLORS
      }],
      labels: machineFreeRatio.map(o => o.machine)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = machineFreeRatioChart.data.labels.indexOf(legendItem.text);
          const activeSegment = machineFreeRatioChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          machineFreeRatioChart.tooltip._active = [activeSegment];
          machineFreeRatioChart.tooltip.update();
          machineFreeRatioChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
      	  },
    	    afterLabel: function(tooltipItem, data) {
            return '(' + machineFreeRatio[tooltipItem.index].usageCount + "건)";
	        }
     	  }
      } 
    }
  });
  
  let machineTotalRuntime = machine.sort((a, b) => parseFloat(b.usageTime) - parseFloat(a.usageTime));
  let machineTotalRuntimeCOLORS = interpolateColors(machineTotalRuntime.length, d3.interpolateSpectral, {
    colorStart: 0.1,
    colorEnd: 0.8,
    useEndAsStart: false,
  });
  let machineTotalRuntimeChart = new Chart(document.getElementById("machine_total_runtime_chart"), {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: machineTotalRuntime.map(o => o.usageTime),
        backgroundColor: machineTotalRuntimeCOLORS,
        hoverBackgroundColor: machineTotalRuntimeCOLORS
      }],
      labels: machineTotalRuntime.map(o => o.machine)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = machineTotalRuntimeChart.data.labels.indexOf(legendItem.text);
          const activeSegment = machineTotalRuntimeChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          machineTotalRuntimeChart.tooltip._active = [activeSegment];
          machineTotalRuntimeChart.tooltip.update();
          machineTotalRuntimeChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
            let time = data['datasets'][0]['data'][tooltipItem['index']]
        	  return ' ' + Math.floor(time / 60) + '시간 ' + time % 60 + '분';
      	  }
     	  }
      } 
    }
  });
  
  let machineAvgRuntime = machine.sort((a, b) => parseFloat(b.usageTime / b.usageCount) - parseFloat(a.usageTime / a.usageCount));
  let machineAvgRuntimeCOLORS = interpolateColors(machineAvgRuntime.length, d3.interpolateSpectral, {
    colorStart: 0.1,
    colorEnd: 0.8,
    useEndAsStart: false,
  });
  let machineAvgRuntimeChart = new Chart(document.getElementById("machine_average_runtime_chart"), {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: machineAvgRuntime.map(o => Math.round(o.usageTime / o.usageCount)),
        backgroundColor: machineAvgRuntimeCOLORS,
        hoverBackgroundColor: machineAvgRuntimeCOLORS
      }],
      labels: machineAvgRuntime.map(o => o.machine)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = machineAvgRuntimeChart.data.labels.indexOf(legendItem.text);
          const activeSegment = machineAvgRuntimeChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          machineAvgRuntimeChart.tooltip._active = [activeSegment];
          machineAvgRuntimeChart.tooltip.update();
          machineAvgRuntimeChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
            let time = data['datasets'][0]['data'][tooltipItem['index']]
        	  return ' ' + Math.floor(time / 60) + '시간 ' + time % 60 + '분';
      	  }
     	  }
      } 
    }
  });
  
  let machineSales = machine.sort((a, b) => parseFloat(b.usageCost) - parseFloat(a.usageCost));
  let machineSalesCOLORS = interpolateColors(machineSales.length, d3.interpolateSpectral, {
    colorStart: 0.1,
    colorEnd: 0.8,
    useEndAsStart: false,
  });
  let machineSalesChart = new Chart(document.getElementById("machine_sales_chart"), {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: machineSales.map(o => Math.round(o.usageCost)),
        backgroundColor: machineSalesCOLORS,
        hoverBackgroundColor: machineSalesCOLORS
      }],
      labels: machineSales.map(o => o.machine)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = machineSalesChart.data.labels.indexOf(legendItem.text);
          const activeSegment = machineSalesChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          machineSalesChart.tooltip._active = [activeSegment];
          machineSalesChart.tooltip.update();
          machineSalesChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ￦' + addComma(data['datasets'][0]['data'][tooltipItem['index']]);
      	  }
     	  }
      } 
    }
  });
  
  let machineAvgSales = machine.sort((a, b) => parseFloat(b.usageCost / b.usageCount) - parseFloat(a.usageCost / a.usageCount));
  let machineAvgSalesCOLORS = interpolateColors(machineAvgSales.length, d3.interpolateSpectral, {
    colorStart: 0.1,
    colorEnd: 0.8,
    useEndAsStart: false,
  });
  let machineAvgSalesChart = new Chart(document.getElementById("machine_average_sales_chart"), {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: machineAvgSales.map(o => Math.round(o.usageCost / o.usageCount)),
        backgroundColor: machineAvgSalesCOLORS,
        hoverBackgroundColor: machineAvgSalesCOLORS
      }],
      labels: machineAvgSales.map(o => o.machine)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = machineAvgSalesChart.data.labels.indexOf(legendItem.text);
          const activeSegment = machineAvgSalesChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          machineAvgSalesChart.tooltip._active = [activeSegment];
          machineAvgSalesChart.tooltip.update();
          machineAvgSalesChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ￦' + addComma(data['datasets'][0]['data'][tooltipItem['index']]);
      	  }
     	  }
      } 
    }
  });
  
  let belongingSales = belonging.sort((a, b) => parseFloat(b.usageCost) - parseFloat(a.usageCost));
  let belongingSalesCOLORS = interpolateColors(belongingSales.length, d3.interpolateRdPu, {
    colorStart: 0.2,
    colorEnd: 0.7,
    useEndAsStart: true,
  });
  let belongingSalesChart = new Chart(document.getElementById("belonging_sales_chart"), {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: belongingSales.map(o => Math.round(o.usageCost)),
        backgroundColor: belongingSalesCOLORS,
        hoverBackgroundColor: belongingSalesCOLORS
      }],
      labels: belongingSales.map(o => o.affiliation)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = belongingSalesChart.data.labels.indexOf(legendItem.text);
          const activeSegment = belongingSalesChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          belongingSalesChart.tooltip._active = [activeSegment];
          belongingSalesChart.tooltip.update();
          belongingSalesChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ￦' + addComma(data['datasets'][0]['data'][tooltipItem['index']]);
      	  }
     	  }
      } 
    }
  });
  
  let belongingFreeRatio = belonging.sort((a, b) => parseFloat(b.freeUsageCount / b.usageCount) - parseFloat(a.freeUsageCount / a.usageCount));
  let belongingFreeRatioCOLORS = interpolateColors(belongingFreeRatio.length, d3.interpolateRdPu, {
    colorStart: 0.2,
    colorEnd: 0.7,
    useEndAsStart: true,
  });
  let belongingFreeRatioChart = new Chart(document.getElementById("belonging_free_usage_ratio_chart"), {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: belongingFreeRatio.map(o => Math.round(o.freeUsageCount / o.usageCount * 1000) / 10),
        backgroundColor: belongingFreeRatioCOLORS,
        hoverBackgroundColor: belongingFreeRatioCOLORS
      }],
      labels: belongingFreeRatio.map(o => o.affiliation)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = belongingFreeRatioChart.data.labels.indexOf(legendItem.text);
          const activeSegment = belongingFreeRatioChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          belongingFreeRatioChart.tooltip._active = [activeSegment];
          belongingFreeRatioChart.tooltip.update();
          belongingFreeRatioChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
      	  },
    	    afterLabel: function(tooltipItem, data) {
            return '(' + belongingFreeRatio[tooltipItem.index].usageCount + "건)";
	        }
     	  }
      } 
    }
  });
  
  let userSales = user.sort((a, b) => parseFloat(b.usageCost) - parseFloat(a.usageCost));
  let userSalesCOLORS = interpolateColors(userSales.length, d3.interpolateRdPu, {
    colorStart: 0.2,
    colorEnd: 0.7,
    useEndAsStart: true,
  });
  let userSalesChart = new Chart(document.getElementById("user_sales_chart"), {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: userSales.map(o => Math.round(o.usageCost)),
        backgroundColor: userSalesCOLORS,
        hoverBackgroundColor: userSalesCOLORS
      }],
      labels: userSales.map(o => o.identity)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = userSalesChart.data.labels.indexOf(legendItem.text);
          const activeSegment = userSalesChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          userSalesChart.tooltip._active = [activeSegment];
          userSalesChart.tooltip.update();
          userSalesChart.draw();
        }
      },
      scales: {
        xAxes: [{
          ticks: {
            min: 0
          }
        }]
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ￦' + addComma(data['datasets'][0]['data'][tooltipItem['index']]);
      	  }
     	  }
      } 
    }
  });
  
  let userFreeRatio = user.sort((a, b) => parseFloat(b.freeUsageCount / b.usageCount) - parseFloat(a.freeUsageCount / a.usageCount));
  let userFreeRatioCOLORS = interpolateColors(userFreeRatio.length, d3.interpolateRdPu, {
    colorStart: 0.2,
    colorEnd: 0.7,
    useEndAsStart: true,
  });
  let userFreeRatioChart = new Chart(document.getElementById("user_free_usage_ratio_chart"), {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: userFreeRatio.map(o => Math.round(o.freeUsageCount / o.usageCount * 1000) / 10),
        backgroundColor: userFreeRatioCOLORS,
        hoverBackgroundColor: userFreeRatioCOLORS
      }],
      labels: userFreeRatio.map(o => o.identity)
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          fontSize: 11,
          filter: function(item, data) { return item.index < 10; }
        },
        onClick: (evt, legendItem) => {
          const index = userFreeRatioChart.data.labels.indexOf(legendItem.text);
          const activeSegment = userFreeRatioChart.getDatasetMeta(0).data[index];
          activeSegment._model.backgroundColor = activeSegment._options.hoverBackgroundColor;
          activeSegment._model.borderWidth = activeSegment._options.hoverBorderWidth;
          userFreeRatioChart.tooltip._active = [activeSegment];
          userFreeRatioChart.tooltip.update();
          userFreeRatioChart.draw();
        }
      },
      tooltips: {
	      callbacks: {
      	  title: function(tooltipItem, data) {
    	      return data['labels'][tooltipItem[0]['index']];
  	      },
	        label: function(tooltipItem, data) {
        	  return ' ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
      	  },
    	    afterLabel: function(tooltipItem, data) {
            return '(' + userFreeRatio[tooltipItem.index].usageCount + "건)";
	        }
     	  }
      } 
    }
  });
}
function addComma(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function interpolateColors(dataLength, colorScale, colorRangeInfo) {
  let { colorStart, colorEnd } = colorRangeInfo;
  let colorRange = colorEnd - colorStart;
  let intervalSize = colorRange / dataLength;
  let i, colorPoint;
  let colorArray = [];
  for (i = 0; i < dataLength; i++) {
    colorPoint = calculatePoint(i, intervalSize, colorRangeInfo);
    colorArray.push(colorScale(colorPoint));
  }
  return colorArray;
}
function calculatePoint(i, intervalSize, colorRangeInfo) {
  var { colorStart, colorEnd, useEndAsStart } = colorRangeInfo;
  return (useEndAsStart
    ? (colorEnd - (i * intervalSize))
    : (colorStart + (i * intervalSize)));
}