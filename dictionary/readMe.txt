cd /e/lititil/lititilWeb/dictionary

split -b 9M --numeric-suffixes=0 --suffix-length=2 --additional-suffix=.txt ecdict.txt ecdict.part
ls -lh ecdict.part*.txt