import subprocess,json,concurrent.futures,secrets,sys,re
base=sys.argv[1] if len(sys.argv)>1 else 'https://blessing-butterfly.alya-gorokhoff.chatgpt.site'
def req(method,path,data=None,ua=None):
 args=['curl','-sS','--max-time','40','-w','\n%{http_code}','-X',method,base+path,'-H','Content-Type: application/json']
 if method=='HEAD':args+=['--head']
 if data is not None:args+=['--data',json.dumps(data)]
 if ua:args+=['-A',ua]
 raw=subprocess.check_output(args).decode();body,status=raw.rsplit('\n',1);return int(status),body

def api(method,path,data=None):
 code,body=req(method,path,data);return code,json.loads(body)
code,gift=api('POST','/api/gifts');assert code==200,gift
t=gift['token'];assert re.fullmatch('[a-f0-9]{64}',t)
for method,ua in [('GET','TelegramBot (like TwitterBot)'),('HEAD','WhatsApp/2.24'),('GET','Mozilla/5.0')]:
 assert req(method,'/chudo/'+t,ua=ua)[0]==200
 assert api('GET','/api/gifts?token='+t)==(200,{'state':'created'})
receipts=[secrets.token_hex(32) for _ in range(12)]
assert api('POST','/api/claim',{'token':t,'receipt':receipts[0]})==(200,{'state':'created'})
def claim(r):return api('POST','/api/claim',{'token':t,'receipt':r,'open':True})
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:results=list(ex.map(claim,receipts))
owners=[i for i,x in enumerate(results) if x[1]['state']=='owned'];assert len(owners)==1,results
idx=owners[0];owner=results[idx];assert owner[0]==200 and 0<=owner[1]['task']<8 and 0<=owner[1]['butterfly']<5
assert all(i==idx or x==(409,{'state':'used'}) for i,x in enumerate(results))
assert api('GET','/api/gifts?token='+t)==(200,{'state':'claimed'})
for opened in (False,True,True):assert api('POST','/api/claim',{'token':t,'receipt':receipts[idx],'open':opened})==owner
assert claim(secrets.token_hex(32))==(409,{'state':'used'})
assert api('POST','/api/claim',{'token':secrets.token_hex(32),'receipt':receipts[0]})==(404,{'state':'invalid'})
code,nextgift=api('POST','/api/gifts');assert code==200 and nextgift['token']!=t
assert api('GET','/api/gifts?token='+nextgift['token'])==(200,{'state':'created'})
html=req('GET','/chudo/'+t)[1]
for s in ('og:image','/og.png','Тебе подарили чудо','Бесплатный интерактивный подарок'):assert s in html,s
assert 'Я благословляю' not in html
assert req('GET','/test')[0]==200
for name in ['pearl','powder','lilac','plum','sage']:assert req('HEAD','/butterflies/'+name+'.webp')[0]==200
print('PASS: safe GET/HEAD/crawler metadata; 12 concurrent claims -> one owner; immutable pair and recovery; other receipt rejected; invalid link; independent regift; test page; all 5 assets.')
