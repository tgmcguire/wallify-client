var main = {};

main.api = "http://wallify.herokuapp.com/api/v1";
main.client = "http://www.wallify.me";

var app = angular.module('WallifyApp', ['ngCookies']);

app.filter('getById', function() {
  return function(input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (input[i].id == id) {
        return input[i];
      }
    }
    return null;
  }
});

app.controller('MainController', ['$cookies', '$scope', '$location', '$http', '$filter', function($cookies, $scope, $location, $http, $filter) {
	$scope.init = true;
	$scope.req = {};
	$scope.selectedPlaylistID = null;
	$scope.coversWide = 5;

	if (typeof($location.path()) !== 'undefined' && $location.path() != "" && $location.path() != "/app" && $location.path() != "/") {
		Date.prototype.addHour= function(){
		    this.setHours(this.getHours()+1);
		    return this;
		}

		var expireTime 	= new Date().addHour();

		$cookies.put('spotify_key', $location.path().split("=")[1].split("&")[0], {
			expires: expireTime
		});

		console.log("Cookie set.");

		window.location.replace(main.client);
		$scope.isLoggedIn = true;
	} else if($cookies.get('spotify_key')) {
		$scope.isLoggedIn = true;
	} else {
		$scope.isLoggedIn = false;
	}

	if ($scope.isLoggedIn === true) {
		$scope.loading = true;

		$scope.req.getuser = $http({
			method: 'get',
			url: main.api+"/user",
			params: {
				key: $cookies.get('spotify_key')
			}
		}).success(function(data, status) {
			$scope.user = JSON.parse(data);

			$scope.req.getplaylists = $http({
				method: 'get',
				url: main.api+"/playlists",
				params: {
					key: $cookies.get('spotify_key'),
					userid: $scope.user.id,
					username: $scope.user.display_name
				}
			}).success(function(data, status) {
				$scope.loading = false;

				$scope.playlists = data;
			}).error(function(error){
				$scope.loading = false;
				$scope.error = error;
			});
		}).error(function(error){
			$scope.error = error;
			$scope.serverOffline = true;
		});
	};

	$scope.showPlaylist = function() {
		$scope.playlist = $filter('getById')($scope.playlists, $scope.selectedPlaylistID);
	}

	$scope.makeWallpaper = function() {
		if ($scope.coversWide > 1) {
			$scope.loading = true;
			$scope.reallyLong = true;
			$scope.wallpaper = null;

			$scope.req.makewallpaper = $http({
				method: 'get',
				url: main.api+"/make_wallpaper",
				params: {
					key: $cookies.get('spotify_key'),
					username: $scope.user.display_name,
					userid: $scope.user.id,
					playlistid: $scope.playlist.id,
					playlistname: $scope.playlist.name,
					ownerid: $scope.playlist.owner,
					coversWide: $scope.coversWide,
					resolution: $scope.screensize
				}
			}).success(function(data, status) {
				$scope.loading = false;
				$scope.reallyLong = false;

				if (data.error) {
					$scope.error = data.error;
				} else {
					$scope.wallpaper = data.location;
				}
			}).error(function(error){
				$scope.loading = false;
				$scope.reallyLong = false;
				$scope.error = error;
			});
		} else {
			$scope.error = "You gotta set the number of covers to at least 1-wide.";
		}
	}

}]);