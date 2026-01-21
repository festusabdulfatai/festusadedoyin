import re
p='contact.html'
text=open(p,'r',encoding='utf-8').read()
TAG_RE=re.compile(r'<\s*(/?)\s*([a-zA-Z0-9:-]+)([^>]*)>', re.I)
VOID=set("area base br col embed hr img input keygen link meta param source track wbr".split())
stack=[]
print('Parsing',p)
for i,m in enumerate(TAG_RE.finditer(text),1):
    closing,tag,rest=m.group(1),m.group(2).lower(),m.group(3)
    span=(m.start(),m.end())
    snippet=text[max(0,m.start()-30):min(len(text),m.end()+30)].replace('\n',' ')
    if tag=='!doctype' or tag.startswith('!--'):
        print(i,'SKIP',tag,span)
        continue
    self_close=rest.strip().endswith('/')
    if closing:
        print(i,'CLOSE',tag,span,'top-of-stack-before=',stack[-1] if stack else None)
        if not stack:
            print('  Unexpected closing',tag,'at',m.start())
        else:
            top=stack.pop()
            if top!=tag:
                print('  MISMATCH: closing',tag,'expected',top)
                print('  context:',snippet)
                break
    else:
        if tag in VOID or self_close:
            print(i,'VOID',tag,span)
            continue
        stack.append(tag)
        print(i,'OPEN',tag,span,'stack-size=',len(stack))
else:
    print('Done. Remaining stack (top last):',stack[-20:])
