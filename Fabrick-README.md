This project was forked from https://github.com/prebid/Prebid.js.

There are 2 branches kept in https://github.com/neustar/Prebid.js repo for our Fabrick purposes
 1) __*fabrick-for-merging*__: 
    intended to be used for PRs back into origin/master and does not contain the set of files
    that are specifically to assist in the development of the fabrick module.
 2) __*fabrick-dont-merge*__:
    intended to contain the fabrick code changes as well as the set of files that assist in the
    development of the fabrick module, but are not to be merged back into origin/master

The only files that should potentially be included in PRs back to origin/master are:
1. ./modules/fabrickIdSystem.js
1. ./modules/fabrickIdSystem.md
1. ./test//spec/modules/fabrickIdSystem_spec.js

Helpful scripts for debugging*:
1. __*./delete_all_but_fabrick.sh*__ - Deletes most other modules to make the tests much faster to run.
1. __*./restore_deleted_files.sh*__ - Restores the deleted modules to make commits easier.

* I just noticed that you can now run unit tests for a particular file, so maybe the above scripts are necessary anymore.  See the main README.md and search for "To run the unit tests for a perticular file"

To run the server locally:
```
$ npm install
$ gulp serve-fast --modules=appnexusBidAdapter,unifiedIdSystem,fabrickIdSystem
```
Then navigate to: [http://localhost:9999/integrationExamples/gpt/neustar_example.html](http://localhost:9999/integrationExamples/gpt/neustar_example.html)

To test the server locally:
```
$ gulp test-coverage
$ # or this one for quicker iterations
$ gulp test-no-lint
```
Then navigate to: [file:///Users/banderso/dev/Prebid.js/build/coverage/lcov-report/modules/index.html](file:///Users/banderso/dev/Prebid.js/build/coverage/lcov-report/modules/index.html) to see the code coverage.

Instructions on how to submit - https://github.com/prebid/Prebid.js/blob/master/PR_REVIEW.md
