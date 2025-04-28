
Projeto Pipeline - SRE | Analista de DevOps | Automatização e Integração Contínua

Tarefa: Criar um pipeline de CI/CD usando o GitHub Actions para um projeto simples de aplicação web.

Neste projeto eu utilizei o cluster kubernetes da cloud.digitalocean e configurei o secrets K8S_CONFIG para receber o seu arquivo kube config.

*****************************************************************************************************************************************************

Requisitos:

1. O pipeline deve ser ativado sempre que um novo commit for feito na branch main. ✔

2. O pipeline deve executar os seguintes passos: 
o Instalar as dependências do projeto. ✔
o Executar testes unitários. ✔
o Construir a aplicação. ✔
o Armazenar o artefato como release do github ✔
o Usar funcionalidade environment do github para restringir a aprovação do deploy para um usuário ou grupo do github ✔

3. Criar uma step com o SonarQube para analisar a qualidade e a segurança do código. ✔

4. Executa o Trivy para fazer o scan de vulnerabilidades na imagem Docker recém-criada. ✔

5. O pipeline deve notificar o desenvolvedor via e-mail se o processo de CI/CD falhar em qualquer etapa e no final quando finalizar. ✔

6. Se todos os passos acima forem bem-sucedidos, o pipeline deve fazer o deploy da 
aplicação em um ambiente de teste. ✔

7. Comando para fazer o Rollback:
Executar dentro do diretorio k8s
kubectl rollout undo deployment/kubenews

• Criar um desenho simples de arquitetura na ferramenta draw.io (diagrams.net) que mostre como sera estruturado o pipeline.

https://drive.google.com/file/d/1QEG4VXxvf_BTn3m2n3Eupf1EOoleVIxf/view?usp=drive_link

