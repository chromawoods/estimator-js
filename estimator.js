/*
 * Estimates remaining time in a process based on a number
 * of checkpoints and the duration between them.
 */
var estimator = (function() {


	var _settings = {}, _isRunning = false,
		_millisLeft = 0, _checkpointsLeft = 0,
		_pastDurations = [], _startMillis = null;


	/* Returns a human readable time format based on milli-seconds. */
	var getHumanFormat = function(millis) {

		switch(true) {

			/* 24 hours or more. */
			case (millis >= 86400000):
				return parseInt((millis / 86400000), 10).toString() + 'd';

			/* 60 minutes and up til (but not including) 24 hours. */
			case (millis >= 3600000):
				return parseInt((millis / 3600000), 10).toString() + 'h';

			/* 60 seconds and up til (but not including) 60 minutes. */
			case (millis >= 60000):
				return parseInt((millis / 60000), 10).toString() + 'm';

			/* Anything below 1 minute. */
			default:
				return parseInt((millis / 1000), 10).toString() + 's';
		}


	};


	/* Returns an object summarizing the overall status. */
	var getStatus = function(now) {

		now = now || Date.now();

		return {
			percentDone: parseInt(100 * (1 - (_checkpointsLeft / _settings.checkpoints))),
			totalElapsedMillis: now - _startMillis,
			totalElapsedHuman: getHumanFormat(now - _startMillis),
			millisLeft: _millisLeft,
			humanLeft: getHumanFormat(_millisLeft),
			checkpointsLeft: _checkpointsLeft,
			done: !_isRunning
		};

	};


	/* Returns the average value in an integer array. */
	var getArrayAvg = function(arr) {
		return (function(l, sum) {
			while (l--) { sum += arr[l]; }
			return sum / arr.length;
		}(arr.length, 0)) || 0;
	};


	/* Advance one step. Returns summary. */
	var next = function() {

		var now = Date.now();

		if (_checkpointsLeft) {
			_millisLeft = getArrayAvg(_pastDurations) * _checkpointsLeft;
			_checkpointsLeft--;
			_pastDurations.push(now - _lastTimestamp);
			_lastTimestamp = now;
		}

		else {
			_isRunning = false;
		}

		return getStatus(now);
	};


	/* Setup an estimate based on options. */
	var estimate = function(options) {

		if (options.checkpoints) {
			_settings = options || {};
			_lastTimestamp = Date.now();
			_checkpointsLeft = _settings.checkpoints;
			_startMillis = Date.now();
			_isRunning = true;
		}

		else {
			console.log('Estimator needs checkpoints!');
		}

		return getStatus(_startMillis);
	};


	return {
		estimate: estimate,
		next: next,
		status: getStatus
	};

}());
