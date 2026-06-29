#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e
# 生成静态文件
yarn docs:build

#上传
# git add -A
# git commit -m '上传'
# git push origin master


# 进入生成的文件夹
cd src/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'
# git remote add origin https://github.com/Scrates1/vuepressblogdist
git remote add gitee https://gitee.com/qiuchixiansheng/vuepressblogdist


# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master
# git push  --force origin master
git push  --force gitee master
# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -

echo 按任意键继续
read -n 1
echo 继续运行