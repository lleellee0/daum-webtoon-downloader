const request = require('request');
const cheerio = require('cheerio');
const downloadImages = require('./downloadImages.js')
const log = require('./log.js')

const findWebToonImages = (article_id, path, hmCu, hts, prof, ts, lsid, retryCount) => { // titleId is Webtoon's id, no is Sequence's id
  console.log(`${article_id}화 저장중..`);
  log.addLog(`${article_id}화를 저장중입니다.`)
  let cookieJar = request.jar();  // 19세 이상 인증 웹툰에 대해서는 19세 이상인 다음 아이디로 로그인 된 계정에서 쿠키를 가져와야함.
  cookieJar.setCookie(`HM_CU=${hmCu}; path=/; domain=daum.net`, 'http://webtoon.daum.net');
  cookieJar.setCookie(`HTS=${hts}; path=/; domain=daum.net`, 'http://webtoon.daum.net');
  cookieJar.setCookie(`PROF=${prof}; path=/; domain=daum.net`, 'http://webtoon.daum.net');
  cookieJar.setCookie(`TS=${ts}; path=/; domain=daum.net`, 'http://webtoon.daum.net');
  cookieJar.setCookie(`LSID=${lsid}; path=/; domain=daum.net`, 'http://webtoon.daum.net');

  request({
    jar:cookieJar,
    uri:`http://webtoon.daum.net/data/pc/webtoon/viewer_images/${article_id}`,
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let json_body = JSON.parse(body);

      let endNumber = json_body.data.length;
      let uriArr = json_body.data;

      downloadImages.downloadWebToonImages(
        uriArr,
        article_id,
        path,
        1,
        endNumber
      );
    } else {
      console.log('err ' + article_id + "화. 재시도 합니다. 남은 재시도 횟수 : " + --retryCount);
      log.addErrorLog(`${article_id}화에서 이미지 링크를 추출하다가 실패했습니다. 남은 재시도 횟수 : ${retryCount}`);
      if(retryCount > 0)
        findWebToonImages(webtoon_ids[i], path, hmCu, hts, prof, ts, lsid, retryCount);
      console.log(error);
    }
  });
}

module.exports = {
  findWebToonImages: findWebToonImages
}