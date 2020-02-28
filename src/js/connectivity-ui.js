// Utility functions to display test results in the sample app UI
import createChart from './chart.js';

var charts = {};
var audioOnlyTest;
const resultCount = {
  audio: 0,
  video: 0
};
const prevBitsReceived = {
  audio: 0,
  video: 0
};
var stopBtnTimeout;
var stopTestBtn = document.getElementById('stop_test');
const failureTypes = [];
var messages = {
  "api": {
    "sectionTitle": {
      "success": "KUDO API server - Connected",
      "error": "KUDO API server - Error"
    },
    "results":{
      "success": "Successfully connected to the KUDO API server.",
      "error": "Could not connect to API server"
    }
  },
  "messaging": {
    "sectionTitle": {
      "success": "KUDO Messaging WebSocket - Connected",
      "error": "KUDO Messaging WebSocket - Error"
    },
    "results":{
      "success": "Successfully connected to the KUDO Messaging WebSocket.",
      "error": "Could not connect to Messaging WebSocket"
    }
  },
  "media": {
    "sectionTitle": {
      "success": "KUDO Media Server - Connected",
      "error": "KUDO Media Server - Error"
    },
    "results":{
      "success": "Successfully connected to the KUDO Media Server.",
      "error": "Could not connect to Media Server"
    }
  },

};

export function init(audioOnly) {
  audioOnlyTest = audioOnly;
  document.getElementById('quality_status_container').style.display = 'block';
  if (audioOnlyTest) {
    document.getElementById('video').style.display = 'none';
  }
}

export function checkToDisplayStopButton() {
  if (!stopBtnTimeout) {
    stopBtnTimeout = window.setTimeout(function () {
      stopTestBtn.style.display = 'block';
    }, 4000);
  }
}

export function hideStopButton() {
  stopTestBtn.style.display = 'none';
}

export function displayTestConnectivityResults(results) {
  const statusContainer = document.getElementById('connectivity_status_container');
  const statusMessageEl = statusContainer.querySelector('p');
  const statusIconEl = statusContainer.querySelector('img');
  statusMessageEl.style.display = 'block';

  let statusText;
  if (results.success) {
    statusMessageEl.classList.remove("error");
    statusText = 'Connected';
    statusIconEl.src = 'assets/icon_pass.svg';
  } else {
    statusMessageEl.classList.add("error");
    statusText = convertFailedTestsToString(results.failedTests);
    statusIconEl.src = 'assets/icon_error.svg';
  }
  statusMessageEl.textContent = statusText;
}

function setData(section, flag) {
  const statusContainer = document.getElementById('connectivity_tests');
  const serverStatus = statusContainer.querySelector("#" + section + '_server_status');
  const statusIconEl = statusContainer.querySelector("#" + section + '_img');
  const sectionName = statusContainer.querySelector('#' + section + '_section_name');
  const apiResults = statusContainer.querySelector('#' + section + '_results');

  sectionName.textContent = messages[section]['sectionTitle'][(flag) ? 'success' : 'error'];
  statusIconEl.src = (flag) ? 'https://tokbox.com/developer/tools/precall/images/server-on.png' : 'https://tokbox.com/developer/tools/precall/images/server-off.png';
  apiResults.textContent = messages[section]['results'][(flag) ? 'success' : 'error'];
  if(flag){
    serverStatus.classList.remove('connectivity_test_fail');
    serverStatus.classList.add('connectivity_test_success');
  } else{
    serverStatus.classList.remove('connectivity_test_success');
    serverStatus.classList.add('connectivity_test_fail');
  }
}

export function displayResults() {
  const statusContainer = document.getElementById('connectivity_tests');

  if(failureTypes.indexOf('OpenTok.js') > -1){
    setData('api', false);
    setData('messaging', false);
    setData('media', false);
  } else {
    setData('api', failureTypes.indexOf('api') <= -1);
    setData('messaging', failureTypes.indexOf('messaging') <= -1);
    setData('media', failureTypes.indexOf('media') <= -1);
    // setData('log', failureTypes.indexOf('logging') <= -1);
  }
  statusContainer.style.display = 'block';
}

function convertFailedTestsToString(failedTests) {
  for (var i = 0; i < failedTests.length; i++) {
    failureTypes.push(failedTests[i].type);
  }
  var mappedFailures = [];
  if (failureTypes.indexOf('api') > -1) {
    mappedFailures.push('KUDO API server');
  }
  if (failureTypes.indexOf('messaging') > -1) {
    mappedFailures.push('KUDO messaging WebSocket');
  }
  if (failureTypes.indexOf('media') > -1) {
    mappedFailures.push('KUDO Media Router');
  }
  if (failureTypes.indexOf('logging') > -1) {
    mappedFailures.push('KUDO logging server');
  }

  if(failureTypes.indexOf('OpenTok.js') > -1){
    mappedFailures.push('Camera/Microphone not found');
  }
  return mappedFailures.join(', ');
}

function rateMosScore(mos) {
  if (mos >= 3.8) {
    return 'Excellent';
  }
  if (mos >= 3.1) {
    return 'Good';
  }
  if (mos >= 2.4) {
    return 'Fair';
  }
  if (mos >= 1.7) {
    return 'Poor';
  }
  return 'Bad';
}

export function displayTestQualityResults(error, results) {
  hideStopButton();
  const statusContainerEl = document.getElementById('quality_status_container');
  const statusEl = statusContainerEl.querySelector('p');
  const statusIconEl = statusContainerEl.querySelector('img');
  statusContainerEl.querySelector('#audio .results').style.display = 'block';
  statusContainerEl.querySelector('#video .results').style.display = 'block';

  if (error) {
    statusEl.classList.add("error");
    statusEl.textContent = 'Permission Denied: End-user denied permission to hardware devices. Please give permission in the browser to proceed.';
    statusIconEl.src = 'assets/icon_error.svg';
    $(".video").addClass('d-none');
    $(".audio").addClass('d-none');

    return;
  }
  $(".video").removeClass('d-none');
  $(".audio").removeClass('d-none');
  statusEl.textContent = 'Test complete.';
  let resultsEl = statusContainerEl.querySelector('#audio .results');
  resultsEl.style.display = 'block';
  resultsEl.querySelector('#audio-supported').textContent = results.audio.supported ? 'Yes' : 'No';
  const audioMos = results.audio.mos;
  resultsEl.querySelector('#audio-mos').textContent = audioMos.toFixed(2)
    + ' (' + rateMosScore(audioMos) + ')';
  resultsEl.querySelector('#audio-bitrate').textContent = results.audio.bitrate ?
    (results.audio.bitrate / 1000).toFixed(2) + ' kbps' : '--';
  resultsEl.querySelector('#audio-plr').textContent = results.audio.supported ?
    (results.audio.packetLossRatio / 100).toFixed(2) + '%' : '--';
  resultsEl = statusContainerEl.querySelector('#video .results');
  resultsEl.querySelector('#video-supported').textContent = results.video.supported ? 'Yes' : 'No';
  const videoMos = results.video.mos;
  resultsEl.querySelector('#video-mos').textContent = videoMos.toFixed(2)
    + ' (' + rateMosScore(videoMos) + ')';
  resultsEl.querySelector('#video-bitrate').textContent = results.video.bitrate ?
    (results.video.bitrate / 1000).toFixed(2) + ' kbps' : '--';
  resultsEl.querySelector('#video-plr').textContent = results.video.supported ?
    (results.video.packetLossRatio / 100).toFixed(2) + '%' : '--';
  resultsEl.querySelector('#video-recommendedResolution').textContent =
    results.video.recommendedResolution || '--';
  resultsEl.querySelector('#video-recommendedFrameRate').textContent =
    results.video.recommendedFrameRate ? results.video.recommendedFrameRate + ' fps' : '--';
  if (results.audio.supported) {
    if (results.video.supported || audioOnlyTest) {
      statusIconEl.src = 'assets/icon_pass.svg';
    } else {
      statusIconEl.src = 'assets/icon_warning.svg';
      var reasonEl = resultsEl.querySelector('#video-unsupported-reason');
      reasonEl.style.display = 'block';
      reasonEl.querySelector('span').textContent = results.video.reason;
    }
  } else if (!results.video.supported) {
    statusIconEl.src = 'assets/icon_error.svg';
  }
}

export function graphIntermediateStats(mediaType, stats) {
  const mediaStats = stats[mediaType];
  if (!charts[mediaType]) {
    charts[mediaType] = createChart(mediaType);
  }
  const bitsReceived = mediaStats && mediaStats.bytesReceived ? mediaStats.bytesReceived * 8 : 0;
  resultCount[mediaType]++;
  charts[mediaType].series[0].addPoint({
    x: resultCount[mediaType],
    y: bitsReceived - prevBitsReceived[mediaType]
  }, true, false);
  const chartTitle = (stats.phase === 'audio-only') && (mediaType === 'video') ?
    'Testing audio-only stream' :
    'Bitrate over ' + resultCount[mediaType] + 'sec';
  charts[mediaType].setTitle(null, {text: chartTitle});
  prevBitsReceived[mediaType] = bitsReceived;
}
