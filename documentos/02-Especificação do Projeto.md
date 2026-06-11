# Especificação do Projeto

## Perfis de Usuários

<table>
<tbody>
<tr align=center>
<th colspan="2"> técnicos da saúde </th>
</tr>
<tr>
<td width="150px"><b>Descrição</b></td>
<td width="600px">Gestor de estoque</td>
</tr>
<tr>
<td><b>Necessidades</b></td>
<td>Registros de insumos</td>
</tr>
</tbody>
</table>

## Histórias de Usuários

|EU COMO... `QUEM`   | QUERO/PRECISO ... `O QUE` |PARA ... `PORQUE`                 |
|--------------------|---------------------------|----------------------------------|
| Tecnico da saude   |cadastrar produtos         |manter o controle atualizado      |
| Tecnico da saude   |registrar entradas e saidas|controlar a movimentação do estoque|
| Professor          |visualizar estoque         |planejar melhor as aulas          |

## Requisitos do Projeto

Os requisitos do projeto foram definidos com base nas histórias de usuários, buscando atender às necessidades dos diferentes perfis envolvidos no sistema. A solução proposta visa permitir o controle eficiente de materiais, incluindo cadastro, movimentação e visualização do estoque.

### Requisitos Funcionais

| ID    | Descrição                                                                | Prioridade |
|-------|--------------------------------------------------------------------------|------------|
| RF-01 | O sistema deve permitir o cadastro de produtos                          | Alta       |
| RF-02 | O sistema deve registrar entradas de materiais no estoque               | Alta       |
| RF-03 | O sistema deve registrar saídas de materiais do estoque                 | Alta       |
| RF-04 | O sistema deve atualizar automaticamente a quantidade disponível        | Alta       |
| RF-05 | O sistema deve permitir a visualização do estoque                       | Alta       |
| RF-06 | O sistema deve permitir o acompanhamento da movimentação do estoque     | Média      |
| RF-07 | O sistema deve permitir a consulta dos materiais cadastrados            | Média      |

### Requisitos não Funcionais

| ID     | Descrição                                                         |
|--------|------------------------------------------------------------------|
| RNF-01 | O sistema deve possuir interface simples e intuitiva             |
| RNF-02 | O sistema deve apresentar as informações de forma clara          |
| RNF-03 | O sistema deve permitir acesso rápido às funcionalidades         |
| RNF-04 | O sistema deve funcionar em computadores do ambiente acadêmico   |
| RNF-05 | O sistema deve garantir a organização dos dados armazenados      |
