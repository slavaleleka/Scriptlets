#!/bin/bash

set -e
set -x

yarn install

yarn test

echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

# we do not run browserstack if environment has $TRAVIS variable
# or if it is pull request from fork $TRAVIS_PULL_REQUEST_SLUG != $TRAVIS_REPO_SLUG
if [[ ! $TRAVIS || ($TRAVIS && ( $TRAVIS_PULL_REQUEST_SLUG == "$TRAVIS_REPO_SLUG" || $TRAVIS_PULL_REQUEST_SLUG == "" )) ]];
then
  yarn browserstack
fi

yarn corelibs
yarn build

yarn wiki:check-updates
