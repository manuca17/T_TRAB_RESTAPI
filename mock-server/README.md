# mock-server

API simulada com [json-server](https://github.com/typicode/json-server), a servir os dados de `../mock-data/bd.json`.

## Instalação

```bash
cd mock-server
npm install
```

## Arranque

```bash
npm start
```

O servidor fica disponível em `http://localhost:3000`.

A flag `--static ../frontend` faz com que o json-server sirva também a interface web
(Parte 3) em `http://localhost:3000/` — assim o front-end e a API ficam na mesma origem.

## Endpoints

| Método | Rota           | Descrição                  |
| ------ | -------------- | -------------------------- |
| GET    | `/alunos`      | Listar todos os alunos     |
| GET    | `/alunos/:id`  | Obter um aluno             |
| POST   | `/alunos`      | Criar um aluno             |
| PUT    | `/alunos/:id`  | Substituir um aluno        |
| PATCH  | `/alunos/:id`  | Atualizar campos de um aluno |
| DELETE | `/alunos/:id`  | Apagar um aluno            |
| GET    | `/cursos`      | Listar todos os cursos     |
| GET    | `/cursos/:id`  | Obter um curso             |

Extras úteis do json-server:

- Filtrar: `GET /alunos?idCurso=1`
- Expandir relação: `GET /alunos?_expand=curso` *(requer que o campo se chame `cursoId`; com `idCurso` não funciona — fica só como nota)*
- Ordenar: `GET /alunos?_sort=apelido&_order=asc`

## Exemplo de corpo (POST / PUT)

```json
{
  "nome": "Joana",
  "apelido": "Silva",
  "idCurso": 1,
  "anoCurricular": 2
}
```

## Testes

A coleção Postman com os testes CRUD está em `../tests/postman-collection.json`.
