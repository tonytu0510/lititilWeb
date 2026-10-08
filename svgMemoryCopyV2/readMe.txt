正确操作
在 Git Bash 里：

bash
cd /e/lititil/lititilWeb/svgMemoryCopyV2
pwd
ls 4.svg svgo.config.mjs
pwd 应该输出 /e/lititil/lititilWeb/svg，ls 应该能看到两个文件。

然后：

bash
npx svgo 1.svg -o 1.min.svg --config svgo.config.mjs