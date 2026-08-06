# ��� DevLogistics - Gestão Inteligente de Estoque

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue)
![Angular](https://img.shields.io/badge/Angular-v22.0.1-red)
![Flask](https://img.shields.io/badge/Flask-v3.0.0-lightgrey)
![SQLite](https://img.shields.io/badge/SQLite-3.45.0-blueviolet)

> Sistema full-stack para otimização de controle de estoque e processos logísticos — construído como demonstração de habilidades durante recolocação no mercado.

## ��� Por que este projeto existe
Este não é apenas mais um exercício de programação. Nasceu do desejo de transformar um período de transição profissional em oportunidade de crescimento técnico significativo. Enquanto me preparava para retornar ao mercado de trabalho, foquei em construir algo que refletir boas práticas de engenharia de software em cada decisão - não apenas em "fazer funcionar", mas em **entender o porquê** por trás das escolhas arquiteturais, da experiência do usuário e da sustentabilidade do código.

## ��� Decisões Técnicas (o diferencial)
Veja nossas escolhas arquiteturais detalhadas em [DECISIONS.md](../DECISIONS.md) - incluindo:
- **Por que SQLite + SQLAlchemy** (em vez de PostgreSQL/Docker): para **zerar a barreira de entrada** para recrutadores que testam o projeto em máquinas limpas
- **Por que Flask + Blueprints** (em vez de FastAPI ou Flask-RESTful): pela **familiaridade da comunidade** (muitas vagas ainda exigem Flask) e **controle explícito sobre rotas**
- **Tradeoffs documentados**: mostro que penso em contexto, limitações e usuários finais - não sigo tendências cegamente

## ��� Arquitetura (clara e intencional)
- **Frontend:** Angular (Standalone Components, busca inteligente com fuzzy matching + debounce, tema escuro/persistente)
- **Backend:** Python / Flask (API RESTful bem definida, SQLAlchemy para ORM, tratamento robusto de erros)

## ������ Como executar (testado em máquina limpa)
### ��� Backend
\\\powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
python run.py
\\\

### ������ Frontend
\\\powershell
cd frontend
npm install
ng serve
\\\
*Acesse: http://localhost:4200*

## ��� O que você vai encontrar ao testar
- ��� **Busca que entende você**: digite 3+ caracteres, até com acentos ou erros de digitação (ex: "bronze" encontra "Placa de Bronze")
- ��� **Tema que lembra de você**: sua preferência (claro/escuro) salva entre sessões via \localStorage\
- ������ **Erros que ajudam**: mensagens amigáveis no UI + logs detalhados no console para desenvolvedores
- ��� **Interface que respira**: espaçamento pensado, feedback visual imediato, acessibilidade básica
- ��� **Fluxo completo**: cadastre, edite, exclua e veja tudo atualizado em tempo real via API

> *Este projeto é fruto de noites de estudo, fins de semana de dedicação e a crença de que engenheiros de verdade constroem soluções - não apenas código.*  
> *Feito com �� por um profissional que valoriza tanto qualidade técnica quanto tempo de qualidade com família.*