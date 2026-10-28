# Brasil 1989–2030: esquerda, governo e estratégia — aplicação interativa

**Aplicação:** https://jefersonunb.github.io/brasil-1989-2030/ · o manual completo, em PDF e em Word, está na seção [Documentos](https://jefersonunb.github.io/brasil-1989-2030/#documentos)

Aplicação web estática que acompanha o manual *Brasil 1989–2030: esquerda, governo e estratégia* (edição ampliada após o 2º turno, outubro de 2026), de Jeferson Martins de Castro, Fernanda Machiner e Maria Eduarda Silva. Todos os números e textos provêm do manual.

## O que há na aplicação

| Módulo | O que faz | Seções do manual |
| --- | --- | --- |
| Início | Números do 2º turno e resumo executivo | Resumo, 3.2 |
| Mapa 2026 | Mapa interativo por UF (2º turno, 1º turno, governadores), ranking e capitais | 3.2, 3.3 |
| Perfil do voto | Vantagem de Lula por sexo, renda, escolaridade, religião, raça e região | 3.4, 9.8 |
| Congresso | Calculadora de coalizão para Câmara e Senado com limiares de votação | 3.2, 9.3 |
| Série histórica | PT na Presidência, na Câmara e nas prefeituras, 1989–2026 | 2.2, 2.7, 3.2 |
| Atores | Índice de Poder Estratégico, redes e sociometria | 6.1, 6.2, 7.2 |
| Conjuntura e foresight | Monitor de sinais e cenários, forças motrizes e sinais fracos | 6.4, 7.3, 7.4, 7.6 |
| Geopolítica e soberania | Pressão dos EUA em 2025–2026, cenários do "governo paralelo", ordem global e seções 1.7–1.9, 7.7 e 9.9 | 1.7, 1.8, 1.9, 7.7, 9.9 |
| Estado, plataformas e método | Patrimonialismo, clientelismo, plataformas, governo digital e ferramentas de análise | 3.8, 5.9, 7.8 |
| Políticas | As sete políticas prioritárias em detalhe | 9.2, Parte 10 |
| Metas e riscos | Indicadores 2028–2030 e matriz de riscos | 6.4, 11.5, 11.6 |
| CTIS e PICAPS | Trajetória, matriz de contribuição por eixo, ciclo da inteligência cooperativa, agenda e riscos | Anexo A |
| Documentos | Manual completo em PDF e em Word | Todo o documento |

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub e envie o conteúdo desta pasta para a raiz do branch `main`:
   ```bash
   git init && git add . && git commit -m "Aplicação do manual Brasil 1989–2030"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```
2. No repositório, abra **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
3. Em um ou dois minutos a aplicação estará em `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.

A aplicação também funciona abrindo `index.html` diretamente no navegador, sem servidor.

## Estrutura

```
index.html            página única
assets/app.js         lógica e gráficos (JavaScript puro, sem dependências)
assets/style.css      estilo, com tema claro e escuro
assets/fonts/         fontes Barlow e Barlow Condensed (licença OFL)
assets/figs/          figuras do manual
data/data.json        dados estruturados extraídos do manual
data/manual.json      texto integral do manual por parte e seção (HTML e tabelas)
data/*.js             os mesmos dados, carregáveis sem servidor
docs/                 o manual em PDF e em Word
```

## Dados

`data/data.json` contém: resultado nacional dos dois turnos; os 27 estados (votação, vencedor do 1º turno, governador eleito e geometria do mapa); capitais; perfil do voto por segmento (Datafolha, 20–22/10/2026); séries históricas do PT; composição da Câmara e do Senado de 2027; Índice de Poder Estratégico dos atores; forças motrizes; dados de segurança pública de 2025; e as tabelas do manual (cenários, sinais de alerta, indicadores, riscos, coalizão, segmentos, agenda e políticas).

Limites: não houve boca de urna no 2º turno de 2026, por isso o perfil por segmento indica direção, e não tamanho exato; a bancada do Senado varia em uma cadeira conforme a fonte; as matrizes de poder são o modelo analítico do manual. As fontes de cada número estão na Parte 12 do manual.
