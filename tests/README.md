# Testes Postman

`postman-collection.json` é a coleção exportada do Postman (formato v2.1) com os testes da API simulada.

## Como usar

1. Arrancar o json-server (`cd mock-server && npm start`).
2. No Postman: **Import** -> selecionar `postman-collection.json`.
3. Correr a coleção com o **Collection Runner** (ou pedido a pedido, pela ordem indicada).

A variável de coleção `baseUrl` está definida como `http://localhost:3000`.

## Pedidos incluídos

**Cursos**
- `GET /cursos` - listar cursos
- `GET /cursos/1` - obter curso por id

**Alunos** (CRUD completo, por ordem)
1. `GET /alunos` - listar alunos
2. `POST /alunos` - criar aluno (guarda o `id` devolvido na variável `alunoId`)
3. `GET /alunos/{{alunoId}}` - obter aluno criado
4. `PUT /alunos/{{alunoId}}` - substituir aluno
5. `PATCH /alunos/{{alunoId}}` - atualizar parcialmente
6. `DELETE /alunos/{{alunoId}}` - apagar aluno
7. `GET /alunos/{{alunoId}}` - confirmar 404 depois de apagar

Cada pedido tem asserts na aba **Tests** (código de estado e forma da resposta).

## Correr sem Postman (newman)

```bash
npx newman run tests/postman-collection.json
```
