/**
 * Created by Administrator on 2015/9/14.
 */

define(function(require){
  var $ = require('jquery');
  require("bootstrap");
  require("highcharts");
  require("sand_signika");


  $(function(){

    Highcharts.setOptions({
      global: {
        useUTC: false
      },
      credits:{
        enabled:false
      }
    });

    $("#ThrputUl").highcharts({
      chart: {
        type: 'spline',
        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10,
        events: {
          load: function() {
            // set up the updating of the chart each second
            var UlSeries = this.series[0],
                chart = $('#ThrputSection').highcharts(),
                TimerID = null;
            TimerID = setInterval(function() {
              var x = UlSeries.processedXData[UlSeries.processedXData.length-1], // current time
                y = Math.random();
              UlSeries.addPoint([x+1, y], true, false);
              if(UlSeries.processedXData.length >=30){
                clearInterval(TimerID);
                TimerID = setInterval(function(){
                  var x = UlSeries.processedXData[UlSeries.processedXData.length-1], // current time
                      y = Math.random();
                  UlSeries.addPoint([x+1, y], true, true);
                },1000);
              }
            }, 1000);
          }
        }
      },
      title: {
        text: 'UlThroughput'
      },
      legend:{
        enabled:false
      },
      xAxis: {
        title: {
          text: 'Time(s)'
        },
        tickInterval: 5,
        minRange:30,
        minPadding:0.01
      },
      yAxis: {
        title: {
          text: 'Mbps'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },

      tooltip: {
        crosshairs: true,
        formatter: function() {
          return '<b>'+ this.series.name +'</b><br>'+
             this.x+"s" +'<br>'+
            Highcharts.numberFormat(this.y, 2);
        }
      },
      exporting: {
        enabled: false
      },
      series: [
        {
          name: 'UlThroughput',
          data:[[0,0]],
          color:'#8085e9'
        }]
    });

    $("#ThrputDl").highcharts({
      chart: {
        type: 'spline',
        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10,
        events: {
          load: function() {
            // set up the updating of the chart each second
            var DlSeries = this.series[0],
              chart = $('#ThrputSection').highcharts(),
              TimerID = null;
            TimerID = setInterval(function() {
              var x = DlSeries.processedXData[DlSeries.processedXData.length-1], // current time
                y = Math.random();
              DlSeries.addPoint([x+1, y], true, false);
              if(DlSeries.processedXData.length >=30){
                clearInterval(TimerID);
                TimerID = setInterval(function(){
                  var x = DlSeries.processedXData[DlSeries.processedXData.length-1], // current time
                    y = Math.random();
                  DlSeries.addPoint([x+1, y], true, true);
                },1000);
              }
            }, 1000);
          }
        }
      },
      title: {
        text: 'DlThroughput'
      },
      legend:{
        enabled:false
      },
      xAxis: {
        title: {
          text: 'Time(s)'
        },
        tickInterval: 5,
        minRange:30,
        minPadding:0.01
      },
      yAxis: {
        title: {
          text: 'Mbps'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },

      tooltip: {
        crosshairs: true,
        formatter: function() {
          return '<b>'+ this.series.name +'</b><br>'+
           this.x+"s" +'<br>'+
            Highcharts.numberFormat(this.y, 2)+"Mbps";
        }
      },
      exporting: {
        enabled: false
      },
      series: [
        {
          name: 'DlThroughput',
          data:[[0,0]],
          color:'#f7a35c'
        }]
    });

  });


  function getRandomArray(length, min, max) {
    var array = [];
    for (var i = 0; i < length; i++) {

      array.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return array[0];
  }
});

