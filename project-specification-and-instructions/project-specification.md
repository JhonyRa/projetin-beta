# **Softube \- Project Specification**

## **1\. Introdução**

### **1.1 Propósito**

Este documento tem como objetivo especificar os requisitos para o desenvolvimento da **Softube \- Plataforma de Vídeos Corporativos Softo**, um sistema web destinado ao armazenamento, gerenciamento e visualização de vídeos internos da empresa Softo. O documento servirá como referência para a equipe de desenvolvimento e demais stakeholders envolvidos no projeto.

### **1.2 Escopo**

A Plataforma de Vídeos Corporativos Softo visa substituir o uso atual do YouTube para armazenamento de vídeos privados, oferecendo uma solução interna que facilita o gerenciamento de permissões, organização por pastas e acesso restrito aos colaboradores da Softo. O sistema incluirá funcionalidades de autenticação via OAuth2 do Google, gestão de pastas e vídeos, e diferenciação de permissões entre administradores e colaboradores.

### **1.3 Definições, Acrônimos e Abreviações**

- **Softo**: Nome da empresa que desenvolverá e utilizará a plataforma.
- **OAuth2**: Protocol de autenticação utilizado para login via Google.
- **AWS S3**: Serviço de armazenamento de objetos da Amazon Web Services.
- **SSO**: Single Sign-On, método de autenticação que permite a um usuário acessar múltiplos sistemas com um único login.
- **Frontend**: Parte frontal da aplicação, interface com o usuário.
- **Backend**: Lógica de negócios e funcionalidades do servidor.

### **1.4 Referências**

- **Google One**: [https://one.google.com](https://one.google.com)
- **Microsoft OneDrive**: [https://onedrive.live.com](https://onedrive.live.com)
- **Dropbox**: [https://www.dropbox.com](https://www.dropbox.com)
- **YouTube**: [https://www.youtube.com](https://www.youtube.com)
- **Vimeo**: [https://vimeo.com](https://vimeo.com)
- **Vidyard**: [https://www.vidyard.com](https://www.vidyard.com)

### **1.5 Visão Geral do Documento**

Este documento está organizado em três seções principais:

1. **Introdução**: Contextualiza o propósito, escopo e referências do projeto.
2. **Descrição Geral**: Apresenta uma visão macro do produto, suas funcionalidades, características dos usuários, restrições e dependências.
3. **Requisitos Específicos**: Detalha os requisitos funcionais, não funcionais, interfaces externas, desempenho e segurança do sistema.

## **2\. Descrição Geral**

### **2.1 Perspectiva do Produto**

A Plataforma de Vídeos Corporativos Softo é uma aplicação web interna que centraliza o armazenamento e gerenciamento de vídeos corporativos. Ela resolve os problemas de complexidade e ineficiência associados ao uso do YouTube para vídeos privados, oferecendo uma solução mais segura e organizada, acessível apenas aos colaboradores da Softo.

### **2.2 Funcionalidades do Produto**

- **Autenticação Segura**: Login via OAuth2 do Google restrito ao domínio da Softo.
- **Gestão de Pastas**: Criação, edição e exclusão de pastas para organização de vídeos.
- **Upload e Gestão de Vídeos**: Upload, edição, exclusão e organização de vídeos dentro das pastas.
- **Permissões de Usuário**: Diferenciação entre perfis de Administrador e Colaborador, com permissões específicas.
- **Visualização de Vídeos**: Reprodução de vídeos e marcação de vídeos como "vistos" pelos colaboradores.
- **Interface Intuitiva**: Navegação amigável para acesso às funcionalidades disponíveis.

### **2.3 Características dos Usuários**

- **Administradores**: Colaboradores com permissões para gerenciar pastas e vídeos.
- **Colaboradores**: Demais funcionários da Softo que têm acesso para visualizar e marcar vídeos como "vistos".

### **2.4 Restrições**

- **Acesso Restrito**: Apenas usuários com e-mails do domínio @Softo podem acessar a plataforma.
- **Limitação de Usuários**: O sistema não precisa ser escalável para um grande número de usuários; espera-se cerca de 70 usuários.
- **Tecnologias Específicas**: Uso obrigatório de React.js, Nextjs, Node.js (TypeScript), Express, TypeORM, Google Auth Library, AWS S3 e PostgreSQL.

### **2.5 Suposições e Dependências**

- **Autenticação via Google OAuth2**: Dependência dos serviços do Google para autenticação.
- **Armazenamento no AWS S3**: Dependência da infraestrutura da Amazon Web Services para armazenamento de vídeos.
- **Uso de Banco de Dados PostgreSQL**: Para armazenamento de dados relacionados a usuários, permissões, pastas e vídeos.

## **3\. Requisitos Específicos**

### **3.1 Requisitos Funcionais**

#### **3.1.1 Autenticação**

- **RF01**: O sistema deve permitir que usuários façam login via Google OAuth2 utilizando e-mails do domínio @Softo.
- **RF02**: O sistema deve validar se o e-mail pertence ao domínio @Softo e negar acesso caso contrário.

#### **3.1.2 Gestão de Usuários**

- **RF03**: O sistema deve diferenciar entre os perfis de Administrador e Colaborador.
- **RF04**: As permissões dos usuários devem ser configuradas inicialmente via banco de dados.

#### **3.1.3 Gestão de Pastas (Administradores)**

- **RF05**: O sistema deve permitir que Administradores criem novas pastas.
- **RF06**: O sistema deve permitir que Administradores editem e excluam pastas existentes.
- **RF07**: O sistema deve exibir uma lista de pastas existentes para os Administradores.

#### **3.1.4 Gestão de Vídeos (Administradores)**

- **RF08**: O sistema deve permitir que Administradores façam upload de vídeos para pastas específicas.
- **RF09**: O sistema deve permitir que Administradores editem informações dos vídeos, como nome e ordem.
- **RF10**: O sistema deve permitir que Administradores excluam vídeos.

#### **3.1.5 Visualização de Conteúdo (Colaboradores)**

- **RF11**: O sistema deve permitir que Colaboradores naveguem por todas as pastas disponíveis.
- **RF12**: O sistema deve permitir que Colaboradores visualizem e reproduzam vídeos.
- **RF13**: O sistema deve permitir que Colaboradores marquem vídeos como "vistos".

#### **3.1.6 Funcionalidades Comuns**

- **RF14**: O sistema deve fornecer uma tela inicial com a biblioteca de vídeos organizada em pastas.
- **RF15**: O sistema deve permitir que todos os usuários façam logoff.

### **3.2 Requisitos Não Funcionais**

#### **3.2.1 Usabilidade**

- **RNF01**: A interface do usuário deve ser intuitiva e fácil de navegar.
- **RNF02**: O design deve seguir padrões modernos de UX/UI.

#### **3.2.2 Segurança**

- **RNF03**: O sistema deve garantir que apenas usuários autenticados possam acessar as funcionalidades.
- **RNF04**: As APIs não devem ser expostas publicamente e devem seguir as melhores práticas de segurança.

#### **3.2.3 Performance**

- **RNF05**: O sistema deve carregar páginas e vídeos em um tempo aceitável para não prejudicar a experiência do usuário.
- **RNF06**: O sistema deve suportar pelo menos 70 usuários simultaneamente sem degradação de performance.

#### **3.2.4 Manutenibilidade**

- **RNF07**: O código deve ser desenvolvido seguindo boas práticas de programação para facilitar futuras manutenções.
- **RNF08**: Devem ser implementados testes automatizados seguindo o TDD.

### **3.3 Requisitos de Interface Externa**

#### **3.3.1 Interfaces do Usuário**

- **RIU01**: Tela de login com opção de autenticação via Google OAuth2.
- **RIU02**: Tela inicial apresentando pastas e vídeos disponíveis.
- **RIU03**: Área administrativa acessível apenas para Administradores.

#### **3.3.2 Interfaces de Hardware**

- Não aplicável, pois a aplicação será web e acessada via navegadores compatíveis.

#### **3.3.3 Interfaces de Software**

- **RIS01**: Integração com o serviço de autenticação Google OAuth2.
- **RIS02**: Integração com o serviço de armazenamento AWS S3 para gestão dos vídeos.

#### **3.3.4 Interfaces de Comunicação**

- **RIC01**: Comunicação segura via HTTPS para todas as transações de dados.

### **3.4 Requisitos de Desempenho**

- **RD01**: O sistema deve ter tempo de resposta inferior a 2 segundos para carregamento de páginas.
- **RD02**: O tempo de upload e download de vídeos deve ser otimizado, dependendo da velocidade da conexão do usuário.
- **RD03**: O sistema deve suportar pelo menos 70 usuários simultâneos sem perda de performance.

### **3.5 Requisitos de Segurança**

- **RS01**: Implementar autenticação via OAuth2 restrita ao domínio @Softo.
- **RS02**: As APIs devem ser protegidas contra acesso não autorizado.
- **RS03**: Os vídeos armazenados no AWS S3 devem estar protegidos contra acesso público.
- **RS04**: Dados sensíveis não devem ser expostos em logs ou mensagens de erro.

---

## **4\. Anexos**

### **4.1 Casos de Uso em Gherkin**

#### **4.1.1 Autenticação de Usuário**

Funcionalidade: Autenticação de Usuário  
 Como um colaborador da Softo  
 Eu quero fazer login na plataforma  
 Para acessar os vídeos corporativos

Cenário: Login bem-sucedido com e-mail da Softo  
 Dado que estou na página de login  
 Quando eu faço login com meu e-mail "@sof.to" via Google OAuth2  
 Então devo ser redirecionado para a tela inicial da plataforma

Cenário: Login falho com e-mail fora do domínio  
 Dado que estou na página de login  
 Quando eu tento fazer login com um e-mail que não é "@sof.to"  
 Então devo ver uma mensagem de erro informando que o acesso é restrito

#### **4.1.2 Gestão de Pastas (Administrador)**

Funcionalidade: Gestão de Pastas  
 Como um administrador  
 Eu quero gerenciar pastas  
 Para organizar os vídeos corporativos

Cenário: Criar uma nova pasta  
 Dado que estou na área administrativa  
 Quando eu crio uma nova pasta chamada "Treinamentos"  
 Então devo ver a pasta "Treinamentos" na lista de pastas

Cenário: Editar uma pasta existente  
 Dado que a pasta "Projetos" existe  
 Quando eu renomeio a pasta "Projetos" para "Projetos 2024"  
 Então devo ver a pasta "Projetos 2024" na lista de pastas

Cenário: Excluir uma pasta  
 Dado que a pasta "Antigos" existe  
 Quando eu excluo a pasta "Antigos"  
 Então a pasta "Antigos" não deve mais aparecer na lista de pastas

#### **4.1.3 Visualização de Vídeos (Colaborador)**

Funcionalidade: Visualização de Vídeos  
 Como um colaborador  
 Eu quero visualizar vídeos  
 Para acessar conteúdos corporativos

Cenário: Marcar vídeo como visto  
 Dado que estou na pasta "Treinamentos"  
 E o vídeo "Integração" está disponível  
 Quando eu assisto ao vídeo "Integração"  
 E marco como visto  
 Então o vídeo "Integração" deve aparecer como "visto" na minha lista

Cenário: Ver vídeos já visualizados  
 Dado que tenho vídeos marcados como vistos  
 Quando acesso a plataforma  
 Então devo ver uma indicação de quais vídeos já assisti

### **4.2 Fluxogramas e Diagramas**

_(Incluir aqui quaisquer diagramas de fluxo, arquitetura ou sequência que sejam relevantes para o entendimento do sistema.)_

---

## Solution Architecture

## **Visão Geral da Arquitetura**

A solução é composta por três camadas principais: **Frontend**, **Backend** e **Armazenamento de Dados**. Além disso, há serviços externos de autenticação e infraestrutura de rede e segurança. O objetivo é construir uma aplicação web interna que ofereça autenticação segura, gerenciamento de vídeos e permissões, bem como uma experiência intuitiva para os usuários.

### **Camadas Principais**

1. **Frontend (UI)**
   - **Tecnologias**: React.js \+ Next.js ou framework equivalente de front-end.
   - **Responsabilidades**:
     - Fornecer a interface gráfica para login, navegação entre pastas, visualização e marcação de vídeos.
     - Interagir com o backend via APIs seguras (HTTPS).
   - **Implantação**:
     - Pode ser hospedado em um servidor web estático ou ambiente de hospedagem de aplicações frontend.
     - Pode usar renderização do lado do servidor (SSR) para melhorar a experiência do usuário.
2. **Backend (APIs e Lógica de Negócio)**
   - **Tecnologias**: Node.js (TypeScript) com um framework modular (como Nest.js) ou equivalente.
   - **Responsabilidades**:
     - Implementar endpoints de autenticação, autorização, gerenciamento de pastas, upload, edição e exclusão de vídeos.
     - Interagir com o banco de dados para manter metadados de vídeos, pastas e permissões.
     - Gerar URLs seguras e temporárias para acesso aos vídeos armazenados.
     - Validar tokens de autenticação provenientes do provedor de identidade (OAuth2 via Google).
   - **Implantação**:
     - Pode rodar em um servidor de aplicações ou em contêineres, escalando horizontalmente conforme a demanda.
     - Utiliza um balanceador de carga (Load Balancer) para distribuir solicitações entre múltiplas instâncias, se necessário.
3. **Armazenamento de Dados**
   - **Banco de Dados Relacional (PostgreSQL ou equivalente)**:
     - Armazenar informações de usuários, permissões, pastas e metadados dos vídeos.
     - Pode ser hospedado em um servidor de banco de dados dedicado, contêiner ou serviço gerenciado.
   - **Armazenamento de Objetos para Vídeos (Estilo S3/MinIO ou outro serviço compatível)**:
     - Guardar arquivos de vídeo em um storage de objetos seguro e escalável.
     - Acesso controlado via credenciais e URLs pré-assinadas, nunca expondo diretamente os vídeos ao público externo.
     - Pode ser um appliance ou software on-premises, ou um serviço genérico de armazenamento de objetos oferecido por qualquer nuvem ou data center privado.

---

### **Serviços Externos e Integrações**

1. **Autenticação e Autorização (OAuth2 via Provedor de Identidade)**:
   - Utilizar um provedor externo de identidade (Google ou outro que suporte OAuth2) para autenticação.
   - O backend valida o token e garante que o domínio do usuário seja o da empresa.
   - Um serviço de diretório interno ou SSO corporativo também pode ser utilizado, desde que forneça tokens OAuth2 ou OpenID Connect.
2. **Rede e Segurança**:
   - **Balanceador de Carga (Load Balancer)**: Distribui requisições entre múltiplas instâncias do backend, garantindo alta disponibilidade.
   - **Proxies Reversos / Gateway de API**: Podem ser utilizados para rotear o tráfego e aplicar políticas de segurança (rate limiting, CORS, etc.).
   - **Criptografia (TLS/HTTPS)**: Toda a comunicação frontend-backend e backend-armazenamento deve ser feita sobre HTTPS.
   - **Firewalls e ACLs**: Restringir o acesso ao banco de dados e armazenamento de objetos apenas ao backend.
3. **Observabilidade e Monitoramento**:
   - **Registro de Logs**: O backend registra logs estruturados para auditoria, identificação de problemas e monitoramento de acessos.
   - **Métricas e Alertas**: Monitoração do uso de CPU, memória, latência de requisições, taxa de erros, entre outros indicadores de saúde.
   - **Acompanhamento de Performance**: Ferramentas de APM (Application Performance Monitoring) podem ser adotadas para rastreamento de requisições e análise de gargalos.
4. **CI/CD**:
   - Um pipeline de integração e entrega contínua que:
     - Executa testes automatizados.
     - Builda as imagens ou artefatos de frontend e backend.
     - Faz o deploy nos ambientes de teste e produção.
   - Ferramentas e scripts independentes do provedor de nuvem (por exemplo, utilizando Docker, Terraform, Ansible, etc.).

---

### **Fluxos Principais**

- **Fluxo de Autenticação**:
  1. O usuário acessa o frontend.
  2. Ao tentar acessar o conteúdo, é redirecionado para o provedor OAuth2.
  3. O usuário faz login com credenciais do domínio autorizado.
  4. O backend valida o token e retorna um token de sessão (JWT ou equivalente) para o frontend.
- **Fluxo de Gerenciamento de Vídeos (Administrador)**:
  1. Administrador acessa a interface administrativa.
  2. Faz upload de um vídeo: o backend fornece uma URL para envio do arquivo ao armazenamento de objetos.
  3. Ao finalizar o upload, o backend registra os metadados no banco de dados.
  4. Administrador pode editar títulos, descrições ou excluir vídeos ou pastas.
- **Fluxo de Visualização de Vídeos (Colaborador)**:
  1. Colaborador navega pelas pastas.
  2. Ao selecionar um vídeo, o backend retorna uma URL segura e temporária para o storage de objetos.
  3. O colaborador assiste ao vídeo diretamente a partir dessa URL.
  4. Ao marcar como "visto", o backend atualiza o estado no banco de dados.

---

### **Considerações de Escalabilidade e Performance**

- **Escalabilidade Horizontal**:
  - Múltiplas instâncias do backend podem rodar atrás de um balanceador de carga.
  - O armazenamento de objetos e o banco de dados devem ter capacidade de crescer conforme a demanda, seja vertical ou horizontalmente (com réplicas de leitura, por exemplo).
- **Caching**:
  - Pode-se adicionar um cache (como Redis ou Memcached) entre o backend e o banco de dados para agilizar consultas frequentes.
- **CDN (Opcional)**:
  - Uma Content Delivery Network (genérica, compatível com qualquer provedor) pode ser colocada na frente do frontend estático e do conteúdo de vídeo para melhorar a experiência de usuários geograficamente dispersos.
