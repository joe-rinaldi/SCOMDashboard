# cd /home/applmgr/node-latest-install
#./~/local/bin/npm install express
#./~/local/bin/npm install winston
#./~/local/bin/npm install xml-mapping
#export NODE_PATH=/home/applmgr/node-latest-install
nohup ../node-latest-install/node SCOMDashboard &> nohup.out&
ps -elf | grep SCOMDashboard
