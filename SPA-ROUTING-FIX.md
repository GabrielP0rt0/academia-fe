# Correção de Roteamento SPA (404 ao dar refresh)

## Problema

Ao acessar diretamente uma rota (ex: `/login`) ou dar refresh na página, você recebe um erro 404. Isso acontece porque o servidor tenta encontrar um arquivo físico nesse caminho, mas em uma SPA todas as rotas devem ser servidas pelo `index.html`.

## Solução

### Desenvolvimento (Vite)

O Vite **já faz o fallback automaticamente** em desenvolvimento. Se você ainda está tendo problemas:

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Limpe o cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Verifique se está usando a porta correta:**
   - O servidor deve estar rodando em `http://localhost:5173`
   - Acesse `http://localhost:5173/login` diretamente

### Produção

Para produção, você precisa configurar o servidor web para fazer fallback para `index.html`. Arquivos de configuração foram criados:

#### 1. Netlify / Vercel

O arquivo `public/_redirects` já foi criado e será usado automaticamente por esses serviços.

#### 2. Apache (.htaccess)

O arquivo `public/.htaccess` foi criado. Certifique-se de que:
- O módulo `mod_rewrite` está habilitado
- O arquivo `.htaccess` está na pasta `dist/` após o build

#### 3. Nginx

Use o arquivo `nginx.conf.example` como referência:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### 4. Outros Servidores

**IIS (web.config):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

**Express.js (se usar Node.js):**
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000);
```

## Testando

1. **Em desenvolvimento:**
   - Acesse `http://localhost:5173/login` diretamente
   - Deve funcionar sem erro 404

2. **Em produção (após build):**
   ```bash
   npm run build
   npm run preview
   ```
   - Acesse `http://localhost:5173/login` diretamente
   - Deve funcionar sem erro 404

## Notas Importantes

- O Vite já resolve isso automaticamente em desenvolvimento
- O problema geralmente aparece apenas em produção
- Certifique-se de que o servidor web está configurado corretamente
- Os arquivos de configuração (`_redirects`, `.htaccess`) são copiados para `dist/` durante o build

