# dicomweb-dump
CLI tool to dump DICOMweb WADO-RS responses to disk

## Features
* Dump study metadata
* Dump series metadata
* Dump instance metadata
* Dump instance
* Dump instance frames
* Strip multi-part mime header before writing to disk
* Records HTTP headers, time to get response and multi-part mime headers to disk $.dump.json

## Prerequisites

* NodeJS (v14.18.1 used but earlier/later versions should also)
* NPM

Install dependencies
> npm install

## Usage

```
Usage: index.mjs [options]

Options:
      --version                    Show version number                 [boolean]
  -w, --wadoRsRootUrl              WADO-RS Root Url          [string] [required]
  -s, --studyUid                   The Study Instance UID to dump
                                                             [string] [required]
  -o, --outputFolder               path                      [string] [required]
  -m, --stripMultiPartMimeWrapper  removes the multi part mime wrapper around im
                                   age frames and instances            [boolean]
  -q, --quiet                      suppresses status messages to stdout[boolean]
  -i, --include full instance      adds the full instance to the dump (DICOM P10
                                    instance)                          [boolean]
  -h, --help                       Show help                           [boolean]  ```

## Examples

### Single Image CR
```
src/index.mjs -w https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies -s 1.3.6.1.4.1.25403.345050719074.3824.20170126085406.1 -o output -s
```

### Large Ct
```
src/index.mjs -w https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies -s 1.3.6.1.4.1.14519.5.2.1.7009.2403.129940714907926843330943219641 -o output -s
```

## Output Structure

```
$outputFolder/$studyUid/metadata - study metadata
$outputFolder/$studyUid/series/<seriesuid>/metadata - series metadata
$outputFolder/$studyUid/series/<seriesuid>/instances/<sopinstanceuid>/metadata - instance metadata
$outputFolder/$studyUid/series/<seriesuid>/instances/<sopinstanceuid>/frames/<frames 1..n> - Image Frame
$outputFolder/$studyUid/series/<seriesuid>/instances/<sopinstanceuid>/_/<sopinstanceuid> - DICOM P10 instance (if -i option is passed)
```

Each output file will have a corresponding file with the prefix .dump.json which includes details such as
time to complete request, HTTP headers returned and multi-part mime header

## TODO

* Dump bulkdata
