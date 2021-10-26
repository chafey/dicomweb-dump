# dicomweb-dump
CLI tool to dump DICOMweb WADO-RS responses to disk

## Features
* Dump study metadata
* Dump series metadata
* Dump instance metadata
* Dump instance
* Dump instance frames

## Prerequisites

* NodeJS (v14.18.1 used but earlier/later versions should also)
* NPM

Install dependencies
> npm install

## Usage

> node src/index.mjs <URL to study on DICOMweb server> <output directory>

## Examples

### Single Image CR
> node src/index.mjs https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.1 output

### Large Ct
> node src/index.mjs https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.14519.5.2.1.7009.2403.129940714907926843330943219641 output

## TODO

* Add argument to strip out multi-part mime wrapper
* Add arguments to control what data is actually fetched (e.g. study metadata)
* Dump out the HTTP Headers
* Dump bulkdata
