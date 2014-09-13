function min
{
  type=$1;
  version=$2;
  java -jar /home/web/yuicompressor-2.4.7/build/yuicompressor-2.4.7.jar -v --type $type --charset utf-8 -o $type/min_$version.$type $type/all_$version.$type >> min_$version.log 2>&1;
}

time=`date +%s`;

list=`cat <<EOD
js/jquery.cookie.js
js/jquery.imageslider.js
js/jquery.hoverIntent.js
js/jquery.superfish.js
js/jquery.markitup.js
js/jquery.markitup.bbcode.set.js
js/jquery.upload-1.0.2.js
js/main.js
EOD`
cat `echo $list | tr '\n' ' '` > js/all_$time.js
min js $time;

list=`cat <<EOD
css/normalize.css
css/markitup.style.css
css/markitup.bbcode.css
css/nav_xs.css
css/nav_sm.css
css/main_xs.css
css/main_sm.css
css/main_md.css
css/main_lg.css
css/fontello.css
EOD`
cat `echo $list | tr '\n' ' '` > css/all_$time.css
min css $time;

cp css/main.dallas.css css/all_$time.dallas.css
min css $time.dallas;

sleep 1;
# gzip css and js min file
echo 'commands to create gzip files:'
for i in `ls */min_$time.*s`; do
	echo -e "\tgzip -c $i > $i.gz";
done
