import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import {simpleParser} from 'mailparser'

const getAndWrite = async (baseUrl, basePath, resourcePath, multiPart, options) => {
    const url = path.join(baseUrl, resourcePath)
    const start = Date.now();
    const response = await fetch(url)
    const requestTimeInMS = Date.now() - start;
  
    if(response.status !== 200) {
      throw {
        message: "Error fetching " + url,
        response
      }
    }
  
    let bodyAsBuffer = await response.buffer()
  
    const dump = {
      url: url,
      requestTimeInMS: requestTimeInMS,
      httpHeaders: response.headers.raw()
    }
  
    if(multiPart) {
        const parsed = await simpleParser(bodyAsBuffer)

        dump.multiPartHeaders = Object.fromEntries(parsed.headers)

        if(options.stripMultiPartMimeWrapper) {
            bodyAsBuffer = parsed.attachments[0].content
        }
    } 
    
    //console.log(response)
    //console.dir(dump)
  
    fs.mkdirSync(basePath, { recursive: true })
    const filePath = path.join(basePath, resourcePath)
    fs.writeFileSync(filePath, bodyAsBuffer)
    fs.writeFileSync(filePath + '.dump.json', JSON.stringify(dump, null, 2))
  
    return {
        bodyAsBuffer,
        dump
    }
  }

  export {getAndWrite}