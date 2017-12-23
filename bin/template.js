#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const dot = require('dot')
const program = require('commander')
const _ = require('lodash')


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
processPage =  (pageName) => {
    templateParam.name = pageName + 'Page'
    const templateFileName = 'page.js'
    loadTemplateCode(templateFileName)
        .then(template => {
            let source = instantiateTemplateCode(templateParam, template)
            let fileName = templateParam.name + '.js';
            fs.stat(fileName, (err, stat) => {
                if (stat && stat.isFile()) {
                    console.log('文件已经存在');
                } else {
                    writeSource(fileName, source)
                        .then(() => {
                            console.log('创建成功')
                        })
                }
            })
        })
        .catch(error => {
            console.log(error);
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
        fs.readFile(path.join(curDir+'/template', templateFileName), 'utf-8', (err, data) => {
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











