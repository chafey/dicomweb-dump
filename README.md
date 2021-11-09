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
* Records HTTP headers, time to get response and multi-part mime headers to disk $.dump.json
* Concurrent requests for faster downloads (and stress testing servers)
* Supports requests over http2 (on by default - can be disabled)

## Prerequisites

* NodeJS (v16.13.0 or later)
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
                                   age frames and instances and saves it as a se
                                   parate file with .bin extension     [boolean]
  -q, --quiet                      suppresses status messages to stdout[boolean]
  -i, --include full instance      adds the full instance to the dump (DICOM P10
                                    instance)                          [boolean]
  -c, --concurrency                controls maximum concurrent request count (de
                                   fault is 1)                          [number]
  -a, --abort                      abort processing on any errors (default is fa
                                   lse/off)                            [boolean]
  -r, --retry                      request failure retry count (default 3)
                                                                        [number]
  -z, --authorization              HTTP Authorization header value      [string]
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

### Large CT (Note - some images in this study return errors)
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
* Report performance/timing information
* Add option to pretty print JSON?
* Write to disk with multi-part mime headers removed in $.bin

### Reuse
* Consider separating the fetch logic into a separate library so it can be re-used?

### Optimizations
* See if getAttachments() can be optimized - just use Buffer instead of Uint8Array?  
* Make application streamable to reduce memory?
