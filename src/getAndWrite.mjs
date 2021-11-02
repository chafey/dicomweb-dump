import fs from 'fs'
import path from 'path'
import getAttachments from './getAttachments.mjs'
import { URL } from 'url'
import https from 'https'

function printProgress(progress) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(progress);
}

let totalRequestCount = 0
let errorCount = 0
let completedRequestCount = 0

const getAndWrite = async (baseUrl, basePath, resourcePath, multiPart, options) => {

  printProgress('' + completedRequestCount + '/' + errorCount + '/' + ++totalRequestCount)

  const fullUrl = path.join(baseUrl, resourcePath)
  const start = Date.now();

  const myURL = new URL(fullUrl);

  const requestOptions = {
    hostname: myURL.host,
    path: myURL.pathname,
  }

  return new Promise((resolve, reject) => {

    const callback = (response) => {
      const data = [];
      response.on('data', function (chunk) {
        data.push(chunk)
      });

      //the whole response has been received, so we just print it out here
      response.on('end', async function () {
        const requestTimeInMS = Date.now() - start;
        if (response.statusCode !== 200) {
          printProgress('' + completedRequestCount + '/' + ++errorCount + '/' + totalRequestCount)
          return reject({
            message: "Server returned HTTP status code " + response.statusCode,
            url: fullUrl
          })
        }

        let bodyAsBuffer = Buffer.concat(data);

        const dump = {
          url: fullUrl,
          requestTimeInMS: requestTimeInMS,
          httpHeaders: response.headers
        }


        //console.log(response)
        //console.dir(dump)

        fs.mkdirSync(basePath, { recursive: true })
        const filePath = path.join(basePath, resourcePath)
        fs.writeFileSync(filePath, bodyAsBuffer)

        if (multiPart) {
          try {
            const attachments = getAttachments(bodyAsBuffer)
            if (options.stripMultiPartMimeWrapper) {
              const filePath = path.join(basePath, resourcePath + ".bin")
              fs.writeFileSync(filePath, attachments[0].content)
            }
            dump.contentType = attachments[0].contentType
          } catch (ex) {
            return reject({
              message: "Multipart parsing failed",
              url: fullUrl
            })
          }
        }

        fs.writeFileSync(filePath + '.dump.json', JSON.stringify(dump, null, 2))

        printProgress('' + ++completedRequestCount + '/' + errorCount + '/' + totalRequestCount)

        resolve({
          bodyAsBuffer,
          dump
        })
      });
    }
    const maxRetries = 3 // sometimes a request fails, so retry up to 3 times
    let i = 1
    while (true) {
      https.request(requestOptions, callback).on('error', (e) => {
        //console.error('Error - retrying #', i, maxRetries)
        // ignore
        if (i === maxRetries) {
          return reject({
            message: "Request error ",
            url: fullUrl,
          })
        }
      }).end()
      break
    }
  })
}

export { getAndWrite }