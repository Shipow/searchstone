// chartjs plugins
var gradientLinePlugin = {
  // Called at start of update.
  beforeUpdate: function(chartInstance) {
    if (chartInstance.options.linearGradientLine) {
      var ctx = chartInstance.chart.ctx;
      var dataset = chartInstance.data.datasets[0];
      var gradient = ctx.createLinearGradient(0, 10, 0, 140);
      switch (chartInstance.options.linearGradientLine) {
        case 'winrate':
          gradient.addColorStop(.7, '#EE7A57');
          gradient.addColorStop(0.52, '#FD4255');
          gradient.addColorStop(0.48, '#51A93F');
          gradient.addColorStop(0.2, '#34FFAC');
          break;
        case 'popularity':
          gradient.addColorStop(1, '#2C5EE3');
          gradient.addColorStop(.8, '#6B3FC8');
          gradient.addColorStop(0, '#FFB95D');
          break;
      }
      dataset.borderColor = gradient;
    }
  }
};

Chart.pluginService.register(gradientLinePlugin);

// var ctxMana = document.getElementById("manaBarChart");
// var ctxHealth = document.getElementById("healthBarChart");
// var ctxAttack = document.getElementById("attackBarChart");
// var ctxRarity = document.getElementById("rarityDoughnutChart");
// var ctxMechanics = document.getElementById("mechanicsChart");
// var ctxRace = document.getElementById("raceChart");

var ctxWinrate = document.getElementById('chart-winrate').getContext('2d');
var ctxPopularity = document.getElementById('chart-popularity').getContext('2d');

window.updateChart = function(chart, labels, data, colors) {
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  if (colors){
    var bgcolors = [];
    for (var label in labels) {
      bgcolors.push(colors[labels[label]]);
    }
    chart.data.datasets[0].backgroundColor = bgcolors;
  }
  chart.update();
};

window.statsRender = function(){
  var p = search.helper.lastResults.facets;
  console.log(p);
  var facetIndex = {cost: 1, attack: 2, health: 3, rarity: 4, mechanics: 5, race: 6 };
  var labels = {};
  var data = {};
  for (var facet in facetIndex) {
    labels[facet] = [];
    data[facet] = [];
    for (var key in p[facetIndex[facet]].data) {
      if (p[facetIndex[facet]].data.hasOwnProperty(key)) {
        labels[facet].push(key);
        data[facet].push(p[facetIndex[facet]].data[key]);
      }
    }
  }
  updateChart(manaBarChart, labels.cost, data.cost);
  updateChart(healthBarChart, labels.health, data.health);
  updateChart(attackBarChart, labels.attack, data.attack);
  updateChart(rarityDoughnutChart, labels.rarity, data.rarity, rarityColors);
  updateChart(mechanicsChart, labels.mechanics, data.mechanics);
  updateChart(raceChart, labels.race, data.race);
}

// window.manaBarChart = new Chart(ctxMana, {
//   type: 'bar',
//   data: {
//     labels: [],
//     datasets: [{
//       data: [],
//       backgroundColor: '#1297FF'
//     }]
//   },
//   options: {
//     layout: {
//       padding: {
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0
//       }
//     },
//     legend: {
//       display: false
//     },
//     scales: {
//       yAxes: [{
//         ticks: {
//           min: 0
//         }
//       }]
//     }
//   }
// });
//
// window.healthBarChart = new Chart(ctxHealth, {
//   type: 'bar',
//   data: {
//     labels: [],
//     datasets: [{
//       data: [],
//       backgroundColor: '#B5171A'
//     }]
//   },
//   options: {
//     layout: {
//       padding: {
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0
//       }
//     },
//     legend: {
//       display: false
//     },
//     scales: {
//       yAxes: [{
//         ticks: {
//           min: 0
//         }
//       }]
//     }
//   }
// });
//
// window.attackBarChart = new Chart(ctxAttack, {
//   type: 'bar',
//   data: {
//     labels: [],
//     datasets: [{
//       data: [],
//       backgroundColor: '#D7B41A'
//     }]
//   },
//   options: {
//     layout: {
//       padding: {
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0
//       }
//     },
//     legend: {
//       display: false
//     },
//     scales: {
//       yAxes: [{
//         ticks: {
//           min: 0
//         }
//       }]
//     }
//   }
// });
//
// window.mechanicsChart = new Chart(ctxMechanics, {
//   type: 'doughnut',
//   data: {
//     labels: [],
//     datasets: [{
//       data: [],
//       backgroundColor: '#3714D5',
//       borderColor: '#0F0722'
//     }]
//   },
//   options: {
//     layout: {
//       padding: {
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0
//       }
//     },
//     legend: {
//       display: false
//     }
//   }
// });
//
// window.raceChart = new Chart(ctxRace, {
//   type: 'doughnut',
//   data: {
//     labels: [],
//     datasets: [{
//       data: [],
//       backgroundColor: '#3714D5',
//       borderColor: '#0F0722'
//     }]
//   },
//   options: {
//     layout: {
//       padding: {
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0
//       }
//     },
//     legend: {
//       display: false
//     }
//   }
// });
//
// let rarityColors = {
//   Free: '#323538',
//   Common: '#CBCBCB',
//   Rare: '#3087EB',
//   Epic: '#BC4DDB',
//   Legendary: '#C67219'
// }
//
// window.rarityDoughnutChart = new Chart(ctxRarity, {
//   type: 'doughnut',
//   data: {
//     labels: [],
//     datasets: [{
//       data: [],
//       backgroundColor: [],
//       borderColor: '#0F0722'
//     }]
//   },
//   options: {
//     layout: {
//       padding: {
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0
//       }
//     },
//     legend: {
//       display: false
//     }
//   }
// });

window.chartWinrate = new Chart(ctxWinrate, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "Winrate over time",
        tension: .6,
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        data: []
      }]
    },
    options: {
      animation: {
        duration: 0
      },
      maintainAspectRatio: false,
      linearGradientLine: 'winrate',
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            min: 20,
            max: 80,
            stepSize: 10,
            callback: function(value, index, values) {
              return value + '%';
            }
          }
        }]
      }
    }
});

window.chartPopularity = new Chart(ctxPopularity, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: "Popularity over time",
        tension: .6,
        fill: false,
        borderWidth: 2,
        pointRadius: 0,
        data: []
        }]
    },
    options: {
      animation: {
        duration: 0
      },
      maintainAspectRatio: false,
      linearGradientLine: 'popularity',
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 50,
            stepSize: 10,
            callback: function(value, index, values) {
              return value + '%';
            }
          }
        }]
      }
    }
});
