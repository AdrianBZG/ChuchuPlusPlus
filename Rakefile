task :default => :web

desc "Compile pl0.pegjs browser version"
task :web do
  sh "pegjs -e pl0 lib/pl0.pegjs public/pl0.js"
end

desc "Compile pl0.pegjs node version"
task :node do
  sh "pegjs lib/pl0.pegjs lib/pl0node.js"
end

desc "Remove public/pl0.js"
task :clean do
  sh "rm -f public/pl0.js"
end

desc "Compile public/styles.scss into public/styles.css using sass"
task :sass do
  sh "sass  public/styles.scss public/styles.css"
end

desc "run tests/input5.pl0 and leaves the input in file 'salida'"
task :test => [ :node ] do
  sh "./mainfromfile.js | tee salida"
end

desc "run tests (not implemented)"
task :tests do
  Dir.glob("tests/*.pl0").each do |f|
    puts f
    sh "./mainfromfile.js #{f}"
  end
end

desc "Shows the pl0 peg without semantic actions"
task :grammar do
  sh "pegjs-strip lib/pl0.pegjs | egrep -v -e '^\\s*$'"
end

task :pg do
  sh "pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start"
end

task :stoppg do
  sh "pg_ctl -D /usr/local/var/postgres stop -s -m fast"
end
