# This accompanies delete_all_but_fabrick.sh files.  See the comments in there for an explanation.
git status | grep deleted | grep -v restore_deleted_files | gawk '{print $2}' | gsed -r 's/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g' | xargs git restore
