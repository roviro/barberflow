# 💈 BarberFlow - Sistema de Gestão para Barbearia

Sistema web moderno, ágil e **mobile-first** desenvolvido para barbeiros autônomos e barbearias que desejam sair do Excel e automatizar a rotina de agendamentos e avisos no WhatsApp.

---

## 🎯 As Soluções para os Problemas do Barbeiro

### 1. 💰 Controle de Gastos & Lucro Líquido Real
* Substitui o controle manual no Excel por um fluxo de caixa intuitivo.
* **Lançamento Rápido de Gastos**: Separação clara entre custos fixos (aluguel, energia, internet), insumos (lâminas, descartáveis) e equipamentos.
* **Métricas em Tempo Real**:
  * Faturamento Bruto (Cortes + Venda de Produtos)
  * Total de Gastos do mês
  * **Lucro Líquido Real** (O dinheiro que realmente sobra no bolso do barbeiro)
  * Margem de lucro (%) e faturamento por forma de pagamento (Pix, Cartão de Crédito, Débito e Dinheiro).

### 2. 📦 Controle de Estoque Inteligente
* Divisão entre:
  * **🏷️ Produtos para Revenda** (Pomadas modeladoras, óleos, minoxidil, cervejas, refrigerantes) com preço de custo e preço de venda.
  * **✂️ Insumos de Bancada** (Lâminas descartáveis, golas higiênicas, toalhas, talco, pós-barba).
* **Alerta Visual de Estoque Baixo**: Destaque imediato quando um item atinge a quantidade mínima recomendada.
* **Venda Casada no Checkout**: Ao finalizar o corte de um cliente, o barbeiro pode adicionar com 1 clique a pomada ou bebida que o cliente consumiu, dando **baixa automática no estoque** e somando à receita.
* **Reposição Automática**: Ao dar entrada de novas compras, o sistema permite lançar automaticamente o valor no módulo financeiro.

### 3. 🗓️ Agenda & Fim da Dependência do Status do WhatsApp
Hoje o barbeiro perde tempo precioso postando horários no status e respondendo um a um no WhatsApp. O BarberFlow resolve isso com 3 ferramentas:
1. **Link de Auto-Agendamento do Cliente (Modo Público)**:
   * O barbeiro tem um link exclusivo (`barberflow.app/barbearia`) para colocar na bio do Instagram ou fixar no WhatsApp.
   * O cliente clica, escolhe o serviço, seleciona o dia e vê **apenas os horários realmente livres** (sem risco de horários duplicados).
   * O cliente confirma em 30 segundos e o agendamento já cai na tela do barbeiro!
2. **Gerador Automático de Status para WhatsApp**:
   * Se o barbeiro ainda quiser postar no status, o sistema calcula na hora quais horários estão vagos no dia e gera um texto pronto e formatado com emojis e link para colar no status em 1 toque.
3. **Disparador de Lembretes no WhatsApp com 1 Clique**:
   * Cada agendamento possui o botão de WhatsApp que abre uma mensagem pronta e educada para confirmar o horário do cliente ou agradecer pelo corte.

### 4. 📊 Exportação para Excel
* Botões de exportação em formato `.csv` compatível com Microsoft Excel (com codificação UTF-8 e separador brasileiro) para quem ainda quiser manter cópias ou contabilidade externa.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js instalado (v18+)

### 1. Entrar na pasta do projeto:
```bash
cd /home/roviro/.gemini/antigravity/scratch/barberflow
```

### 2. Instalar as dependências (caso necessário):
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```
O terminal exibirá o link local (exemplo: `http://localhost:5173`). Abra esse link no seu navegador.

### 4. Para gerar a versão de produção:
```bash
npm run build
npm run preview
```

---

## 📱 Dica de Ouro: Como usar no Celular como Aplicativo (PWA)

Como o barbeiro trabalha em pé e com o celular na bancada:
1. Abra o link da aplicação no Google Chrome ou Safari do celular.
2. Toque no botão de compartilhamento / opções do navegador (os 3 pontinhos no Android ou o botão de compartilhar no iOS).
3. Selecione **"Adicionar à tela de início"**.
4. O BarberFlow passará a se comportar como um **aplicativo nativo no celular do barbeiro**, abrindo em tela cheia e com acesso instantâneo!
