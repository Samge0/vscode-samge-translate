# VSCode Samge Translate Plugin Dev

if you want to modify and publish your own plugin you can refer to the following steps：

- register a [vscode store](https://marketplace.visualstudio.com/) development account

- installation dependencies
```shell
yarn install
```

- modify the necessary configuration in `package.json` to your own warehouse information
```json
{
    "name": "your plugin name (id)",
    "displayName": "your plugin displayName",
    // other config ……
    "repository": {
        "type": "git",
        "url": "the github repository address for your plugin. this repository needs to be submitted first. type public"
    },
    "publisher": "the name you registered in the vscode plugin store",
    "icon": "your custom plugin icon is read by default：icon.png"
}
```

- 运行跟调试

- 打包并发布
```shell
vsce login yourPluginName

vsce package

vsce publish
```