#!/bin/bash

npm run build

git checkout dist

cp -r build/* .

git add *
git commit -m "Auto deploy"
git push origin dist

git checkout main
