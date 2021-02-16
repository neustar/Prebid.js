# Running this script allows for the tests to be run much more quickly (2m vs 20s)
# To undo, simply run the complementary restore_deleted_files.sh script
for d in $(echo 'test/spec/modules modules')
do 
    echo $d
    mkdir -p bak/${d} 2> /dev/null
    for f in $(find $d -type f | grep -v git | grep -v build | grep -i '\(neustar\|fabrick\|appnexusBidAdapter\|pubm\|unifiedIdSystem\|s2sTesting\)')
    do
        echo $f
        cp $f bak/$d
    done
    rm -fR $d/*
done 

cd bak
for f in $(find . -type f)
do
    echo $f
    cp $f ../$f
done
cd ..
