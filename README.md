# 💳 Magnum Bank - Aplicação Bancária Digital

Uma aplicação web de banco digital simples e funcional, desenvolvida com **React** e uma **API mockada**.
O projeto simula o fluxo completo de um usuário, desde o registro até a realização de transações financeiras.

---

## 💻 Funcionalidades Implementadas

* **Autenticação:** Sistema de registro e login com validações básicas.
* **Dados Bancários Automáticos:** No registro, cada novo usuário recebe automaticamente dados de banco, agência e uma conta aleatória.
* **Páginas Protegidas:** As rotas são protegidas, exigindo que o usuário esteja autenticado para acessá-las.
* **Gestão de Saldo:** Fluxo de depósito inicial e visualização de saldo em tempo real na tela inicial.
* **Transferências:** Suporte para transações via **PIX** (usando CPF/CNPJ como chave) e **TED**.
* **Autocompletar:** Ao preencher o CPF/CNPJ do favorecido, os campos de nome, banco e conta são preenchidos automaticamente.
* **Histórico de Transações:** Tela dedicada que lista todas as transações realizadas e permite filtragem e ordenação por:

  * Tipo de transação (PIX, TED, Depósito, Envios, Recebidos).
  * Período (7, 15, 30, 90 dias ou personalizado).
  * Intervalo de valores (mínimo e máximo).

---

## 🚀 Como Rodar a Aplicação Localmente

Siga estas instruções para configurar e executar o projeto em sua máquina.

### 🔧 Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) e o `npm` instalados.

### 1. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DO_SEU_REPOSITORIO>
```

### 2. Instalar as Dependências

```bash
npm install
```

### 3. Iniciar a API Mock

A aplicação utiliza o **json-server** como uma API mock. É necessário iniciar o servidor antes de rodar o frontend.

```bash
npm run server
```

### 4. Iniciar a Aplicação

Com o servidor da API rodando em um terminal, abra um novo terminal e inicie a aplicação React:

```bash
npm start
```

A aplicação será aberta automaticamente em seu navegador padrão em:

* **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Estrutura do Projeto e Decisões Técnicas

* **Frontend:** Desenvolvido com **React** e **TypeScript** para um desenvolvimento mais seguro e escalável.
* **Mock API:** Utilizamos o **json-server** para simular um backend, persistindo os dados de usuários e transações no arquivo `db.json`.
* **Gerenciamento de Estado:** O **Context API** do React (`AuthContext.tsx`) é usado para gerenciar o estado do usuário (autenticação, saldo, etc.) de forma global.
* **Roteamento:** O **React Router DOM** é usado para gerenciar a navegação entre as páginas e proteger as rotas privadas.
* **Estilização:** A aplicação utiliza **CSS inline**. Para um projeto maior, a recomendação seria usar um sistema de estilização mais robusto (ex: CSS Modules, Styled Components, Tailwind CSS).

---

## ✅ Testes Automatizados

Este projeto **não inclui testes automatizados** (testes de unidade ou de integração). No entanto, para projetos de produção, a recomendação seria a utilização de bibliotecas como o **Jest** e o **React Testing Library**.

Para executar os testes, utilize o comando:

```bash
npm test
```

---

## 🎥 Demonstração (Opcional)

Você pode ver a aplicação em funcionamento neste link:

\<LINK\_PARA\_DEMONSTRACAO\_VERCEL\_OU\_NETLIFY>
