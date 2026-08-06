# 📦 DevLogistics - Gestão Inteligente de Estoque

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-blue)
![Angular](https://img.shields.io/badge/Angular-v22.0.1-red)
![Flask](https://img.shields.io/badge/Flask-v3.0.0-lightgrey)
![SQLite](https://img.shields.io/badge/SQLite-3.45.0-blueviolet)

> Sistema full-stack para otimização de controle de estoque e processos logísticos — construído como demonstração de habilidades durante recolocação no mercado.

## 🎯 Por que este projeto existe
Este não é apenas mais um exercício de programação. Nasceu do desejo de transformar um período de transição profissional em oportunidade de crescimento técnico significativo. Enquanto me preparava para retornar ao mercado de trabalho, foquei em construir algo que refletisse boas práticas de engenharia de software em cada decisão - não apenas em "fazer funcionar", mas em **entender o porquê** por trás das escolhas arquiteturais, da experiência do usuário e da sustentabilidade do código.

## 💡 Decisões Técnicas (o diferencial)
Veja nossas escolhas arquiteturais detalhadas em [DECISIONS.md](../DECISIONS.md) - incluindo:
    - **Por que SQLite + SQLAlchemy** (em vez de PostgreSQL/Docker): para **zerar a barreira de entrada** para recrutadores que testam o projeto em máquinas limpas
    - **Por que Flask + Blueprints** (em vez de FastAPI ou Flask-RESTful): pela **familiaridade da comunidade** (muitas vagas ainda exigem Flask) e **controle explícito sobre rotas**
    - **Tradeoffs documentados**: mostro que penso em contexto, limitações e usuários finais - não sigo tendências cegamente

## 🏗️ Arquitetura (clara e intencional)
    - **Frontend:** Angular (Standalone Components, busca inteligente com fuzzy matching + debounce, tema escuro/persistente)
    - **Backend:** Python / Flask (API RESTful bien definida, SQLAlchemy para ORM, tratamento robusto de erros)

## 🚀 Como executar (testado em máquina limpa)

### ⚙️ Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
python run.py