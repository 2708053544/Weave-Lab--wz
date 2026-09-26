p = r'E:\AA\网站\Weave-Lab--wz\index.html'
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()
old = 'font-size:clamp(60px,9vw,130px);'
new = 'font-size:clamp(60px,11vw,160px);'
assert old in s
s = s.replace(old, new)
with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print('OK')
