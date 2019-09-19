
echo $PWD
echo `ls`
npm install
sleep 15
node ./node_modules/mocha/bin/mocha 'test/sample_*.js' --reporter mocha-html-single-reporter