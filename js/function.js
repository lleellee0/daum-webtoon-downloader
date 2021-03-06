const findImages = require('./js/findImages.js');
const log = require('./js/log.js');
const fs = require('fs');
const request = require('request');

// Add Event Lintener
let inputFakePath = document.getElementById("fake-path");
let inputRealPath = document.getElementById("path");

$(inputFakePath).on('click', function() {
  $(inputRealPath).click();
});

$(inputRealPath).on('change', function(event) {
  event.preventDefault();
  $(inputFakePath).val(inputRealPath.files[0].path);
});

const downloadWebtoon = () => {
  log.addLog(`다운로드를 시작합니다. 그림이 실제로 다운로드가 안될 경우 입력하신 값들(특히 HM_CU, HTS, PROF, TS, LSID)을 다시 확인하세요.`);
  let webtoonUrl = document.getElementById("webtoon-url").value;
  let path = document.getElementById("path").files[0].path;
  let hmCu = document.getElementById("hmCu").value;
  let hts = document.getElementById("hts").value;
  let prof = document.getElementById("prof").value;
  let ts = document.getElementById("ts").value;
  let lsid = document.getElementById("lsid").value;

  let webtoon_ids = [];

  let cookieJar = request.jar();  // 19세 이상 인증 웹툰에 대해서는 19세 이상인 다음 아이디로 로그인 된 계정에서 쿠키를 가져와야함.
  cookieJar.setCookie(`HM_CU=${hmCu}; path=/; domain=daum.net`, 'http://webtoon.daum.net');
  cookieJar.setCookie(`HTS=${hts}; path=/; domain=daum.net`, 'http://webtoon.daum.net');
  cookieJar.setCookie(`PROF=${prof}; path=/; domain=daum.net`, 'http://webtoon.daum.net');
  cookieJar.setCookie(`TS=${ts}; path=/; domain=daum.net`, 'http://webtoon.daum.net');
  cookieJar.setCookie(`LSID=${lsid}; path=/; domain=daum.net`, 'http://webtoon.daum.net');

  request({
    jar:cookieJar,
    uri:webtoonUrl.replace('/webtoon/view', '/data/pc/webtoon/view'),
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let json_body = JSON.parse(body);
      console.log(body);
      let webtoon_episodes = json_body.data.webtoon.webtoonEpisodes;
      
      webtoon_episodes.forEach(v => {
        if(v.serviceType === "free")
          webtoon_ids.push(v.articleId);
      });
      
      log.addLog(`총 ${webtoon_episodes.length}화 중 ${webtoon_ids.length}화가 무료입니다.(에피소드, 에필로그 등 포함) 무료인 화에 대해 다운로드 하겠습니다.`);
      
      for(let i = 0 ,j = 0; i < webtoon_ids.length; i++, j++)
        setTimeout(() => {
          findImages.findWebToonImages(webtoon_ids[i], path, hmCu, hts, prof, ts, lsid, 3);
        }, j * 2 * 1000);
    }
  });

  return false;
}

const onViewerPathChange = () => {
  clearViewerList();
  setViewerList();
}

const clearViewerList = () => {
  let viewerList = document.getElementById("list");
  $(viewerList).html('');
}

const setViewerList = () => {
  let path;
  if(document.getElementById("path").files[0] === undefined)  // "목록으로" 버튼으로 들어온 경우
    path = decodeURI(getUrlVars()["path"]);
  else                                                        // 정상적으로 변경해서 들어온 경우
    path = document.getElementById("path").files[0].path;

  if(path === "undefined")                                    // 처음 창을 열었을 때의 상태
    return;

  console.log(path);
  
  fs.readdir(path, (err, files) => {
    if(err) {
      console.error(err);
      return;
    }
    let noSet = new Set();
    for(let i = 0; i < files.length; i++)
      noSet.add(files[i].split('-')[0]);
    console.log(noSet);
    
    let viewerList = document.getElementById("list");
    noSet.forEach((value)=> {
      $(viewerList).append(`<li><a href="detail.html?no=${value}&path=${path}">${value}</a></li>`);
    });
  });
}

const setViewerImages = () => {
  console.log(window.location.search);

  let no = getUrlVars()["no"];
  let path = decodeURI(getUrlVars()["path"]);

  console.log(no);
  console.log(path);
  
  let viewerImages = document.getElementById("viewer_images");
  fs.readdir(path, (err, files) => {
    if(err) {
      console.error(err);
      return;
    }
    let imageArray = new Array;
    for(let i = 0; i < files.length; i++) {
      if(files[i].split('-')[0] === no) {
        imageArray.push(files[i]);
      }
    }

    imageArray.forEach((value, i) => {
      $(viewerImages).append(`<img class="viewer_image" src="${path+'\\'+value}" style="display: inherit; margin: 0 auto;"></img>`);
    });
  });
}

const setTopBottomMenu = () => {
  // let topPrev = document.getElementById("top_prev");
  // let topNext = document.getElementById("top_next");
  let topList = document.getElementById("top_list");
  // let bottomPrev = document.getElementById("bottom_prev");
  // let bottomNext = document.getElementById("bottom_next");
  let bottomList = document.getElementById("bottom_list");

  let no = parseInt(paddingNumber("0000", getUrlVars()["no"]), 10);
  let path = decodeURI(getUrlVars()["path"]);
  console.log(no);
  
  // $(topPrev).append(`<a href="detail.html?no=${paddingNumber("0000", no-1)}&path=${path}">이전화</a>`);
  // $(topNext).append(`<a href="detail.html?no=${paddingNumber("0000", no+1)}&path=${path}">다음화</a>`);
  $(topList).append(`<a href="list.html?path=${path}">목록으로</a>`);
  // $(bottomPrev).append(`<a href="detail.html?no=${paddingNumber("0000", no-1)}&path=${path}">이전화</a>`);
  // $(bottomNext).append(`<a href="detail.html?no=${paddingNumber("0000", no+1)}&path=${path}">다음화</a>`);
  $(bottomList).append(`<a href="list.html?path=${path}">목록으로</a>`);
}

const getUrlVars = () => {
  let vars = {};
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}

const paddingNumber = (padString, number) => {
  let pad = padString;
  let numberString = "" + number;
  return pad.substring(0, pad.length - numberString.length) + numberString;
};