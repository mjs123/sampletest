echo $PWD
echo `ls`
cd test
npm install
sleep 15
node ./node_modules/protractor/bin/protractor conf.js
