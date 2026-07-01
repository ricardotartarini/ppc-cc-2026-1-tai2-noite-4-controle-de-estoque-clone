# Template Padrão da Aplicação

Este tópico apresenta a estrutura arquitetural da interface (layout base), a identidade visual definida, os critérios de responsividade e a iconografia adotada em todas as telas do sistema **Med_Estoque**.

---

## 🏗️ Layout Padrão (Estrutura Base)

A aplicação utiliza um modelo clássico e altamente eficiente de **Dashboard** dividido em blocos estruturais fixos utilizando **CSS Grid** e **Flexbox**. Isso garante consistência visual, permitindo que o usuário navegue entre as páginas sem perder a referência de onde está.

A estrutura é composta por três componentes principais:
1. **Top Header (Barra Superior):** Contém a marca do sistema no canto esquerdo e os botões rápidos de navegação global (`Início` e `Sair`) à direita.
2. **Sidebar (Barra Lateral Esquerda):** Concentra a identificação do usuário logado (Nome, E-mail e Perfil de Acesso) e o menu vertical de navegação dinâmica (que muda conforme as permissões de Técnico ou Professor).
3. **Main Content (Área de Conteúdo Central):** Espaço flexível onde as tabelas, formulários, relatórios e alertas de negócio são renderizados.

### Representação Estrutural do HTML:

```html
<div class="app-container">
  <header class="top-header">
    </header>
  
  <div class="app-body">
    <aside class="sidebar">
      </aside>
    
    <main class="main-content">
      </main>
  </div>
</div>
