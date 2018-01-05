#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const dot = require('dot')
const program = require('commander')
const _ = require('lodash')
const insertLine = require('insert-line')
const readline = require('linebyline')


const curDir = __dirname//获取当前目录

//初始化commander
program
    .allowUnknownOption()
    .version('0.0.1')
    .usage('template <cmd> [input]')

//定义模板参数
let templateParam = {}

//添加自定义命令
program
    .command('page')
    .description('输入页面名称')
    .action(function (pageName) {
        if (_.isString(pageName)) {
            processPage(pageName)
        } else {
            program.help()
        }

    })


//处理page
processPage = (pageName) => {
    templateParam.name = pageName + 'Page'
    const templateFileName = 'page.js'
    loadTemplateCode(templateFileName)
        .then(template => {
            let source = instantiateTemplateCode(templateParam, template)
            let fileName = './src/page/' + templateParam.name + '.js';
            fs.stat(fileName, (err, stat) => {
                if (stat && stat.isFile()) {
                    console.log('文件已经存在');
                } else {
                    writeSource(fileName, source)
                        .then(() => {
                            console.log('创建成功')
                            processFile(pageName)
                        })
                }
            })
        })
        .catch(error => {
            console.log(error);
        })
}

//处理文件
processFile = (pageName) => {
    let insertFirstLine=0
    let insertSecondLine=0
    let routerSettingFilePath = './src/constants/routerSetting.js'
    let routerPathFilePath='./src/constants/RouterPaths.js'
    let importStr = 'import ' + pageName + ' from ' + '\'../page/' + pageName + 'Page\''
    let routerStr = '   '+pageName + ':{' + 'screen:' + pageName + '},'
    let pathStr='   '+pageName+':\''+pageName+'\','
    let settingRl = readline(routerSettingFilePath)
    settingRl.on('line', (line, lineCount, byteCount) => {
        // console.log('line:' + line, ' lineCount' + lineCount)
        if (line.indexOf('insert-import') != -1) {
            insertFirstLine=lineCount
        }

        if (line.indexOf('insert-router') != -1) {
            insertSecondLine=lineCount
        }

        if(insertFirstLine!==0&&insertSecondLine!==0){
            insertLine(routerSettingFilePath).content(importStr).at(insertFirstLine).then(err=>{
                insertLine(routerSettingFilePath).content(routerStr).at(insertSecondLine+1).then(err=>{})
            })

        }


    })

    let pathRl=readline(routerPathFilePath)
    pathRl.on('line', (line, lineCount, byteCount) => {
        if (line.indexOf('insert-path') != -1) {
            insertLine(routerPathFilePath).content(pathStr).at(lineCount).then(err=>{})
        }
    })
}

// 写入代码到当前目录下
writeSource = (fileName, source) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, source, err => {
            if (err) {
                reject(err);
            } else {
                resolve(fileName);
            }
        })
    });
}

//实例化模板代码
instantiateTemplateCode = (templateParam, templateSource) => {
    dot.templateSettings.strip = false;
    let template = dot.template(templateSource);
    return template(templateParam);
}

//加载模板代码
loadTemplateCode = (templateFileName) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(curDir + '/template', templateFileName), 'utf-8', (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })

}


// 没有参数时显示帮助信息
if (!process.argv[2]) {
    program.help();
    console.log();
}

program.parse(process.argv)











