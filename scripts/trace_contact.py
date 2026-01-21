import re
p='contact.html'
text=open(p,'r',encoding='utf-8').read()
TAG_RE=re.compile(r'<\s*(/?)\s*([a-zA-Z0-9:-]+)([^>]*)>', re.I)
VOID=set("area base br col embed hr img input keygen link meta param source track wbr".split())
stack=[]
for m in TAG_RE.finditer(text):
    closing,tag,rest=m.group(1),m.group(2).lower(),m.group(3)
    if tag=='!doctype' or tag.startswith('!--'):
        continue
    self_close=rest.strip().endswith('/')
    if closing:
        if not stack:
            print('Unexpected closing',tag,'at',m.start())
        else:
            top=stack.pop()
            if top!=tag:
                print('MISMATCH: closing',tag,'at',m.start(),'expected',top)
                # print context
                start=max(0,m.start()-200)
                end=min(len(text),m.end()+200)
                snippet=text[start:end]
                print('\n--- context ---\n')
                print(snippet)
                print('\n--- stack snapshot (bottom->top) ---\n', stack[:])
                break
    else:
        if tag in VOID or self_close:
            continue
        stack.append(tag)
else:
    print('No mismatches; remaining stack (top last):',stack[-20:])
