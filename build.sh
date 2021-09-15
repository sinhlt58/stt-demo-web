#!/bin/bash

npm run-script build:prod
cp -R build/* /Users/luusinh/works/VinBrain/nlp-service/nlp-service/src/main/resources/static