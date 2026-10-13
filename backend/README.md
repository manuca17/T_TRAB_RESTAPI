# backend

API RESTful de alunos e cursos, com **Node.js + Express + MongoDB Atlas** (Mongoose),
organizada segundo o padrao **MVC**.

## Estrutura

```text
backend/
├── config/db.js              Ligacao ao MongoDB Atlas
├── models/                   Schemas Mongoose (a camada Model)
│   ├── Aluno.js
│   └── Curso.js
├── controllers/              Logica de cada operacao (a camada Controller)
│   ├── alunoController.js
│   └── cursoController.js
├── routes/                   Mapeamento de URLs para controladores
│   ├── alunoRoutes.js
│   └── cursoRoutes.js
├── scripts/migrar.js         Importa o mock-data/bd.json para o Atlas
├── docs/                     Documentacao Swagger (Parte 6)
└── server.js                 Ponto de entrada
```

A camada **View** e servida estaticamente a partir de `../frontend`.

## Configuracao

1. Instalar as dependencias:

   ```bash
   npm install
   ```

2. Criar o ficheiro `.env` a partir do exemplo:

   ```bash
   copy .env.example .env
   ```

3. Preencher o `.env` com as credenciais do Atlas:

   ```text
   MONGODB_URI=mongodb+srv://UTILIZADOR:PASSWORD@cluster0.xxxxx.mongodb.net/trab1?retryWrites=true&w=majority
   PORT=4000
   ```

   O `.env` esta no `.gitignore` e **nunca** deve ser commitado.

## Migrar os dados iniciais

Copia o conteudo de `../mock-data/bd.json` para o Atlas:

```bash
npm run migrar
```

Apaga o que estiver nas coleccoes antes de inserir. Como no Mongo os
identificadores sao `ObjectId` e no `bd.json` sao numeros, o script insere
primeiro os cursos e so depois os alunos, ja com a referencia convertida.

## Arrancar

```bash
npm start      # producao
npm run dev    # com nodemon, reinicia a cada alteracao
```

A API fica em `http://localhost:4000` e serve tambem a interface web em `/`.

## Endpoints

| Metodo | Rota          | Descricao                        | Estado |
| ------ | ------------- | -------------------------------- | ------ |
| GET    | `/alunos`     | Listar alunos                    | 200    |
| GET    | `/alunos/:id` | Obter um aluno                   | 200 / 404 |
| POST   | `/alunos`     | Criar aluno                      | 201 / 400 |
| PUT    | `/alunos/:id` | Substituir aluno                 | 200 / 400 / 404 |
| PATCH  | `/alunos/:id` | Atualizar campos do aluno        | 200 / 400 / 404 |
| DELETE | `/alunos/:id` | Apagar aluno                     | 200 / 404 |
| GET    | `/cursos`     | Listar cursos                    | 200    |
| GET    | `/cursos/:id` | Obter um curso                   | 200 / 404 |
| POST   | `/cursos`     | Criar curso                      | 201 / 400 / 409 |
| PUT    | `/cursos/:id` | Substituir curso                 | 200 / 400 / 404 |
| DELETE | `/cursos/:id` | Apagar curso                     | 200 / 404 / 409 |
| GET    | `/estado`     | Diagnostico (util apos o deploy) | 200    |

Filtros em `GET /alunos`: `?idCurso=<id>` e `?anoCurricular=<1-3>`.

### Corpo de um aluno

```json
{
  "nome": "Joana",
  "apelido": "Silva",
  "idCurso": "6acdf39bd2019f8cdfae8e93",
  "anoCurricular": 2
}
```

O `idCurso` e o `id` de um curso devolvido por `GET /cursos`. Ao contrario do
json-server, aqui e um `ObjectId` (24 caracteres) e nao um numero.

## Erros

Todas as respostas de erro trazem um campo `erro`; as de validacao trazem
tambem `detalhes`.

| Estado | Quando acontece                                         |
| ------ | ------------------------------------------------------- |
| 400    | Campos em falta ou invalidos; id com formato errado      |
| 404    | Recurso inexistente ou rota desconhecida                 |
| 409    | Nome de curso repetido; apagar curso com alunos inscritos |
| 500    | Erro inesperado no servidor                              |

## Nota sobre `mongodb+srv://`

Se a ligacao falhar com `querySrv ECONNREFUSED`, o problema e o DNS da rede
nao suportar registos SRV. Nesse caso usa a connection string alternativa,
que o Atlas disponibiliza em **Connect -> Drivers -> older version (2.2.12 or later)**:

```text
mongodb://UTILIZADOR:PASSWORD@host1:27017,host2:27017,host3:27017/trab1?ssl=true&replicaSet=<nome>&authSource=admin
```
