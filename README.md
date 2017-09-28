### 环境
 * node 4.*
 * ngix
安装：

```
npm install -g gulp
npm install
```

ngix 代理设置： *nginx.conf*

```
server {
        listen       82;
        server_name  m.5173.com;
	location / {
	    proxy_pass http://localhost:3000/;
            #root   html;
            #index  index.html index.htm;
        }

    location /mobile-backend {
    proxy_pass http://192.168.178.115:8080/mobile-backend;
        #root   html;
        #index  index.html index.htm;
    }
}
```

host: *C:\Windows\System32\drivers\etc*
```
127.0.0.1 m.5173.com
```

### 开发：
`gulp dev`

### 发布：
`gulp`
 
<pre>
 ├─src                                        #源代码
     ├─common                                 #公共模板
     ├─css                                    #样式
     ├─images                                 #图片     
     ├─js                                     #js
 ├─js                                     #js   
 
</pre>