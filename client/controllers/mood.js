angular.module('MoodTracker')
	.controller('MoodController', function($scope, $alert, $auth, UserService, AlertService, MessageService) {

// Angular Chart data viz of total mood counts
			counts = {happy: 0, okay: 0, unhappy: 0};

		var setCountData = function(counts) {
			var data = [];
			for (var key in counts) {
				data.push({
					x: key, 
					y: [counts[key]]
				});
			}
			console.log('data:::', data);
			$scope.countData = {
				data: data
			};
		};
// Chart template
		var setPieChart = function() {
			$scope.chartType = 'pie';
			$scope.config = {
				labels: false,
				title: 'Daily Mood Counts',
				legend: {
					display: true,
					position: 'right'
				},
				innerRadius: 0,
				tooltips: true
			};
		};

		$scope.date = moment().format('MMMM Do YYYY');

	
// Get user
		UserService.getUser().success(function(data) {
			$scope.user = data;
			console.log($scope.user);
			$scope.name = data.displayName;
			$scope.moods = data.moods;
			$scope.days = moment().diff(moment(data.startDate), 'd') + 1;
			
			var moods = data.moods, 
				dates = Object.keys(moods);
				console.log('dates:', dates);

			dates.forEach(function(date) {
				counts[moods[date]]++;
			});

			setCountData(counts);
			setPieChart();

			// only draw if there is data
			$scope.ready = true;
		}).error(function() {
			$alert(AlertService.getAlert('Unable to get user information.'));
		});

		// get messages

		MessageService.getMessages().success(function(data) {
			$scope.moodMessages = data;
			console.log('messages data:', data);
		}).error(function() {
			$alert(AlertService.getAlert('Unable to get messages.'));
		});

/*
 |--------------------------------------------------------------------------
 | Update mood property in UserSchema
 |--------------------------------------------------------------------------
 */
		$scope.updateMood = function() {
			
			var mapData = function(data){
				// console.log('data:::::', data);
				return data.map(function(val){
					return val['mood'];
				});
			};
			UserService.logMood({
				moods: $scope.user.moods
			}).then(function(res) {
				// console.log('res:::', res);
				
				$alert(AlertService.getAlert('You have logged your mood'));
				// console.log($scope.user.moods);
				var newData = mapData(res.data);
				var newCount = { };
				for (var i = 0; i < newData.length; i++) {
					(function(val){
						newCount[newData[val]] = (newCount[newData[val]] || 0) + 1;
					})(i);
				}	
				// console.log('newCount:::', newCount);
				setCountData(newCount);
				// refresh count and mood data
				$scope.ready = true;
			});
		};
	});