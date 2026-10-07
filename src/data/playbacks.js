/**
 * Acervo curado de Playbacks / Louvores
 * Extraído e padronizado a partir do catálogo oficial (playbacks.md)
 */

export const PLAYBACKS_LIST = [
  "1000 Graus - Renascer Praise",
  "500 Graus - Cassiane",
  "A Casa é Sua - Casa Worship",
  "A Mensagem da Cruz / Rude Cruz (Harpa)",
  "Aclame ao Senhor - Diante do Trono",
  "Adorar a Deus - Quatro Por Um",
  "Advogado Fiel - Bruna Karla",
  "Alívio - Jessé Aguiar",
  "Alvo Mais Que a Neve (Harpa)",
  "Ao Único - Aline Barros",
  "Aos Olhos do Pai - Diante do Trono",
  "Aos Pés da Cruz - Kleber Lucas",
  "Aquieta Minh'alma - Ministério Zoe",
  "Águas Purificadoras - Diante do Trono",
  "Bondade de Deus - Isaias Saad",
  "Canção do Céu - Anderson Freire",
  "Chora Que A Vitória Vem - Léa Mendonça",
  "Com Muito Louvor - Cassiane",
  "Coração Igual ao Teu - Diante do Trono",
  "Corpo e Família - Aline Barros",
  "Deixa - Maria Marçal",
  "Derrama Tua Glória",
  "Desapareceu Um Povo - Shirley Carvalhaes",
  "Descansa - Stella Laura",
  "Deserto - Maria Marçal",
  "Deus e Deus - Delino Marçal",
  "Deus e Eu - Leandro Borges",
  "Deus Proverá - Gabriela Gomes",
  "Deus Tremendo - Shirley Carvalhaes",
  "Divino Companheiro - Mara Lima",
  "Efésios 6 - Anderson Freire",
  "Ele é Exaltado - Adhemar de Campos",
  "Em Tua Presença - Fernanda Brum",
  "Era a Mão de Deus - Kailane Frauches",
  "Eu Navegarei",
  "Eu Sei Que Vem - Isadora Pompeo",
  "Eu Só Quero Adorar - Gerson Rufino",
  "Fidelidade - Danielle Cristina",
  "Fidelidade - Wagner Roberto",
  "Fiel a Mim - Eyshila",
  "Grande é o Senhor - Eli Soares",
  "Hey Pai - Isadora Pompeo",
  "Identidade - Anderson Freire",
  "Jardim Particular - Aline Barros",
  "Jesus Em Tua Presença - Asaph Borba",
  "Jó - Midian Lima",
  "Lindo És - Livres Para Adorar",
  "Lugar Secreto - Gabriela Rocha",
  "Lugares Altos - Renascer Praise",
  "Maranata - Ministério Avivah",
  "Me Ajude a Melhorar - Eli Soares",
  "Me Derramar - Vineyard",
  "Meu Barquinho - Giselli Cristina",
  "Minha Mocidade - Felipe Farkas",
  "Não Pare - Midian Lima",
  "Nenhuma Condenação Há - Armando Filho",
  "O Encontro - Valesca Mayssa",
  "Oferta Agradável a Ti - Cassiane",
  "Oi Jesus - Isadora Pompeo",
  "Oliveira Verdadeira - Trio Alexandre",
  "Os Que Confiam no Senhor",
  "Palavras - Lauriete",
  "Para Que Entre o Rei - Morada",
  "Perto Quero Estar - Toque no Altar",
  "A Terra Vai Um Dia Contemplar (Oh Aleluia Ele Voltará)",
  "Porque Ele Vive (Harpa)",
  "Preciso de uma Bênção - Cassiane",
  "Primeira Essência - Aline Barros",
  "Raridade - Anderson Freire",
  "Renovo - Sarah Farias",
  "Rompendo em Fé - Comunidade da Zona Sul",
  "Santidade",
  "Santifica - Alugiana",
  "Se Eu Não Te Ouvir",
  "Seja Forte e Corajoso - Isadora Pompeo",
  "Senhor Te Quero - Vineyard",
  "Sonda-me, Usa-me - Aline Barros",
  "Sonhe Grande",
  "Sonhos de José - Mattos Nascimento",
  "Sou Um Milagre - Voz da Verdade",
  "Tá Chorando Por Quê - Amanda Wanessa",
  "Te Agradeço - Diante do Trono",
  "Te Agradeço Deus",
  "Te Louvarei - Toque no Altar",
  "Terra Seca",
  "Tu És Fiel Senhor - Eyshila",
  "Tua Presença é Real - Antônio Cirilo",
  "Vaso de Alabastro - Mara Lima",
  "Vem Cear Comigo (Harpa)",
  "Vem, Esta é a Hora - Vineyard",
  "Vencendo Vem Jesus (Harpa)",
  "Vim Para Adorar-Te - Adoração e Adoradores",
  "Vim Para Adorar-Te - Diante do Trono"
];

/**
 * Sorteia aleatoriamente 'quantidade' de louvores sem repetição.
 * Permite excluir louvores que já estão na lista para sortear apenas um novo.
 *
 * @param {number} quantidade Quantidade de louvores a sortear (padrão: 3)
 * @param {string[]} louvoresExcluidos Lista de louvores para não sortear novamente
 * @returns {string[]} Lista com os louvores sorteados
 */
export function sortearLouvores(quantidade = 3, louvoresExcluidos = []) {
  const excluidosSet = new Set(louvoresExcluidos.map((s) => (s || '').trim().toLowerCase()));
  const disponiveis = PLAYBACKS_LIST.filter(
    (musica) => !excluidosSet.has(musica.trim().toLowerCase())
  );

  const fonte = disponiveis.length >= quantidade ? disponiveis : PLAYBACKS_LIST;
  const embaralhado = [...fonte].sort(() => Math.random() - 0.5);

  return embaralhado.slice(0, Math.min(quantidade, embaralhado.length));
}
