const request = require('request');
const fs = require('fs');
const log = require('./log.js')

const paddingNumber = (padString, number) => {
  let pad = padString;
  let numberString = "" + number;
  return pad.substring(0, pad.length - numberString.length) + numberString;
};

const downloadWebToonImages = (uriArr, no, downloadPath, startNumber, endNumber) => { // startNumber is mostly 1
  for(let i = startNumber; i <= endNumber; i++) {
    let uri = uriArr[i-1].url;
    downloadWebToonImage(uri, no, downloadPath, startNumber, endNumber, i, 3);
  }
}

const downloadWebToonImage = (uri, no, downloadPath, startNumber, endNumber, i, retryCount) => {
    request({
      uri:uri,
      headers: {
        accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        acceptEncoding:'gzip, deflate',
        acceptLanguage:'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,da;q=0.6',
        connection:'keep-alive',
        upgradeInsecureRequests:'1',
        userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36'
      },
      encoding: 'binary'
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        fs.writeFile(`${downloadPath}\\${paddingNumber("0000", no)}-${paddingNumber("000", i)}.jpg`, body, 'binary', (err) => {if(err) console.log(err)});
      } else {
        console.log("Connection Timeout. " + no + " " + i + " 재시도 합니다. 남은 재시도 횟수 : 3");
        log.addErrorLog(`${no}화에서 ${i}번째 그림을 다운로드하다가 실패했습니다. 남은 재시도 횟수 : ${retryCount}`);
        if(retryCount > 0)
          downloadWebToonImages(uri, no, downloadPath, startNumber, endNumber, i, retryCount--);

        console.log(error);
      }
    });
}

module.exports = {
  downloadWebToonImages: downloadWebToonImages
}