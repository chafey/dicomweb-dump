# dicomweb-dump
CLI tool to dump DICOMweb WADO-RS responses to disk

## Status

In development/alpha (as of Nov 2, 2021).  Beta release targeted for Nov 8, 2021

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

Install globally

> npm install -g .

Uninstall

> npm uninstall -g dicomweb-dump

## Usage

```
Usage: dicomweb-dump [options]

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
  -c, --concurrency                controls maximum concurrent request count (de
                                   fault is 1)                          [number]
  -a, --abort                      abort processing on any errors (default is fa
                                   lse/off)                            [boolean]
  -h, --help                       Show help                           [boolean]
```

## Output Structure

```
$outputFolder/$studyUid/metadata - study metadata
$outputFolder/$studyUid/series/<seriesuid>/metadata - series metadata
$outputFolder/$studyUid/series/<seriesuid>/instances/<sopinstanceuid>/metadata - instance metadata
$outputFolder/$studyUid/series/<seriesuid>/instances/<sopinstanceuid>/frames/<frames 1..n> - Image Frame
$outputFolder/$studyUid/series/<seriesuid>/instances/<sopinstanceuid>/_/<sopinstanceuid> - DICOM P10 instance (if -i option is passed)
```
## Examples

### Single Image CR
```
dicomweb-dump -w https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies -s 1.3.6.1.4.1.25403.345050719074.3824.20170126085406.1 -o output -i -m
```

### Large Ct
```
dicomweb-dump -w https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies -s 1.3.6.1.4.1.14519.5.2.1.7009.2403.129940714907926843330943219641 -o output -s
```

Each output file will have a corresponding file with the prefix .dump.json which includes details such as
time to complete request, HTTP headers returned and multi-part mime header

## TODO
  
### Features

* Dump bulkdata
* Add option to just dump instance metadata/frames/bulk data
* Enhance getAttachments() to return more info from the multi-part mime header
* Add option to use qido-rs study series and series instances to get UIDs
* Add option to dump qido-rs study series and series instance responses

### Reuse
* Consider separating the fetch logic into a separate library so it can be re-used?

### Optimizations
* See if getAttachments() can be optimized - just use Buffer instead of Uint8Array?  
* Make application streamable to reduce memory?
* -m to store the extracted content/attachment as separate file
