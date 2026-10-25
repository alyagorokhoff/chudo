import urllib.request,urllib.error,json as js,concurrent.futures,secrets,re
class Res:
 def __init__(self,status,raw):self.status_code=status;self.text=raw.decode()
 def json(self):return js.loads(self.text)
class Requests:
 def call(self,method,url,json=None):
  import subprocess
  args=['curl','-sS','--max-time','25','-w','\n%{http_code}','-X',method,url,'-H','Content-Type: application/json']
  if method=='HEAD':args+=['--head']
  if json is not None:args+=['--data',js.dumps(json)]
  raw=subprocess.check_output(args).decode();body,status=raw.rsplit('\n',1);return Res(int(status),body.encode())
 def get(self,u,**k):return self.call('GET',u,**k)
 def head(self,u,**k):return self.call('HEAD',u,**k)
 def post(self,u,**k):return self.call('POST',u,**k)
requests=Requests()
b='https://screen-hug.alya-gorokhoff.chatgpt.site'
t=requests.post(b+'/api/gifts').json()['token']; receipts=[secrets.token_hex(32) for i in range(12)]
for method in ['get','head']:assert getattr(requests,method)(b+'/chudo/'+t).status_code==200
assert requests.post(b+'/api/claim',json={'token':t,'receipt':receipts[0]}).json()['state']=='created'
def claim(r):return requests.post(b+'/api/claim',json={'token':t,'receipt':r,'open':True}).json()
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex: results=list(ex.map(claim,receipts))
assert sum(x['state']=='owned' for x in results)==1,results
idx=next(i for i,x in enumerate(results) if x['state']=='owned');original=results[idx]
assert requests.post(b+'/api/claim',json={'token':t,'receipt':receipts[idx]}).json()==original
assert 0<=original['task']<4
assert requests.post(b+'/api/claim',json={'token':t,'receipt':receipts[idx],'open':True}).json()==original
assert requests.post(b+'/api/claim',json={'token':t,'receipt':secrets.token_hex(32),'open':True}).json()=={'state':'used'}
assert requests.post(b+'/api/claim',json={'token':secrets.token_hex(32),'receipt':receipts[0]}).status_code==404
assert requests.post(b+'/api/admin').status_code==403
assert requests.get(b+'/api/admin').status_code==403
html=requests.get(b+'/chudo/'+t).text;assert 'og:image' in html and 'Тебе подарили чудо' in html
print('PASS: GET/HEAD do not consume; 12 concurrent claimants yield one owner; private recovery; repeat rejection; invalid link; admin blocked; server OG.')
