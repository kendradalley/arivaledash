angular.module('MoodTracker')
  .controller('HomeController', function($scope) {

  $scope.config = {
    title: 'Dashboard',
    labels: false,
    legend: {
      display: true,
      position: 'right'
    }
  };

  $scope.data = {
    series: ['Steps'],
    data: [{
      x: "Jan",
      y: [100]
    }, {
      x: "Feb",
      y: [300]
    }, {
      x: "March",
      y: [100]
    }, {
      x: "March",
      y: [54]
    },
    {
      x: "April",
      y: [100]
    }, {
      x: "May",
      y: [100]
    }, {
      x: "June",
      y: [351]
    }, {
      x: "July",
      y: [100]
    }, {
      x: "August",
      y: [100]
    }, {
      x: "September",
      y: [100]
    }, {
      x: "October",
      y: [100]
    },
  
    
    ]
  };

        });