# 🚢 Despacho Online - Sistema de Gestão de Despachos Aduaneiros

Sistema completo para gestão de clientes, despachos de mercadorias, classificação de produtos (HS Codes) e documentos.

## ✨ Funcionalidades Principais

### 🔐 Autenticação
- Login e registro de usuários
- Integração com Supabase Auth
- Proteção de rotas

### 👥 Gestão de Clientes
- Cadastro completo de clientes (nome, NIF, telefone, email, endereço)
- Upload de documentos do cliente (BI, NIF, autorizações, etc.)
- Visualização de perfil do cliente com todos os documentos
- Busca e filtros
- Criação de despachos diretamente do perfil do cliente

### 📦 Gestão de Despachos
- Criação de despachos vinculados a clientes
- Campos: destino, data de embarque, número de contentor
- Estados: "Em aberto", "Em classificação", "Pronto", "Concluído"
- Upload de documentos do despacho (faturas, comprovativo de frete, etc.)
- Visualização detalhada com produtos e documentos
- Atualização de estado diretamente na tabela

### ⚙️ Classificação de Produtos
- Adição de produtos aos despachos
- Campos: nome, peso (kg), quantidade, valor (USD)
- **Busca automática de HS Code** na tabela "pauta"
- Busca em tempo real com resultados dinâmicos
- Exibição completa: produto, HS code, dados, cliente e despacho
- **Exportação para PDF** da lista de classificação

### 🧾 Gestão de Documentos
- Visualização centralizada de todos os documentos
- Filtros por tipo (Cliente/Despacho)
- Download de documentos
- Informações de cliente/despacho associado

### 👤 Perfil do Usuário
- Visualização de dados da conta
- Opção de logout

## 🎨 Design

- Interface moderna e profissional
- Cores: azul claro e branco
- Menu lateral fixo com ícones
- Tabelas com ordenação e busca
- Formulários em modais
- Notificações de sucesso/erro
- Totalmente responsivo

## 🗄️ Estrutura do Banco de Dados (Supabase)

### Tabelas Criadas:
1. **clientes** - Dados dos clientes
2. **documentos_clientes** - Documentos upload dos clientes
3. **despachos** - Informações dos despachos
4. **documentos_despachos** - Documentos dos despachos
5. **produtos** - Produtos classificados
6. **pauta** - Códigos HS para classificação automática (30 códigos de exemplo)

### Storage Buckets:
- `documentos-clientes` - Armazena uploads de documentos de clientes
- `documentos-despachos` - Armazena uploads de documentos de despachos

## 🚀 Como Usar

### 1. Primeiro Acesso
1. Abra a aplicação
2. Clique em "Não tem conta? Criar agora"
3. Preencha nome, email e senha
4. Faça login

### 2. Criar Cliente
1. Vá em "Clientes" no menu lateral
2. Clique em "+ Novo Cliente"
3. Preencha os dados obrigatórios (Nome e NIF)
4. Clique no cliente para ver detalhes e enviar documentos

### 3. Criar Despacho
1. Vá em "Despachos" no menu lateral
2. Clique em "+ Novo Despacho"
3. Selecione o cliente
4. Preencha destino e outros dados
5. Clique no despacho para adicionar documentos

### 4. Classificar Produtos
1. Vá em "Classificação" no menu lateral
2. Clique em "+ Adicionar Produto"
3. Selecione o despacho
4. Digite o nome do produto
5. **Digite para buscar o HS Code** - os resultados aparecem automaticamente
6. Clique no código correto para selecioná-lo
7. Preencha peso, quantidade e valor
8. Submeta o formulário

### 5. Exportar PDF
1. Na página "Classificação"
2. Clique em "Exportar PDF"
3. Um PDF será gerado com todos os produtos classificados

## 🔧 Tecnologias Utilizadas

- **Frontend**: Next.js 14 com React
- **Backend**: Next.js API Routes
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **UI**: shadcn/ui + Tailwind CSS
- **PDF**: jsPDF + jsPDF-AutoTable
- **Ícones**: Lucide React

## 📝 Configuração Inicial (Já Feita)

### Credenciais Supabase Configuradas:
- ✅ URL do Projeto
- ✅ Anon Key
- ✅ Todas as tabelas criadas
- ✅ Políticas de segurança (RLS) configuradas
- ✅ 30 códigos HS de exemplo inseridos na tabela "pauta"

### Storage Buckets Criados:
- ✅ documentos-clientes
- ✅ documentos-despachos

## 📊 Estatísticas no Dashboard

O dashboard principal mostra:
- Número total de clientes
- Número total de despachos
- Número total de produtos classificados
- Despachos recentes
- Ações rápidas

## 🔒 Segurança

- Autenticação obrigatória para acesso ao sistema
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso configuradas
- Upload seguro de arquivos no Supabase Storage

## 🎯 Próximos Passos (Melhorias Futuras)

- [ ] Adicionar mais códigos HS à tabela "pauta"
- [ ] Implementar busca avançada de HS codes
- [ ] Adicionar filtros avançados em todas as páginas
- [ ] Implementar edição de clientes e despachos
- [ ] Adicionar notificações em tempo real
- [ ] Implementar roles/permissões de usuários
- [ ] Adicionar dashboard com gráficos e estatísticas
- [ ] Exportar relatórios em diferentes formatos
- [ ] Integração com APIs de tracking de containers
- [ ] Sistema de notificações por email

## 💡 Dicas de Uso

1. **Ordem recomendada**: Cliente → Despacho → Produtos → Documentos
2. **HS Codes**: A busca é feita por código OU descrição
3. **Upload**: Aceita PDF, imagens (JPG/PNG) e documentos Word
4. **Estados**: Atualize o estado do despacho conforme progride
5. **PDF**: Exporte a lista de classificação para compartilhar

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se as tabelas do Supabase foram criadas corretamente
2. Verifique se os buckets de storage existem
3. Verifique as credenciais no arquivo `.env`
4. Verifique o console do navegador para erros

## 📄 Licença

Este projeto foi desenvolvido para gestão de despachos aduaneiros.

---

**Desenvolvido com ❤️ usando Next.js e Supabase**
