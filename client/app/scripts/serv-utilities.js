angular.module('appoint')
	.factory('utilFactory', function () {
			'use strict';
			var utilFac = {};

			utilFac.getTimeAMPM = function(date_time) {
		        var hours = date_time.getHours();
		        var minutes = date_time.getMinutes();
		        var ampm = hours >= 12 ? 'PM' : 'AM';
		        hours = hours % 12;
		        hours = hours ? hours : 12; // the hour '0' should be '12'
		        hours = hours < 10 ? '0'+hours : hours;
		        minutes = minutes < 10 ? '0'+minutes : minutes;
		        var strTime = hours + ':' + minutes + ' ' + ampm;
		        return strTime;
	    	};

	    	utilFac.isDateEqual = function(d1, d2) {
	    		if (d1.getFullYear() != d2.getFullYear())
	    			return false;
	    		else if (d1.getMonth() != d2.getMonth())
	    			return false;
	    		else if (d1.getDate() != d2.getDate())
	    			return false;
	    		return true;
	    	};

         	return utilFac;

		})
;