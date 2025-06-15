# Sistema de Gestão de Programas para o Plano Plurianual (PPA)

## Visão Geral do Projeto

Este é um sistema web projetado para auxiliar no planejamento e gestão de programas do Plano Plurianual (PPA). A aplicação permite aos usuários criar, visualizar, editar e gerenciar programas governamentais, suas ações associadas, orçamentos e metas. Além disso, inclui um "Banco de Ideias" para capturar e organizar propostas que podem se tornar ações futuras.

**URL do Projeto em Lovable**: https://lovable.dev/projects/cbeef384-3bd1-4dde-adcb-3f993528a203

## Guia do Usuário

### 1. Dashboard Principal
A página inicial apresenta um dashboard com uma visão geral dos dados cadastrados:
- **Cards de Resumo**: Exibem o total de programas, ações, eixos temáticos e ideias no banco.
- **Orçamentos**: Um card detalha o orçamento total distribuído pelos quatro anos do PPA (2026-2029).
- **Gráficos Interativos**: Visualizam a distribuição do orçamento por departamento ou por programa.

### 2. Gestão de Programas
- **Criação**: Um novo programa pode ser criado a partir do dashboard, preenchendo informações como secretaria, departamento, eixo temático, nome, descrição, etc.
- **Visualização**: Ao selecionar um programa, seus detalhes são exibidos, incluindo informações gerais e uma lista de ações.
- **Edição**: Os detalhes de um programa existente podem ser alterados.
- **Exportação**: É possível exportar os dados completos de um programa para **PDF** ou **Excel (XLSX)** para relatórios e compartilhamento.

### 3. Gestão de Ações
Dentro de um programa, você pode gerenciar suas ações:
- **Adicionar Ação**: Ações podem ser criadas do zero ou a partir de uma ideia do "Banco de Ideias". É necessário preencher o nome, produto/serviço, unidade de medida, fonte de recurso e as metas físicas e orçamentárias para cada ano do PPA.
- **Editar/Excluir Ação**: Ações existentes podem ser modificadas ou removidas.

### 4. Banco de Ideias
O Banco de Ideias é um espaço para registrar propostas que podem ser aproveitadas nos programas.
- **Adicionar Ideia**: Cadastre novas ideias com nome, produto, unidade de medida e categoria.
- **Gerenciar Ideias**: As ideias podem ser editadas, excluídas e filtradas. O sistema rastreia se uma ideia já foi "usada" (ou seja, transformada em uma ação de programa), ajudando a evitar duplicidade.

## Guia do Desenvolvedor

### 1. Tecnologias Utilizadas
- **Frontend**: React, TypeScript, Vite
- **Estilização**: Tailwind CSS, shadcn/ui
- **Backend & Banco de Dados**: Supabase
- **Geração de Documentos**: `jspdf` e `autotable` para PDFs, `xlsx` for planilhas Excel.
- **Gráficos**: `recharts`

### 2. Como Funciona um Projeto React com Vite
Esta seção foi adicionada para explicar os fundamentos de como o React e o Vite trabalham juntos neste projeto, o que é especialmente útil para desenvolvedores menos familiarizados com esta combinação de tecnologias.

**O que é o Vite?**
Vite (palavra em francês para "rápido") é uma ferramenta de build de frontend moderna que otimiza drasticamente a experiência de desenvolvimento. Ele se diferencia de ferramentas mais antigas, como o Webpack (usado pelo Create React App), por duas razões principais:
1.  **Servidor de Desenvolvimento Nativo ESM:** Durante o desenvolvimento, o Vite serve os arquivos diretamente ao navegador, aproveitando o suporte nativo do navegador para Módulos ES (ESM). Isso significa que não há necessidade de "empacotar" (bundle) todo o código da aplicação antes de iniciar o servidor. O resultado é um tempo de inicialização quase instantâneo.
2.  **Hot Module Replacement (HMR) Rápido:** Quando você altera um arquivo de código, o Vite atualiza apenas aquele módulo específico no navegador, sem recarregar a página. Essa abordagem é muito mais rápida do que recarregar a página inteira ou re-empacotar grandes pedaços de código.

**O Ponto de Entrada: `index.html`**
Diferente de projetos tradicionais onde o ponto de entrada é um arquivo JavaScript, no Vite o ponto de entrada é o arquivo `index.html` na raiz do projeto.
- O servidor de desenvolvimento do Vite trata o `index.html` como o "início" de tudo.
- Dentro deste arquivo, você encontrará a tag `<div id="root"></div>`, que é o contêiner onde nossa aplicação React será renderizada.
- A mágica acontece na linha `<script type="module" src="/src/main.tsx"></script>`. Esta linha instrui o navegador a carregar e executar nosso código TypeScript/React como um módulo ES.

**O Início da Aplicação React: `src/main.tsx`**
Este arquivo é o ponto de entrada do *código da aplicação*.
- Ele importa o `React`, `ReactDOM` e o componente principal `App`.
- A função `createRoot(document.getElementById('root')!)` do `react-dom/client` seleciona o contêiner do `index.html`.
- O método `.render(<App />)` inicia o processo de renderização do React, montando o componente `App` e toda a sua árvore de componentes filhos dentro do `<div id="root"></div>`.

**Resumo do Fluxo:**
`Browser solicita a página` -> `Vite serve index.html` -> `index.html carrega src/main.tsx` -> `main.tsx renderiza o componente App no #root` -> `A aplicação React está rodando`.

Esta abordagem não só torna o desenvolvimento mais rápido, mas também se alinha melhor com os padrões modernos da web.

### 3. Estrutura do Projeto
```
/src
|-- /components/       # Componentes reutilizáveis da UI
|   |-- /dashboard/    # Componentes específicos do dashboard
|   |-- /ideas/        # Componentes para o Banco de Ideias
|   |-- /ui/           # Componentes base (shadcn)
|   |-- ActionsManager.tsx # Gerenciador de ações (CRUD)
|   |-- ProgramDetail.tsx  # Tela de detalhe de um programa
|   |-- ...
|-- /hooks/            # Hooks customizados (ex: useEixos, use-toast)
|-- /integrations/     # Configuração de serviços externos (Supabase)
|-- /lib/              # Utilitários gerais (ex: cn para classes)
|-- /pages/            # Componentes de página (principalmente Index.tsx)
|-- /types/            # Definições de tipos customizados (ex: Eixo)
|-- /utils/            # Funções utilitárias (pdfGenerator, excelGenerator, etc)
|-- App.tsx            # Roteamento e layout principal
|-- main.tsx           # Ponto de entrada da aplicação
```

### 4. Fluxo de Dados e Integração com Supabase
- **Cliente Supabase**: O cliente é inicializado em `src/integrations/supabase/client.ts`.
- **Tabelas Principais**:
    - `programs`: Armazena as informações gerais dos programas.
    - `actions`: Contém as ações, com uma chave estrangeira (`program_id`) que a relaciona a um programa.
    - `ideas`: O banco de ideias.
    - `eixos`: Os eixos temáticos para categorizar os programas.
- **Operações CRUD**: A maioria das operações de banco de dados é realizada diretamente nos componentes que precisam dos dados (ex: `ActionsManager.tsx` para ações), utilizando o cliente Supabase. As atualizações de estado local são feitas para refletir as mudanças na UI imediatamente.

### 5. Como Rodar o Projeto Localmente
Siga os passos abaixo se quiser rodar o projeto em seu ambiente local. É necessário ter Node.js e npm instalados.

```sh
# 1. Clone o repositório
git clone <URL_DO_SEU_REPOSITÓRIO_GIT>

# 2. Navegue até o diretório do projeto
cd <NOME_DO_PROJETO>

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```
O projeto estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver ocupada).
