#!/bin/bash
# update.sh

# 儲存當前的修改
git stash

# 更新 main
git checkout main
git pull origin main

# 更新 dev
git checkout dev
git merge main

# 恢復之前的修改
git stash pop