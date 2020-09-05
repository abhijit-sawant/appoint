angular.module('appoint')
        .factory('calendarFactory', ['scheduleDayFactory',
        	                         '$cookies',
        	                         '$location',
        	                         'utilFactory',

        	function(scheduleDayFactory, 
        		     $cookies,
        		     $location,
        		     utilFactory) {

        	'use strict';
        	var calendarfac = {};

        	// these are labels for the days of the week
			var cal_days_labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

			// these are human-readable month name labels, in order
			var cal_months_labels = ['January', 'February', 'March', 'April',
			             'May', 'June', 'July', 'August', 'September',
			             'October', 'November', 'December'];

			// these are the days of the week for each month, in order
			var cal_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

			var currentView = $cookies.getObject('appoint_serv-currentView');

			var cal_current_date = new Date(); 
			var currentYear = $cookies.getObject('appoint_serv-currentYear');
			var currentMonth = $cookies.getObject('appoint_serv-currentMonth');
			var scheduleDay = $cookies.getObject('appoint_serv-scheduleDay');
			var docId = $cookies.getObject('appoint_serv-calender_docid');
			var currentWeek = $cookies.getObject('appoint_serv-currentWeek'); //it is 0 based

			var getCurrentYear = function() {
				if (currentYear === undefined)
					return cal_current_date.getFullYear();
				else
					return currentYear;
			};

			var setCurrentYear = function(val) {
				currentYear = val;
				$cookies.putObject('appoint_serv-currentYear', val, {secure: true});
			};			

			var getCurrentMonth = function() {
				if (currentMonth === undefined)
					return cal_current_date.getMonth();
				else
					return currentMonth;
			};		

			calendarfac.setCurrentMonth = function(val) {
				currentMonth = val;
				$cookies.putObject('appoint_serv-currentMonth', val, {secure: true});
			};	

			var getScheduleDay = function() {
				if (scheduleDay === undefined)
					return cal_current_date.getDay();
				else
					return scheduleDay;				
			};			

			calendarfac.setScheduleDay = function(val) {
				scheduleDay = val;
				$cookies.putObject('appoint_serv-scheduleDay', val, {secure: true});
			};

        	var getDataMonth = function() {
       			var month = getCurrentMonth();
	  			var year  = getCurrentYear();

		  		var firstDay = new Date(year, month, 1);
		  		var startingDay = firstDay.getDay();
		  		var monthLength = calendarfac.getMonthLength(year, month);	  			

	  			//get previous month length
	  			var monthStartPrev = 0;
	  			if (startingDay !== 0) {
		  			var monthlengthPrev = null;
		  			if (month === 0) {
		  				monthlengthPrev = calendarfac.getMonthLength(year-1, 0);
		  			} else {
		  				monthlengthPrev = calendarfac.getMonthLength(year, month-1);
		  			}
		  			monthStartPrev = monthlengthPrev - (startingDay - 1);
	  			}

	  			//get previous/next year and month
	  			var yearPrev = year;
	  			var monthPrev = month - 1;
	  			if (month === 0) {
	  				yearPrev = year - 1;
	  				monthPrev = 11;
	  			}
	  			var yearNext = year;
	  			var monthNext = month + 1;
	  			if (month === 11) {
	  				yearNext = year + 1;
	  				monthNext = 0;
	  			}
    		    
    		    //init data and collect out of bound dates 
    		    var day = 1;
    		    var row_month = [];
    		    var outOfBoundDates = [];
				// this loop is for weeks (rows)
				for (var i = 0; i < 9; i++) {
					// this loop is for weekdays (cells)
					var row_day = [];
					for (var j = 0; j <= 6; j++) { 
						if (day <= monthLength && (i > 0 || j >= startingDay)) {
							row_day.push({lable: day.toString(), isGray: false, numAppoints: 0});
							++day;
						}
						else if (day === 1 && j < startingDay && i === 0) {
							row_day.push({lable: monthStartPrev.toString(), isGray: true, numAppoints: 0});
							outOfBoundDates.push(new Date(yearPrev, monthPrev, monthStartPrev));
							++monthStartPrev;
						}
						else if (day > monthLength) {
							row_day.push({lable: (day - monthLength).toString(), isGray: true, numAppoints: 0});
							outOfBoundDates.push(new Date(yearNext, monthNext, (day - monthLength)));
							++day;								
						}							
					}
					row_month.push(row_day);	
					if (day > monthLength)
						break;
				}

	  			var docId = calendarfac.getDocId();
	  			var inBoundNumAppoints = [];
	  			return scheduleDayFactory.getNumAppointsMonth(docId, year, month).then(function(num) {
	  				inBoundNumAppoints = num;
	  				return scheduleDayFactory.getNumAppointsDays(docId, outOfBoundDates);
	  			})
	  			.then(function(outBoundNumAppoints) {
	  				var outBoundCounter = 0;
	  				var inBoundCounter = 0;
	  				for (var i = 0; i < row_month.length; ++i) {
	  					var row_day = row_month[i];
	  					for (var j = 0; j < row_day.length; ++j) {
	  						if (row_day[j].isGray === true) {
	  							row_day[j].numAppoints = outBoundNumAppoints[outBoundCounter];
	  							++outBoundCounter;
	  						}
	  						else {
	  							row_day[j].numAppoints = inBoundNumAppoints[inBoundCounter];
	  							++inBoundCounter;
	  						}
	  					}
	  				}

	        		var data = {
			            title: cal_months_labels[month] + ' ' + year,
			            hasHeader: true,
			            headers: cal_days_labels,
			            rows: row_month
	               	};

	               	return data;
	            });
        	};	

        	var getDataYear = function() {
        		var year = getCurrentYear();
        		currentMonth = cal_current_date.getMonth();

        		var docId = calendarfac.getDocId();
        		return scheduleDayFactory.getNumAppointsYear(docId, year).then(function(num_appoints) {
	        		var row_year = [];
	        		var countMonth = 0;
	        		for(var i = 0; i < 3; i++) {
	        			var row_month = [];
	        			for(var j = 0; j < 4; j++) {
	        				row_month.push({lable: cal_months_labels[countMonth], isGray: false, isToday: false, numAppoints: num_appoints[countMonth]});
	        				countMonth = countMonth + 1;
	        			}
	        			row_year.push(row_month);
	        		}

	        		var data = {
			            title: year,
			            hasHeader: false,
			            rows: row_year
	               	};
               		return data;
               });
        	};

        	var getNumberOfWeeks = function () {
        		var monthLength = calendarfac.getMonthLength(getCurrentYear(), getCurrentMonth());
        		var firstOfMonth = new Date(getCurrentYear(), getCurrentMonth(), 1);
    			var lastOfMonth = new Date(getCurrentYear(), getCurrentMonth(), monthLength);

    			var used = firstOfMonth.getDay() + monthLength + (6 - lastOfMonth.getDay());
    			return Math.ceil(used / 7);
			};

        	var incrMonth = function () {
	            var t = getCurrentMonth() + 1;
				if (t > 11)
					t = 0;
				calendarfac.setCurrentMonth(t);
        	};

        	var decrMonth = function () {
				var t = getCurrentMonth() - 1;
				if (t < 0)
					t = 11;
				calendarfac.setCurrentMonth(t);
        	};        	

			calendarfac.getMonthLength = function(year, month) {
				var monthLength = cal_days_in_month[month];	

				//leap year compensation
				if (month == 1) { // February only!
					if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0){
						monthLength = 29;
					}
				}	
				return monthLength;
			};        	

			calendarfac.getData = function() {
				if (currentView === 'month') {
					return getDataMonth();
				}
				else if (currentView === 'year') {
					return getDataYear();
				}
				return null;
			};

			calendarfac.setCurrentWeek = function(val) {
				currentWeek = val;
				$cookies.putObject('appoint_serv-currentWeek', currentWeek, {secure: true});
			};

			calendarfac.getWeekDates = function() {
				var row_day = [];

       			var month = getCurrentMonth();
	  			var year  = getCurrentYear();

	  			var firstDay = new Date(year, month, 1);
	  			var startingDay = firstDay.getDay();
	  			var monthLength = calendarfac.getMonthLength(year, month);	

	  			//get previous month length
	  			var monthStartPrev = 0;
	  			if (startingDay !== 0) {
		  			var monthlengthPrev = null;
		  			if (month === 0) {
		  				monthlengthPrev = calendarfac.getMonthLength(year-1, 0);
		  			} else {
		  				monthlengthPrev = calendarfac.getMonthLength(year, month-1);
		  			}
		  			monthStartPrev = monthlengthPrev - (startingDay - 1);
	  			}	  	

    		    var day = 1;
				// this loop is for weeks (rows)
				for (var i = 0; i < 9; i++) {
					// this loop is for weekdays (cells)
					var d = null;
					for (var j = 0; j <= 6; j++) { 
						if (day <= monthLength && (i > 0 || j >= startingDay)) {
							if (i === currentWeek) {
								d = new Date(year, month, day);
								row_day.push({lable: cal_days_labels[j] + ' ( ' + day + ' )', 
									isGray: false, date: d});
							}							
							++day;
						}
						else if (day === 1 && j < startingDay && i === currentWeek) {
							if (month === 0) {
								d = new Date(year - 1, 11, monthStartPrev);
								//d = new Date(year, month, 1);
							}
							else {
								d = new Date(year, month - 1, monthStartPrev);
								//d = new Date(year, month, 1);
							}
							
							row_day.push({lable: cal_days_labels[j] + ' ( ' + monthStartPrev + ' )', 
								isGray: true, date: d});
							++monthStartPrev;
						}	
						else if (day > monthLength  && i === currentWeek) {
							if (month === 11) {
								d = new Date(year + 1, 0, (day - monthLength));
							}
							else {
								d = new Date(year, month + 1, (day - monthLength));
							}
										
							row_day.push({lable: cal_days_labels[j] + ' ( ' + (day - monthLength) + ' )', 
								isGray: true, date: d});
							++day;								
						}											
					}
					// stop making rows if we've run out of days
					if (day > monthLength || i === currentWeek) {
						break;
					}	 
				}	
				return row_day;
			};      	

			calendarfac.onClickNext = function() {
				if (currentView === 'month') {
	                incrMonth();
				}
				else if (currentView === 'year') {
					setCurrentYear(getCurrentYear() + 1);
				}
				else if (currentView === 'week') {
					currentWeek += 1;
					if (currentWeek > getNumberOfWeeks() - 1)
					{
						currentWeek = 0;
						incrMonth();
					}
					$cookies.putObject('appoint_serv-currentWeek', currentWeek, {secure: true});
				}
			};  

			calendarfac.onClickPrev = function() {
				if (currentView === 'month') {
					decrMonth();
				}
				else if (currentView === 'year') {
					setCurrentYear(getCurrentYear() - 1);
				}		
				else if (currentView === 'week') {
					currentWeek -= 1;
					if (currentWeek < 0)
					{
						decrMonth();
						currentWeek = getNumberOfWeeks() - 1;
					}
					$cookies.putObject('appoint_serv-currentWeek', currentWeek, {secure: true});					
				}		
			};  

			calendarfac.onClickToday = function() {
				currentView = 'month';
				setCurrentYear(cal_current_date.getFullYear());
				calendarfac.setCurrentMonth(cal_current_date.getMonth());
				$cookies.putObject('appoint_serv-currentView', currentView, {secure: true});				
			};	

			calendarfac.onClickMonth = function() {
				currentView = 'month';
				$cookies.putObject('appoint_serv-currentView', currentView, {secure: true});
			};

			calendarfac.onClickYear = function() {
				currentView = 'year';
				$cookies.putObject('appoint_serv-currentView', currentView, {secure: true});
			};

			calendarfac.onClickWeek = function() {
				currentView = 'week';
				$cookies.putObject('appoint_serv-currentView', currentView, {secure: true});
			};						

			calendarfac.isToday = function(day) {
				var date = new Date(getCurrentYear(), getCurrentMonth(),
					day);
            	return utilFactory.isDateEqual(date, new Date());
			};	

			calendarfac.isCurrentViewYear = function() {
				if (currentView === 'year')
					return true;
				return false;
			};					

			calendarfac.isCurrentViewMonth = function() {
				if (currentView === 'month')
					return true;
				return false;
			};

			calendarfac.isCurrentViewWeek = function() {
				if (currentView === 'week')
					return true;
				return false;
			};			

			calendarfac.getScheduleDayLable = function() {
	  			return calendarfac.getDayLable(getScheduleDay(), getCurrentMonth(), getCurrentYear());
			};

			calendarfac.getScheduleMonthLable = function() {
	  			return cal_months_labels[getCurrentMonth()] + " " + getCurrentYear();
			};			

			calendarfac.getScheduleDayDate = function() {
	  			return new Date(getCurrentYear(), getCurrentMonth(), getScheduleDay());
			};

			calendarfac.getScheduleWeek = function() {
	  			return 1;
			};			

			calendarfac.getDayLable = function(date, month, year) {
	  			var firstDay = new Date(year, month, 1);
	  			var startingDay = firstDay.getDay();
	  			var dayMonth = 0;
	  			var dayLable = "";
				for (var i = 0; i < 9; i++) {
					for (var j = 0; j <= 6; j++) { 
						if (i > 0 || j >= startingDay) {
							dayMonth++;
							if (dayMonth == date) {
								dayLable = cal_days_labels[j];
								break;
							}
						}
					}				
				}
				return dayLable + ", " + cal_months_labels[month] + " " + date.toString() + ", " + year;				
			};

			calendarfac.setDocId = function(id) {
				docId = id;
				$cookies.putObject('appoint_serv-calender_docid', id, {secure: true});
			};

			calendarfac.getDocId = function() {
        		if (docId === undefined)
        			$location.path('/');
        		return docId;
			};

        	return calendarfac;
        }]);
