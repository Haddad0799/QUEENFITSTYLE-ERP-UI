# Especificação do Endpoint de Upload de Imagens

## Endpoint: Obter URLs Pré-Assinadas para Upload

**Método:** `POST`
**Path:** `/erp/products/{productId}/colors/{colorId}/images/upload-urls`

### Requisição

```json
{
  "files": ["frente.png", "verso.jpg", "detalhe.webp"]
}
```

**Headers:**
- `Content-Type: application/json`

**Path Parameters:**
- `productId`: ID numérico do produto
- `colorId`: ID numérico da cor

### Resposta (200 OK)

```json
[
  {
    "uploadUrl": "http://localhost:9000/queenfitstyle/products/1/colors/1/21cebcfc-c4b7-4394-8376-3d52257dce93.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20260309%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260309T141326Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=df93d23124a6fa6d700b49727fc0f62c7363170b27254af77482e4adef52bfdd",
    "imageKey": "products/1/colors/1/21cebcfc-c4b7-4394-8376-3d52257dce93.png"
  },
  {
    "uploadUrl": "http://localhost:9000/queenfitstyle/products/1/colors/1/b65d9a8a-aca8-4dd4-8a6e-26afcbb1a0c1.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20260309%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260309T141326Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=456b685404651e3e2f34ca1f4fe39ab2c0047b89cd2022616fa2f203d5fffe0c",
    "imageKey": "products/1/colors/1/b65d9a8a-aca8-4dd4-8a6e-26afcbb1a0c1.jpg"
  },
  {
    "uploadUrl": "http://localhost:9000/queenfitstyle/products/1/colors/1/c8ff6363-e029-4020-a47a-7b2086b6e0bf.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=admin%2F20260309%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260309T141326Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=1b6f78159bf413344ee846cd7ae164aefa578b89cd2022616fa2f203d5fffe0c",
    "imageKey": "products/1/colors/1/c8ff6363-e029-4020-a47a-7b2086b6e0bf.webp"
  }
]
```

## Fluxo de Uso no Frontend

1. **Selecionar Arquivos**: Usuário seleciona arquivos de imagem
2. **Clicar "Visualizar Upload"**:
   - Envia POST para obter URLs pré-assinadas
   - Mostra preview de cada arquivo
3. **Revisar Imagens**: Usuário vê thumbnails das imagens a serem enviadas
4. **Confirmar Envio**:
   - Faz upload (PUT) para cada URL pré-assinada
   - Depois salva referência no backend

## Implementação do Backend (Exemplo Node.js/Express)

```javascript
// GET presigned URLs for S3/MinIO upload
app.post('/erp/products/:productId/colors/:colorId/images/upload-urls', async (req, res) => {
  const { productId, colorId } = req.params;
  const { files } = req.body;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'Field "files" must be an array' });
  }

  try {
    const presignedUrls = files.map((filename) => {
      // Gerar um UUID para tornar unique o arquivo
      const uuid = crypto.randomUUID();
      const ext = path.extname(filename);
      const key = `products/${productId}/colors/${colorId}/${uuid}${ext}`;

      // Gerar presigned URL (exemplo usando AWS SDK)
      const params = {
        Bucket: 'queenfitstyle',
        Key: key,
        Expires: 900 // 15 minutos
      };

      const uploadUrl = s3.getSignedUrl('putObject', params);

      return {
        uploadUrl,
        imageKey: key
      };
    });

    res.json(presignedUrls);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar URLs de upload' });
  }
});
```

## Notas Importantes

- A resposta deve ser um **array** de objetos com `uploadUrl` e `imageKey`
- A ordem dos URLs deve corresponder à ordem dos filenames solicitados
- As URLs devem ser válidas para upload PUT
- As URLs podem ter expiração (usuário terá tempo para fazer upload)
- O `imageKey` será usado para referenciar a imagem no banco de dados
