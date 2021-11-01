var blogApp = angular.module('blogApp', ['ngRoute', 'ngAnimate']);



blogApp.config(['$routeProvider', function($routeProvider){
	$routeProvider
	.when('/', {
	templateUrl: 'views/login.html',
	controller: 'loginController'
	})
	.when('/home', {
	templateUrl: 'views/home.html',
	controller: 'blogController'
	})
	.when('/submit', {
    templateUrl: 'views/submit.html',
    controller: 'submitController'
  })
  .when('/about', {
    templateUrl: 'views/about.html',
	})
    .otherwise({
	redirectTo: '/'
	});
}]);

blogApp.run(function($rootScope, $location, loginService){
	var routePermit = ['/home', '/submit', '/about'];
	$rootScope.$on('$routeChangeStart', function(){
		if(routePermit.indexOf($location.path()) !=-1){
			var connected = loginService.islogged();
			connected.then(function(response){
				if(!response.data){
					$location.path('/');
				}
			});

		}
	});

	var sessionStarted = ['/'];
	$rootScope.$on('$routeChangeStart', function(){
		if(sessionStarted.indexOf($location.path()) !=-1){
			var cantgoback = loginService.islogged();
			cantgoback.then(function(response){
				if(response.data){
					$location.path('/home');
				}
			});
		}
	});
});

blogApp.controller('userController', ['$scope', 'loginService', function($scope, loginService){
	$scope.logout = function(){
		loginService.logout();
	}

	var userrequest = loginService.fetchuser();
	userrequest.then(function(response){
		$scope.user = response.data[0];
	});
}]);

blogApp.controller('blogController', ['$scope', '$http', 'loginService', function($scope, $http, loginService){

	$http({
  method: 'post',
  url: 'addremove.php',
  data: {request_type:1,},

 }).then(function successCallback(response) {
  $scope.posts = response.data;
 });

 $scope.remove = function(index,id){

  $http({
   method: 'post',
   url: 'addremove.php',
   data: {id:id,request_type:3},
  }).then(function successCallback(response) {
     if(response.data == 1)
        $scope.posts.splice(index, 1);
     else
        alert('Niepowodzenie przy usunięciu postu.');
  });
 }

}]);

blogApp.controller('submitController', ['$scope', '$http', '$location', function($scope, $http, $location){

 $scope.add = function(){
	$location.path('/home');
  $http({
   method: 'post',
   url: 'addremove.php',
   data: {title:$scope.title,content:$scope.content,request_type:2},
  }).then(function successCallback(response) {
     if(response.data.length > 0)
        $scope.posts.push(response.data[0]);
     else
        alert('Niepowodzenie przy dodaniu postu.');
  });
 }

}]);

blogApp.controller('loginController', function($scope, loginService){
	$scope.errorLogin = false;

	$scope.login = function(user){
		loginService.login(user, $scope);
	}

	$scope.clearMsg = function(){
		$scope.errorLogin = false;
	}
});

blogApp.factory('loginService', function($http, $location, sessionService){
	return{
		login: function(user, $scope){
			var validate = $http.post('login.php', user);
			validate.then(function(response){
				var uid = response.data.user;
				if(uid){
					sessionService.set('user',uid);
					$location.path('/home');
				}

				else{
					$scope.successLogin = false;
					$scope.errorLogin = true;
					$scope.errorMsg = response.data.message;
				}
			});
		},
		logout: function(){
			sessionService.destroy('user');
			$location.path('/');
		},
		islogged: function(){
			var checkSession = $http.post('session.php');
			return checkSession;
		},
		fetchuser: function(){
			var user = $http.get('fetch.php');
			return user;
		}
	}
});

blogApp.factory('sessionService', ['$http', function($http){
	return{
		set: function(key, value){
			return sessionStorage.setItem(key, value);
		},
		get: function(key){
			return sessionStorage.getItem(key);
		},
		destroy: function(key){
			$http.post('logout.php');
			return sessionStorage.removeItem(key);
		}
	};
}]);
