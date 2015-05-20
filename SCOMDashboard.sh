#!/bin/bash
#http://www.cyberciti.biz/tips/linux-write-sys-v-init-script-to-start-stop-service.html


start() {    
    mypid=`ps -ef | grep 'node SCOMDashboard' | grep -v grep | awk '{print $2}'`
    #if a valid number check
    if [[ $mypid =~ ^-?[0-9]+$ ]]
    then
	echo "SCOMDashboard is running, pid=$mypid"
    else
	echo "Starting SCOMDashboard"
	nohup ../node-latest-install/node SCOMDashboard &> nohup.out&
    fi    
}


stop() {
    mypid=`ps -ef | grep 'node SCOMDashboard' | grep -v grep | awk '{print $2}'`
    #if a valid number check
    if [[ $mypid =~ ^-?[0-9]+$ ]]
    then
	echo "Stopping SCOMDashboard"
	kill $mypid
    else
	echo "SCOMDashboard is not running"
    fi
}

status() {
    mypid=`ps -ef | grep 'node SCOMDashboard' | grep -v grep | awk '{print $2}'`
    #if a valid number check
    if [[ $mypid =~ ^-?[0-9]+$ ]]
    then
	echo "SCOMDashboard is running, pid=$mypid"
    else
	echo "SCOMDashboard is not running"
    fi
}

install() {
	cd /home/applmgr/node-latest-install
	./~/local/bin/npm install express
	./~/local/bin/npm install winston
	./~/local/bin/npm install xml-mapping
	export NODE_PATH=/home/applmgr/node-latest-install
}



### main logic ###
case "$1" in
  start)
        start
        ;;
  stop)
        stop
        ;;
  status)
        status
        ;;
  restart|reload)
        stop
        start
        ;;
  *)
        echo $"Usage: $0 {start|stop|restart|status}"
        exit 1
esac
exit 0
