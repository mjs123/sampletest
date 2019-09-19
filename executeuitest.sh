echo $PWD
echo `ls`
cd test
npm install
sleep 2
node ./node_modules/protractor/bin/protractor conf.js