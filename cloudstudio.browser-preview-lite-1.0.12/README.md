# 在线预览调试
工作空间内置预览插件，方便您生成一个预览链接，用于实时调试预览或项目展示。

## 生成配置文件
Cloud Studio 使用一个配置文件来管理工作空间内的应用预览，这个文件是 `.vscode/preview.yml`，现在我们来生成这个文件。按下 <kbd>CMD+Shift+P</kbd>，打开命令面板，输入 `preview`，在命令列表中点击 **Preview: Generate Preview Config File**。
![生成配置文件](https://main.qcloudimg.com/raw/9629fa5672b1b7ea76b364e0a553d08f.png)
这样就在 `.vscode/` 下生成了一个配置文件 `preview.yml`。它的每一项参数的含义可以参考注释，我们主要关注 `port`、`root` 和 `run` 参数。我们刚才运行起来的 React 应用的这三个参数分别是：`3000`、`./app` 和 `yarn start`。
![](https://main.qcloudimg.com/raw/1d31d458d72e599516e0c26e28907843.png)


### 配置文件模板及参数含义
```yml
# .vscode/preview.yml
autoOpen: true # 打开工作空间时是否自动开启所有应用的预览
apps:
  - port: 3000 # 应用的端口
    run: yarn start # 应用的启动命令
    root: ./app # 应用的启动目录
    name: my-first-app # 应用名称
    description: 我的第一个 App。 # 应用描述
    autoOpen: true # 打开工作空间时是否自动开启预览（优先级高于根级 autoOpen）
```
## 启动预览窗口
现在让我们来启动预览窗口。再次按下 <kbd>CMD+Shift+P</kbd>，打开命令面板，输入 `preview`，在命令列表中点击 **Preview: Open Preview Tab**。
![打开预览窗口](https://main.qcloudimg.com/raw/38b38a1aff7f41745b6c2b283593e460.png)

详细操作说明请参考[文档](https://cloudstudio.net/docs/guide/preview.html)