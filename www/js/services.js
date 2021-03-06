/***********************************************************************************
 * App Services. This contains the logic of the application organised in modules/objects. *
 ***********************************************************************************/

myApp.services = {
  data: {
    lerReceitas: () => {
      if ('localStorage' in window) {
        let receitasSalvas = window.localStorage.receitas;
        if (!receitasSalvas || receitasSalvas == "undefined") {
          return null;
        } else {
          return JSON.parse(receitasSalvas);
        }
      } else {
        return null;
      }
    },

    salvarReceitas: receitas => {
      let strReceitas = JSON.stringify(receitas);
      if ('localStorage' in window) {
        window.localStorage.receitas = strReceitas;
      }
    }
  },
  
  categorias: {
    mostrar: data => {
      let categoria = ons.createElement(
        `<ons-list-item tappable modifier="chevron" categoria="${data.slug}">
          <div class="center">${data.nome}</div>
        </ons-list-item>`
      );
      
      categoria.data = data;

      categoria.querySelector('.center').onclick = function () {
        document.querySelector('#myNavigator')
          .pushPage('html/receitas.html',
            {
              animation: 'slide',
              data: {
                element: categoria
              }
            }
          );
      };

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      var listaCategorias = document.querySelector('#lista-categorias');
      listaCategorias.insertBefore(categoria, null);
    },

    // Atualiza a lista de categorias e ordena nomes de categorias e receitas 
    // em ordem alfabética.
    atualizar: () => {
      document.querySelector('#lista-categorias').innerHTML = '';
      let receitas = myApp.services.data.lerReceitas();
      let receitasOrdenadas = []
      for (let cat in receitas) {
        receitasOrdenadas.push(cat);
      }
      receitasOrdenadas.sort();


      for (let cat of receitasOrdenadas) {
        if (receitas.hasOwnProperty(cat)) {
          for (let [index, item] of receitas[cat].receitas.entries()) {
            receitas[cat].receitas[index].indice = index;
          }
          receitas[cat].receitas = receitas[cat].receitas.sort((a,b) => {
            return a.nome.toLocaleLowerCase().localeCompare(b.nome.toLocaleLowerCase());
          });

          let data = receitas[cat];
          data.slug = cat;

          myApp.services.categorias.mostrar(data);
        }
      }
    }
  },

  receitas: {
    mostrar: (receita, categoria) => {
      let itemReceita = ons.createElement(
        `<ons-list-item tappable modifier="chevron">
          <div class="center">${receita.nome}</div>
        </ons-list-item>`
      );

      let data = {categoria, receita};

      itemReceita.data = data;

      itemReceita.querySelector('.center').onclick = function () {
        document.querySelector('#myNavigator')
          .pushPage('html/detalhes_receita.html',
            {
              animation: 'slide',
              data: {
                element: itemReceita
              }
            }
          );
      };

      // Insert urgent tasks at the top and non urgent tasks at the bottom.
      var listaReceitas = document.querySelector('#lista-receitas');
      listaReceitas.insertBefore(itemReceita, null);
    },

    criar: (dados, receitas) => {
      let retornar;
      if (!receitas) {
        receitas = myApp.services.data.lerReceitas();
      } else { 
        retornar = true;
      }

      if (receitas.hasOwnProperty(myApp.services.limparString(dados.categoria))) {
        receitas[dados.categoria].receitas.push({
          nome: dados.nome,
          receita: dados.receita
        })
      } else {
        receitas[myApp.services.limparString(dados.categoria)] = {
          nome: dados.categoria,
          receitas: [{
            nome: dados.nome,
            receita: dados.receita
          }]
        }
      }

      if (retornar) {
        return receitas;
      } else {
        myApp.services.data.salvarReceitas(receitas);
      }
      return false;
    },

    atualizar: categoria => {
      document.querySelector('#lista-receitas').innerHTML = '';
      let receitas = myApp.services.data.lerReceitas();
      let receitasCat = receitas[categoria].receitas;

      for (let receita of receitasCat) {
        myApp.services.receitas.mostrar(receita, categoria);
      }
    },

    atualizarDetalhes: dados => {
      document.querySelector('#detalhesReceitaPage .container h1').textContent = dados.nome;
      document.querySelector('#detalhesReceitaPage .container p').innerHTML = dados.receita.replace(/\n/g, '<br>');
    },

    excluir: (receita, categoria) => {
      let listaReceitas = myApp.services.data.lerReceitas();
      listaReceitas[categoria].receitas.splice(receita.indice, 1);
      myApp.services.data.salvarReceitas(listaReceitas);
    },

    editar: (dados) => {
      let { receitaAtual, categoria, nome, receita } = dados;
      let listaReceitas = myApp.services.data.lerReceitas();
      let receitaOriginal = listaReceitas[receitaAtual.categoria].receitas[receitaAtual.indice];
      if (categoria != receitaAtual.categoria) {
        console.info('Categoria alterada');
        listaReceitas[receitaAtual.categoria].receitas.splice(receitaAtual.indice, 1);
        listaReceitas = myApp.services.receitas.criar({ categoria, nome, receita }, listaReceitas);
      } else {
        console.info('Categoria não alterada')
        let novaReceita = { nome, receita }
        listaReceitas[categoria].receitas[receitaAtual.indice] = novaReceita;
      }
      console.info(listaReceitas);
      myApp.services.data.salvarReceitas(listaReceitas);
    }
  },

  //////////////////////
  // Animation Service //
  /////////////////////
  animators: {

    // Swipe animation for task completion.
    swipe: function(listItem, callback) {
      var animation = (listItem.parentElement.id === 'pending-list') ? 'animation-swipe-right' : 'animation-swipe-left';
      listItem.classList.add('hide-children');
      listItem.classList.add(animation);

      setTimeout(function() {
        listItem.classList.remove(animation);
        listItem.classList.remove('hide-children');
        callback();
      }, 950);
    },

    // Remove animation for task deletion.
    remove: function(listItem, callback) {
      listItem.classList.add('animation-remove');
      listItem.classList.add('hide-children');

      setTimeout(function() {
        callback();
      }, 750);
    }
  },
  
  limparString: string => {
    return string.toLowerCase().replace(' ', '_');
  },
  
  dummyReceitas: {
    "acompanhamentos": {
      "nome": "Acompanhamentos",
      "receitas": [
        {
          "nome": "Batata com Atum",
          "receita": "Ingredientes:\n400 gramas de batatas descascadas\n1 lata de atum\n1/2 cebola picada grosseiramente\n2 tomates picados\n100 gramas de azeitonas em rodelas\n1/2 xícara de chá de salsa e cebolinha\n\n\nModo de Preparo:\nNuma vasilha colocar o atum, a cebola, os tomates, a azeitona e a salsa e cebolinha. Reservar.\nCortar as batatas em rodelas e forrar o fundo de uma forma.\nSalpicar com um pouco de sal.\nPor cima colocar a mistura feita com o atum, tampar a forma e levar ao fogo baixo até que as batatas estejam macias.\n"
        },
        {
          "nome": "Batatas Recheadas com Presunto",
          "receita": "Ingredientes:\n8 batatas grandes\n2 xícaras de presunto moído\n1 xícara de maionese \n1/2 xícara de queijo prato ralado\n1 colher (sopa) de cebola picada\n1/4 xícara de queijo mussarela ralado.\n\n\nModo de Preparo:\nCozinhar as batatas com casca, sem deixar ficar muito mole.\nCortar um tampinha de cada uma. Retirar cuidadosamente a polpa.\nEm uma tigela, misturar o presunto, a maionese, o queijo prato e a cebola.\nRechear as batatas com esta mistura, colocar numa forma e salpicar com queijo mussarela.\n\n\nDica:\nServir como acompanhamento em assados."
        },
        {
          "nome": "Camarões com Maionese",
          "receita": "Ingredientes:\n1 kg de camarões médios\n1 lata de milho verde\n1 cebola média picada\n2 dentes de alho picados\n1 xícara de maionese\n1 colher (chá) de mostarda\nsal\n\n\nModo de Preparo:\nLimpar os camarões, sem retirar as caldas.\nLavar bem e cozinhar em água e sal.\nEscorrer, deixar esfriar e reservar.\nÀ parte, preparar o molho, misturando os demais ingredientes.\nColocar numa tigela com os camarões cozidos ao lado.\nServir bem frio."
        },
        {
          "nome": "Escondidinho de Frango",
          "receita": "Ingredientes:\n8 batatas médias\n1 lata de creme de leite\n4 colheres de leite em pó\n1 copo de requeijão de 200 gramas\n1 e 1/2  colher (sopa) de manteiga ou margarina\nsal a gosto\n250 gramas de mussarela ralado\n\nRecheio:\n1 peito de frango (cozido e desfiado)\n1 cenoura ralada\n1/2 cebola picadinha\n2 colheres (sopa) de cheiro verde \nsal e pinta do reino a gosto\n1/3 xícara (chá) de Azeite\n\n\nModo de Preparo:\nNuma tigela, colocar os ingredientes do recheio e misturar bem. Reserve.\nMisturar todos os ingredientes da massa em uma outra tigela.\nColocar em um refratário médio untado metade da massa na primeira camada, a segunda camada com o recheio e cobrir com o restante da massa.\nLevar ao fogo médio, preaquecido, por 30 minutos.\nServir quente.\n\nDica: \nApós retirar do forno colocar batata palha por cima."
        },
        {
          "nome": "Bolinho de Arroz",
          "receita": "Ingredientes:\n1 xícara (chá) de arroz cozido\n3 colheres de sopa de farinha de trigo \n1 ovo\n1 colher (chá) de fermento em pó\n1/2 cebola picadinha\nsal à gosto \nsalsa e cebolinha à gosto\n\n\nModo de Preparo:\nMisturar todos os ingredientes e fazer uma massa.\nDepois de bem misturada e lisa juntar 1 xícara de chá de arroz cozido.\nFritar à colherada."
        }
      ]
    },
    "aves": {
      "nome": "Aves",
      "receitas": [
        {
          "nome": "Bife de Frango ao Forno",
          "receita": "Ingredientes:\n1/2 kg de Bifes de peito de frango\n1 ovo\nsal à gosto \nóleo para fritar\n2 colheres de manteiga\n1 caixinha de milho e ervilha\nfatias de queijo prato ou mussarela\n\n\nModo de Preparo:\nLavar bem os bifes, temperar o bife com sal e deixar repousar por 2 horas ou de um dia para outro.\nBater as claras em neve e juntar as gemas.\nPassar cada bife no ovo e em seguida na farinha de rosca ou de pão. Fritar no óleo bem quente.\nEscorrer em papel absorvente e na hora de servir, arrumar os bifes num pirex e colocar por cima uma fatia de queijo prato ou mussarela.\nLevar ao forno até derreter o queijo.\nÀ parte refogar a manteiga, o milho e a ervilha e jogar por cima dos bifes após retirar-los do forno. "
        },
        {
          "nome": "Galinha com Creme de Milho",
          "receita": "Ingredientes:\n1 galinha desfiada, cozida e bem temperada\n\nCreme de Milho Verde:\n1 lata de milho verde\n2 copos americanos de leite\n3 colheres (sopa) rasa de Maizena\n1 colher (sopa) de manteiga ou margarina\nsal a gosto\n\nCobertura:\n1 copo de requeijão\n3 claras em neve\n1 colher de café de sal\n\nModo de Preparo:\nBata no liquidificador metade do milho, a água da lata, o leite, a Maizena e o sal.\nDerreta a manteiga, junte a mistura batida, o restante do milho e mexa até engrossar.\n\nModo de Preparo da Cobertura:\nMisture o requeijão com as claras e o sal. \nNum refratário untado, coloque metade do creme de milho e, por cima, o frango reservado. \nCubra com o restante do creme de milho e, sobre este, a cobertura de requeijão.\nLeve ao forno pré-aquecido até gratinar. Sirva sem acompanhamento."
        },
        {
          "nome": "Isca de Frango ao Molho de Mostarda",
          "receita": "Ingredientes:\n500 g de filé de frango cortado em iscas ou cubos e temperado à gosto\n1/2 cebola fatiada\n50 g de azeitona sem caroço fatiadas\n4 colheres (sopa) de maionese\n2 colheres (sopa) de mostarda\n1 xícara de (chá) de água\n2 colheres (sopa) de óleo ou azeite\n\n\n\nModo de Preparo:\nEm uma frigideira grande, aqueça o óleo ou azeite e frite as iscas de frango já temperado (eu usei: limão, sal, curry e tempero pronto para aves), colocando um pouco de água para que fiquem mais macios.\nDeixe cozinhar um pouco e secar a água.\nQuando estiverem dourados, retire da frigideira e reserve.\nNa mesma frigideira aproveitando o fundo que se formou com a fritura do frango.\nAqueça a cebola até que murchem, se necessário pingue um pouco de água para que não queimem.\nEm seguida, coloque a água e a maionese e mexa até que a maionese se dissolva e forme um creme.\nAcrescente a mostarda e as azeitonas.\nSe quiser o molho mais ralo acrescente um pouco mais de água, se quiser mais grosso, acrescente um pouco mais de maionese.\nExperimente o sal, eu não costumo colocar sal, pois já coloco no tempero do frango.\nQuando começar a borbulhar, volte com o frango para a frigideira e misture ao molho e pronto.\n\nDica:\nSirva com arroz e batata palha. O mesmo molho pode ser feito para carne vermelha, fica ótimo também."
        },
        {
          "nome": "Frango Xadrez",
          "receita": "Ingredientes:\n2 colheres (sopa) de azeite de oliva\n2 cebolas médias cortadas em cubos\n2 dentes de alho esmagados\n500 g de filé de frango sem pele e cortado em cubos\nsal a gosto\n1 pimentão verde cortado em cubos\n1 pimentão vermelho cortado em cubos\n1 pimentão amarelo cortado em cubos\n1 xícara (chá) de cogumelos em conserva cortados ao meio\n1/4 xícara de molho shoyu\n1 colher (sopa) de maisena\n1/2 xícara (chá) de água\n2 colheres (sopa) de amendoim torrado\n\n\nModo de Preparo:\nEm uma frigideira ou panela grande, misture a metade do azeite de oliva, a cebola, o alho e deixe fritar.\nRetire e coloque em um prato.\nNa mesma panela, coloque o sal, o restante do azeite e frite os pimentões e os cogumelos por 5 minutos.\nRetire e despeje em outro prato.\nAinda na mesma panela, coloque o frango e frite até dourar.\nColoque todos os ingredientes novamente na frigideira, misture bem com uma colher de pau e refogue por mais 2 minutos.\nEm uma xícara, misture o molho shoyu, a maisena e a água.\nMexa bem e junte a mistura de frango.\nCozinhe, mexendo constantemente, até formar um molho espesso.\nColoque em uma travessa, polvilhe com amendoim e sirva quente."
        }
      ]
    },
    "biscoitos": {
      "nome": "Biscoitos",
      "receitas": [
        {
          "nome": "Olho de Boi",
          "receita": "Ingredientes:\n1 xícara (chá) de margarina\n3 xícaras de farinha de trigo\n1 colher (chá) de sal\n2 ovos\n3 colheres de leite em pó\n1 colher (chá) de fermento pra bolo\n1 xícara de açúcar\n\n\nCobertura:\n100 gramas de goiabada em pedaço pequenos\naçúcar\n\n\n\nModo de Preparo:\nEm uma travessa coloque os ingredientes e amasse até desgrudar da mão, fazer pequenos biscoitos um pouco maiores de uma moeda de um real. Com o dedo mindinho afundar um pouco o meio do biscoito, coloque um pedaço pequeno de goiabada e passe no açúcar. \nComo o biscoito é muito delicado o tempo de assar depende da potência do forno. \nAsse em forno pré-aquecido fogo médio de 20 - 25 minutos, mas varia as potências, pode ser feito em forno elétrico também. Até que a parte de baixo fique dourada.  \nRetire do forno e deixe esfriar."
        },
        {
          "nome": "Biscoitinho de Polvilho",
          "receita": "500 gramas de polvilho azedo\n1 copo (americano) de leite\n1 copo(americano) de óleo de canola\n1 copo (americano) de água\n1 ovo\n1 colher (sopa) de sal\n\n\nModo de Preparo:\nColoque o polvilho e o sal numa tigela e misture.\nAqueça o leite e o óleo juntos e acrescente a mistura.\nColoque o ovo inteiro e adicione a água aos poucos até obter uma mistura firme e cremosa.\nColoque a massa em saco de confeiteiro e faça fileiras ou o formato que desejar na forma.\nDeixe no forno por aproximadamente 20 minutos ou até que os biscoitinhos fiquem um pouco firmes."
        },
        {
          "nome": "Biscoito de Maizena",
          "receita": "Ingredientes:\n500 gramas de amido de milho \n1 lata de leite condensado \n2 unidades de gema de ovo \n120 gramas de manteiga\n\n\nModo de Preparo:\nMisture tudo. Faça bolinhas com as mãos.\ncoloque-as no tabuleiro untado, e amasse-as de leve com um garfo para dar uns risquinhos nos biscoitos. Forno regular."
        },
        {
          "nome": "Biscoito de Amendoim",
          "receita": "Ingredientes:\n1/2 kg de amendoim ( torrado ) \n1/2 xícara (chá) de açúcar \n2 unidades de ovo \n1/2 xícara de fermento royal \n2 colheres (sopa) de farinha de trigo\n\n\nModo de Preparo:\nMoer ( pode picar no liquidificador ) o amendoim, não muito fino. \nMisturar em uma vasilha com os ovos, o açúcar, o fermento e o trigo misturar com as mãos.\nFazer bolinhas. colocar numa forma polvilhada de trigo e levar ao forno. \nAssar com temperatura baixa 10 graus. bom apetite."
        },
        {
          "nome": "Biscoito de Chocolate e Amêndoas",
          "receita": "Ingredientes:\n1 2/3 de xícara (chá) de amêndoas moídas \n4 unidades de clara de ovo batidas em neve \n1 xícara (chá) de açúcar \n125 gr de chocolate meio amargo derretido \n1 xícara (chá) de coco ralado\n\n\nModo de Preparo:\nNo liquidificador, bata as amêndoas até formar uma farinha. \nÀ parte, bata as claras em neve; junte aos poucos o açúcar e incorpore a farinha de amêndoa, delicadamente. \nAcrescente o chocolate derretido e o coco. \nColoque colheradas sobre uma assadeira untada e forrada com papel-manteiga. \nAsse no forno pré aquecido a 200º C durante 20 minutos."
        }
      ]
    },
    "bolos": {
      "nome": "Bolos",
      "receitas": [
        {
          "nome": "Bolo Nega Maluca",
          "receita": "Ingredientes para o bolo:\n01 lata de leite condensado\n01 xícara (chá) de leite morno\n3/4 xícara (chá) de óleo\n03 ovos\n1 xícara (chá) de chocolate em pó\n02 xícaras e meia (chá) de farinha de trigo\n01 colher (sopa) de fermento em pó\n \n\nIngredientes para cobertura:\n01 xícara (chá) de chocolate em pó\n½ xícara (chá) de açúcar\n03 colheres de manteiga\n½ xícara (chá) de leite\n \n\n\nModo de Fazer:\nMassa:\nEm um liquidificador, bata o leite condensado com o leite, o óleo, os ovos e o chocolate em pó.\nColoque em uma tigela e adicione a farinha de trigo e o fermento, misturando bem. Coloque em uma forma retangular grande (26 x 38 cm) untada e polvilhada e asse em forno médio-alto (200°C), preaquecido, por cerca de 40 minutos.\n\n\nCobertura:\nEm uma panela, misture o Chocolate em Pó com o açúcar, à manteiga e o leite e leve ao fogo baixo. Deixe ferver por cerca de 2 minutos ou até engrossar. Desligue o fogo e bata bem com uma colher ou garfo. Coloque sobre o bolo ainda quente.  Sirva\n\nDica:\nColocar por cima da cobertura chocolate granulado"
        },
        {
          "nome": "Bolo Pudim de Laranja com Chocolate",
          "receita": "Ingredientes:\nPara o pudim:\n4 ovos\n1 lata de leite condensado\n1 xícara de suco de laranja\n1 colher de chá de amido de milho\n1 colher de sopa de caramelo\n1 lata de creme de leite\n Obs: Caramelo para untar a forma .\n\n\nPara o Bolo :\n4 ovos\n1 xícara de açúcar\n1 xícara chocolate em pó\n1 xícara de leite\n2 xícaras de farinha de trigo\n1 colher de sopa de fermento (Royal)\nRaspa de uma laranja\n\n\nModo de Preparo:\nPudim:\nUntar bem uma forma grande (usei com furo) com caramelo. Reservar.\nBater por 5 minutos todos os ingredientes na batedeira, colocar na forma e reservar.\n\n\nBolo:\nSeparar as gemas das claras, bater as claras até ponto de neve.\nBater as gemas com o açúcar até formar um creme esbranquiçado e depois adicionar às claras em neve e envolver tudo. \nAdicionar o chocolate em pó e o leite e bater bem. Junte a farinha, o fermento e as raspas da laranja no preparado e mexer suavemente. Colocar com cuidado na forma, por cima do pudim. Calma, que momentaneamente todos os ingredientes vão se misturar.\nLevar ao forno (a 200º C pré-aquecido) em banho-maria durante 60 minutos aproximadamente. Desenformar apenas quando estiver totalmente frio."
        },
        {
          "nome": "Bolo de Ana",
          "receita": "12 colheres (sopa) de Nescau\n12 ovos\n2 colheres de fermento para bolo\n200 gramas gramas de coco ralado seco\n16 colheres (sopa) de açúcar\n\nCalda: \n1 lata de creme de leite\n6 colheres de Nescau\n1 colher de manteiga\n2 pacotes de chocolate granulado para confeitar\n\n\nModo de Preparo:\nBolo:\nBater os ovos, o Nescau, o açúcar e o fermento no liquidificador por 1 minuto depois acrescente o coco ralado e bata de novo por mais 2 minutos.\nUnte uma forma com manteiga e enfarinhe com trigo, em seguida despeje na forma a massa do bolo e coloque para assar por cerca de 45 minutos em forno preaquecido a 180º C.\n\nCalda:\nEm uma panela coloque o creme de leite a manteiga e o Nescau e colocar no fogo, ficar remexendo até criar uma consistência homogênea.\nDepois desenformar o bolo e jogar por cima da calda e polvilhar o chocolate granulado em seguida."
        },
        {
          "nome": "Bolo de Coco Gelado",
          "receita": "Ingredientes:\n1 xícara (chá) de açúcar\n2 e 1/2 xícaras (chá) de farinha de trigo\n4 ovos\n1 xícara (chá) leite\n4 colheres (sopa) coco ralado\n1 colher (sopa) fermento para bolo\n2 colheres (sopa) de margarina sem sal\n1 colher (sopa) de maizena\n\nCalda:\n1 lata de leite condensado\n1 vidro (200 ml) de leite de coco\n1 xícara de coco ralado\n\n\nModo de Preparo:\nBolo:\nBata no liquidificador os ovos, o leite, a margarina, o açúcar e 2 colheres de coco.\nColoque o trigo em uma vasilha, despeje a massa batida e misture até que fique homogênea.\nAdicione o resto do coco e misture. Por último, acrescente o fermento.\nColoque em uma forma untada e enfarinhada.\nAsse em forno médio, preaquecido, por cerca de 40 minutos, ou até dourar.\n\nCalda: \nMisture todos os ingredientes (não precisa levar ao fogo).\n\nMontagem:\nDesenforme o bolo ainda quente e faça uns furos nele.\nColoque sobre o bolo a calda e polvilhe o coco ralado.\nLeve para gelar."
        }
      ]
    },
    "carnes": {
      "nome": "Carnes",
      "receitas": [
        {
          "nome": "Filé ao Molho Madeira",
          "receita": "Ingredientes:\n2 colheres (sopa) de manteiga\n1 kg de filé mignon em bifes\n1 colher (sopa) de Gril\n\nMolho:\n2 colheres (sopa) de manteiga\n1 colher (sopa) de farinha de trigo\n1/2 xícara (chá) de vinho madeira\n1 tablete de caldo de carne\n1/2 xícara (chá) de champinhon fatiado\n\n\nModo de Preparo:\nEm uma frigideira, aqueça a manteiga e frite aí os filés. Após fritá-los de um lado, vire-os e polvilhe parte do Gril. Repita a operação do outro lado.\nPasse os filés para uma travessa onde serão servidos e mantenha-os aquecidos. \nPara o molho, aqueça na mesma frigideira a manteiga e doure ligeiramente a farinha de trigo. \nAos poucos, vá acrescentando 1/2 xícara (chá) de água e vinho, mexendo sempre para não formar grumos. \nJunte o caldo de carne, os champignons e deixe ferver até o tablete dissolver. Sirva a seguir sobre os filés reservados.\n\nDica: \nO vinho madeira pode ser substituído por vinho tinto seco."
        },
        {
          "nome": "Filé com Molho de Maracujá",
          "receita": "Ingredientes:\n200 gramas de polpa de maracujá ou a mesma quantidade de suco\n1 colher (sopa) de açúcar\n5 colheres (sopa) de creme de leite\n1/2 colher (sopa) de manteiga\n300 gramas de filé temperado\n\n\nModo de preparo:\nGrelhe o filé, até dourar dos dois lados. Bata a polpa de maracujá ou o suco com açúcar.\nDepois leve a mistura ao fogo com a manteiga, em uma frigideira.\nQuando ferver, acrescente o creme de leite e em seguida o filé grelhado.\n\nDica:\nO filé ao molho de maracujá pode ser servido com arroz e purê de batatas."
        },
        {
          "nome": "Strogonoff",
          "receita": "Ingredientes:\n1 kg de carne ( filé mignon, alcatra)\n4 colheres (sopa) de manteiga\n1/2 colher (sopa) de sal\n2 cebolas picadas\n3 tomates sem pele e sem sementes picado\n1 colher (sopa) de mostarda\n2 colheres (sopa) de catchup\n1 lata de creme de leite \n1 copo de requeijão\n\n\nModo de Preparo:\nPicar a carne em tirinhas finas.\nDerreter três colheres (sopa) de manteiga numa frigideira grande e ir fritando a carne, aos poucos, em fogo alto, sem deixar juntar suco.\nRetirar a carne, colocar na frigideira a manteiga restante e fritar a cebola.\nJuntar a carne e deixar aquecer. Acrescentar os tomates, a mostarda e o catchup, misturar bem.\nAbaixar o fogo, tampar a panela e deixar por cerca de 5 minutos. Incorporar delicadamente o creme de leite e retirar do fogo antes de ferver.\nServir em seguida."
        },
        {
          "nome": "Almondegas de Carne Moída",
          "receita": "Ingredientes:\n500 gramas de carne moída\n1 colher (sopa) de farinha de trigo\n1 xícara de miolo de pão molhado com leite\n1 ovo\n1/4 colher (chá) de sal\n1 caixa de molho de tomate\nqueijo ralado a gosto\n\n\nModo de Preparo:\nColocar todos os ingredientes em uma tigela. Misturar bem e fazer bolinhas.\nPassar cada bolinha na farinha de trigo e ir colocando na assadeira.\nFritar em bastante óleo, colocando de 6 a 8 de cada vez num panela funda.\nVirar para dourar por igual. Escorrer em papel absorvente.\nServir com molho de tomate. Caso queira adicione queijo ralado à gosto."
        },
        {
          "nome": "Bife de Panela",
          "receita": "Ingredientes:\n1 kg de bife coxão mole ou alcatra\nsalsa e cebolinha à gosto.\n1 cebola picada\n2 alhos picados\norégano à gosto \n1 pimentão picado\nbacon\nsal à gosto\n\n\nModo de Preparo:\nRefogar na panela de pressão, ir colocando o óleo, a cebola, o alho picadinho, um punhado de orégano, a salsa, a cebolinha, o pimentão picadinho, o bacon e o sal. Refogar até dourar\nDepois acrescentar o bife, dê uma mexidinha e colocar água até cobrir a carne, não colocar muita água, levar ao fogo, depois que começar a ferver, deixar cozinhar por mais uns 20 minutos, até amolecer a carne."
        }
      ]
    },
    "doces": {
      "nome": "Doces",
      "receitas": [
        {
          "nome": "Beijinho",
          "receita": "Ingredientes:\n250 gramas de coco ralado\n1 lata de leite condensado\n1 colher (sopa) de manteiga\n\nModo de Preparo: \nMisturar os ingredientes em uma panela. Levar ao fogo baixo, mexer até que desgrude do fundo da panela.\nDespejar em uma superfície untada. Esperar esfriar. Enrolar os doces.\nPassar no açúcar refinado. Colocar em formas de papel e enfeitar com cravo (caso queira). "
        },
        {
          "nome": "Pudim de Pão",
          "receita": "Ingredientes:\n3 pães secos\n3 ovos\n15 colheres (sopa) de açúcar\n1/2 litro de leite\nCaramelo líquido\n\n\nModo de Preparo:\nEm uma panela leve o leite ao fogo para aquecê-lo.\nEm um refratário corte o pão em pedaços bem pequenos, após picar o pão acrescente o açúcar, os ovos e o leite já aquecido, misture tudo e coloque no liquidificador para bater não deixar muito líquido nem muito grosso. \nEm seguida unte uma forma com o caramelo líquido e despeje a massa do pudim na forma já untada com caramelo. \nColoque para assar em banho maria por 45 minutos no forno preaquecido. \nApós 45 minutos retire do forno e coloque na geladeira para esfriar.\nQuando o pudim ficar frio pode desenformar em um prato e servi-lo."
        },
        {
          "nome": "Brigadeirão de Liquidificador",
          "receita": "Ingredientes:\n2 latas de leite condensado\n1 lata de creme de leite\n1 lata de leite (mesma medida da lata de creme de leite)\n5 ovos\n6 colheres (sopa) de Nescau ou chocolate em pó\n1 colher (sopa) de manteiga\n2 colheres (sopa) de maizena\n\nCobertura:\n1 lata de creme de leite\n6 colheres (sopa) de Nescau\n1 colher (chá) de margarina\nChocolate granulado para enfeitar\n\n\nModo de Preparo:\nMassa:\nBater tudo no liquidificador. Despejar em uma forma para pudim untada com manteiga e polvilhada com açúcar.\nLevar ao forno médio (180º C) em banho-maria até aproximadamente 1 hora e 10 minutos ou até ficar firme.\nRetirar do Forno. Esperar esfriar bem e desenformar.\n\nCobertura:\nEm uma panela coloque o creme de leite, o Nescau e a margarina. \nLeve ao fogo e mexa até que crie uma consistência homogênea e cremosa. \nRetire do fogo e espere esfriar. Jogue sobre o brigadeirão e salpique chocolate granulado por cima.\nSirva gelado."
        },
        {
          "nome": "Sorvete Caseiro",
          "receita": "Ingredientes:\n2 latas de leite condensado\n4 latas de leite (use a lata vazia de leite condensando para medir)\n8 gemas peneiradas \n8 claras batidas em neve\n8 colheres (sopa) rasas de açúcar\n2 latas de creme de leite com soro\n\nCalda:\n1 xícara (chá) de açúcar\n4 colheres (sopa) de chocolate em pó\n4 colheres (sopa) de leite\n\n\n\nModo de Preparo:\n Leve ao fogo, em banho-maria, por 25 minutos, o leite condensado, o leite e as gemas, deixe esfriar. Misture as claras batidas com o açúcar e com o creme de leite. Adicione à mistura das gemas. Faça uma calda com o açúcar, o chocolate em pó e o leite. Despeje em uma forma com buraco no meio de 24 cm de diâmetro, cubra com papel alumínio e leve ao congelador por  6 horas."
        },
        {
          "nome": "Cocada",
          "receita": "Ingredientes:\n1 lata de leite condensado\n2 latas de açúcar (medida da lata de leite condensado)\n1 coco fresco pequeno ralado\n\n\nModo de Preparo:\nMisturar todos os ingredientes em uma panela.\nLevar ao fogo baixo, mexer sempre até que desgrude do fundo da panela.\nDespejar em uma superfície untada, deixar esfriar bem e cortar em pedaços."
        },
        {
          "nome": "Doce de Abóbora e Coco",
          "receita": "Ingredientes:\n1 xícara (chá) de abobora cortadinha em cubos\n2 colheres (chá) de açúcar\n2 colheres (sopa) de água\n1 cravo\n1/2 pau de canela\n1 colher (sopa) de coco ralado\n\n\nModo de Preparo:\nNuma panela, misture a abóbora, o açúcar, a água, a canela e o cravo. \nCozinhando em fogo baixo, sempre mexendo até que amoleça a abóbora.\nApós isso, retire do fogo e adicione o coco ralado. Leve à geladeira para esfriar.\nServir frio."
        },
        {
          "nome": "Doce de Banana",
          "receita": "Ingredientes\n1 dúzia de bananas\n2 xícaras (chá) de açúcar\n2 xícara (chá) de água fervente\n\n\nModo de Preparo:\nColocar os ingredientes em uma panela de pressão por 3 minutos, depois ferver até ganhar consistência de doce.\nServir gelado."
        },
        {
          "nome": "Leite Condensado",
          "receita": "Ingredientes:\n2 litros de leite\n900 gramas de açúcar\n2 colheres (sopa) de Maizena\n1 colher (sopa) de fermento em pó\n\n\nModo de Preparo:\nDissolva a Maizena, o fermento e o açúcar no leite e leve ao fogo, dê uma mexida de vez em quando, para não pegar no fundo da panela.\nQuando a mistura ficar no ponto, isto é, quando ela adquirir a consistência do leite condensado, estará pronto.\nApós esfriar, acondicione em potes de vidro ou plástico."
        }
      ]
    },
    "massas": {
      "nome": "Massas",
      "receitas": [
        {
          "nome": "Torta de Atum",
          "receita": "Ingredientes:\nMassa:\n1 copo de leite (250 ml)\n3 ovos\n3 colheres (sopa) de margarina\n3 colheres (sopa) de queijo ralado (queijo prato)\nsal à gosto\n2 colheres (chá) de fermento\n2 xícaras (chá) de fermento de trigo\n\nRecheio:\n1 caixa de creme de leite\n1/2 xícara (chá) de molho de tomate\n250 gramas de mussarela\n1 lata de atum\nsal à gosto\n\n\nModo de Preparo:\nBater todos os ingredientes da massa no liquidificador (deverá ficar bem grosso).\nColocar a metade da massa com uma colher em uma forma untada e enfarinhada.\nMisturar todos os ingredientes do recheio e depois espalhar sobre a primeira camada. \nColocar por cima o restante da massa também utilizando uma colher.\nSalpicar queijo ralado e levar ao forno quente até dourar."
        },
        {
          "nome": "Torta de Forno",
          "receita": "Ingredientes:\nMassa:\n1/2 xícara (chá) de óleo\n3 xícaras (chá) de farinha de trigo com fermento\n3 colheres de leite\n2 xícaras de água\n2 ovos\n\nRecheio:\n1 peito de frango desfiado\n1 caixinha de ervilha\n2 colheres (sopa) de cheiro verde picadinho\n2 colheres (sopa) de cebola picada\n2 colheres (sopa) de pimentão picado\n1 lata de creme de leite ou um copo de requeijão\n500 gramas de queijo mussarela em fatias\n500 gramas de presunto em fatias\norégano à gosto\n\n\nModo de Preparo:\nRecheio:\nMisture todos os ingredientes, com exceção do queijo e do presunto. \nLevar ao fogo para aquecer. Reserve.\n\nMassa:\nBater todos os ingrediente no liquidificador até obter uma massa homogênea.\nEm uma forma untada e enfarinhada, colocar um pouco da massa até cobrir o fundo da forma.\nEm seguida, acrescente o recheio de frango coloque um pouco da massa e coloque o presunto e o queijo por cima.\nPor ultimo, coloque o  restante da massa. Salpique orégano por cima.\nLeve ao forno preaquecido a 180º C para assar por alguns minutos. Até que fique dourada e a massa fique firme."
        },
        {
          "nome": "Fogazza Assada",
          "receita": "Ingredientes:\n1 tablete de fermento biológico\n1 colher (sopa) de açúcar\n1/2 xícara (chá) de água morna\n1/2 xícara (chá) de óleo\n1 colher (chá) de sal\n2 e 1/2 xícaras (chá) farinha de trigo\n\nRecheio:\n3 tomates sem sementes picado\n1 cebola média picada\n1 colher (chá) de sal\n1/2 colher de (chá) de orégano\n300 gramas de mussarela ralada no ralo grosso\n\n\nModo de Preparo:\nMassa:\nEm uma vasilha grande, misture o fermento com o açúcar até ficar líquido. Junte a água, o óleo e o sal.\nAcrescente a farinha de trigo, aos poucos, e amasse até obter uma bola.\nCubra com o guardanapo e deixe crescer até dobrar de volume (cerca de 30 minutos).\nPreaqueça o forno em temperatura média (180º C).\n\nRecheio:\nEm uma tigela, misture os tomates, a cebola, o sal, o orégano e a mussarela.\nAbra a massa com um rolo sobre uma superfície lisa e cote em círculos com um cortador redondo (10 cm de diâmetro).\nColoque uma porção de recheio no centro, dobre a massa ao meio e aperte bem as bordas.\nColoque na assadeira, pincele com óleo e leve ao forno por 20 minutos.\n\nDica:\nSe preferir substitua o recheio por um de sua preferência."
        },
        {
          "nome": "Massa para Crepe",
          "receita": "Ingredientes:\n1 xícara (chá) de farinha de trigo\n1 e 1/4 xícara (chá) de leite\n1 ovo\n10 gotas de essência de baunilha\numa pitada de sal\n\n\n\nModo de Preparo:\nBata no liquidificador todos os ingredientes por 30 segundos.\nDespeje uma concha da massa e distribua sobre uma frigideira untada com óleo.\nAinda no fogo, recheie o crepe com os ingredientes de sua preferência.\nDobre a massa ao meio e sirva."
        },
        {
          "nome": "Panquecas",
          "receita": "Ingredientes:\n1 xícara de trigo\n2 ovos\n1 xícara de leite\n2 colher de queijo ralado\n\nModo de Preparo:\nBata tudo no liquidificador.\nCom o auxílio de uma concha coloque pequenas porções da massa em uma frigideira e espere até que frite.\nApós isso quando a masa já estiver pronta coloque o recheio que desejar."
        }
      ]
    },
    "molhos": {
      "nome": "Molhos",
      "receitas": [
        {
          "nome": "Molho Bolonhesa",
          "receita": "Ingredientes:\n1/2 kg de carne moída\n200 gramas de linguiça calabresa (opcional)\n50 gramas de bacon (opcional)\n2 cebolas raladas\n2 dentes de alho\n1 lata de molho de tomate\nlouro, salsa orégano, sal e pimenta à gosto\n1 xícara de óleo\n1 xícara de água (se necessário)\n\n\nModo de preparo:\nColoque o óleo numa panela, aqueça e adicione a cebola, deixa dourar acrescente a carne, o alho, os temperos à gosto e o molho de tomate.\nDeixe apurar e se necessário acrescente água"
        },
        {
          "nome": "Molho Branco",
          "receita": "Ingredientes:\n1/2 cebola pequena picada\n2 colheres de manteiga\n2 xícara de leite\n2 colheres (sopa) de Maizena\n1 lata de creme de leite\n1/2 copo de requeijão\nsal e pimenta do reino\n\n\nModo de Preparo:\nEm uma panela, coloque a manteiga e a cebola picada para fritar até começar a dourar.\nAcrescente a Maizena dissolvida no leite e mexa até engrossar se necessário acrescentar um pouco de água.\nColoque o creme de leite, o requeijão, o sal e a pimenta. "
        },
        {
          "nome": "Molho básico para Carne",
          "receita": "Ingredientes:\n1 lata de extrato de tomate \n1 lata de água (use a do extrato de tomate)\n1 lata de creme de cebola\n1 cerveja preta pequena\n\n\nModo de Preparo:\nApós dourar a carne, adicione todos os ingredientes. Leve para cozinhar.\nQuando começar a secar o molho, desligue o fogo. Sirva quente."
        },
        {
          "nome": "Molho de Tomate para Macarrão",
          "receita": "Ingredientes:\n1 cebola\n1 colher (sopa) de massa de tomate\n3 tomates \n1 colher (sopa) de manteiga\n1 tablete de caldo de carne\n\n\nModo de Preparo:\nRefogue a cebola, a massa de tomate e os tomates na gordura.\nJunte o tablete de caldo de carne (dissolvido em 1 copo de água fervente) e deixe ferver bem.\nPasse tudo por uma peneira grossa. Torne a levar ao fogo até adquirir consistência.."
        },
        {
          "nome": "Molho para Salada",
          "receita": "Ingredientes:\n4 colheres de sopa de óleo ou azeite de oliva\n1 e 1/2 ( uma e meia) colher (sopa) de caldo de limão\n1 colher (sopa) de açúcar\n1 colher (chá) de sal\n\n\nModo de Preparo:\nMisture o açúcar, o sal e o limão. Bater até que dissolva o sal e o açúcar.\nMisture o óleo, bata mais e sirva por cima de saladas cruas ou cozidas."
        }
      ]
    },
    "peixes": {
      "nome": "Peixes",
      "receitas": [
        {
          "nome": "Bolinho de Peixe",
          "receita": "Ingredientes:\n1 xícara de sobra de peixe (pescada, robalo) assado ou refogado\n1 xícara de cenoura em cubinhos cozida\n1/2 cebola picada\n1 ovo\n3 colheres (sopa) de queijo parmesão ralado\n3 colheres (sopa) de farinha de trigo\n1 colher (chá) de sal\nSalsinha a gosto\n1 colher (chá) de fermento em pó\n\n\nModo de Preparo:\nRetire os espinhos do peixe, e desfie. Se o peixe for assado,acrescente 2 colheres (sopa) de leite líquido para umedecer.\nMisture bem todos os ingredientes,deixando o fermento em pó por último.\nModele os bolinhos com as mãos molhadas para não grudar. Frite em óleo quente.\nPode substituir a cenoura por batata ou vagem. Se gostar acrescente uma folha de coentro picada."
        },
        {
          "nome": "Cação ao Molho Vermelho",
          "receita": "Ingredientes:\n1 kg de cação em postas\nsuco de 1 limão\n3 envelopes de sazón verde\n2 e 1/2 colheres de sal\n1 colher (sopa) de azeite de oliva\n2 dentes de alho espremidos\n1 cebola média picada\n1 xícara de polpa de tomate\n1 xícara de água\n1 pitada de açúcar\n\n\nModo de Preparo:\nTempere as postas com o suco de limão, 2 envelopes de sazón e 2 colheres de sal e deixe tomar gosto por 20 minutos.\nNuma panela grande, aqueça o azeite em fogo alto e refogue o alho e a cebola por 4 minutos, ou até dourarem.\nJunte a polpa de tomate, a água, o açúcar o sazón e o sal restantes, e cozinhe por 5 minutos.\nAcrescente as postas de cação e deixe cozinhar por mais 15 minutos, com a panela semi-tampada, ou até que o peixe esteja macio."
        },
        {
          "nome": "Moqueca de Peixe Fácil",
          "receita": "1 kg de peixe cação em postas\n1 pimentão verde em rodelas\n1 pimentão vermelho em rodelas\n1 pimentão amarelo em rodelas\n1 tomate em rodelas\n1 cebola em rodelas\n1 fio de azeite de oliva\nmolho shoyu\nvinagre (ou limão)\naçafrão\nsal\npimenta-do-reino\n1 maço de coentro (ou cheiro verde) e cebolinha\n1 tablete de caldo de peixe (ou camarão ou frango)\n1 vidro pequeno que leite de coco (200 ml)\n\n\nModo de Preparo:\nEm uma panela (de preferência que seja de barro) coloque no fundo uma camada de cebola, tomate e pimentões coloridos.\nColoque as postas de peixe.\nVamos temperar: \num fio de azeite, um pouquinho de vinagre (ou limão), regue com molho shoyu, uma pitada de sal, uma pitada de açafrão; uma pitada de pimenta do reino (ou molho de pimenta).\nColoque na panela o tablete de caldo de peixe (camarão ou frango).\nColoque o restante das rodelas de cebola, tomate e pimentões.\nLembre-se que o peixe pega tempero muito fácil e o que faz ficar gostoso é a suavidade no sabor, portanto coloque um pouquinho de cada. ingrediente (sal, vinagre, azeite, shoyu, pimenta, açafrão).\nO peixe vai soltar uma água, tampe a panela e deixe cozinha até ficar mole, cuidado para não cozinhar muito e desfazer as postas.\nSe necessário coloque um pouquinho de água filtrada.\nQuando o peixe estiver cozido, tempere com o coentro e a cebolinha e derrame o leite de coco (que nesta receita pode ser opcional).\nServir com pirão e arroz branco."
        },
        {
          "nome": "Peixe na Moranga",
          "receita": "Ingredientes:\n1 moranga de aproximadamente 2 quilos\nmeia xícara (chá) de água\n2 cubos de caldo de bacalhau KNORR\n1 embalagem de polpa de tomate POMODORO (260 g)\nvidro pequeno de leite de coco (200 ml)\n300 g de filé de peixe picado\n\n\nModo de Preparo:\nEm uma panela grande, coloque a moranga e cubra-a com água.\nCozinhe até que ela fique macia.\nRetire a moranga da água, corte uma tampa na sua parte superior e remova as sementes e a polpa.\nReserve a polpa.\nEm uma panela média, ferva a água e dissolva os cubos de caldo de bacalhau KNORR.\nAcrescente a polpa de tomate POMODORO e cozinhe.\nCom a panela parcialmente tampada, por 10 minutos ou até o molho encorpar levemente.\nJunte o leite de coco e o filé de peixe.\nCozinhe por 5 minutos ou até o peixe ficar macio.\nMisture a polpa reservada e coloque na moranga.\nSirva em seguida.\n\nDica:\nSe desejar, salpique coentro picado.\nSe preferir, unte a moranga com azeite e cozinhe no forno de microondas, em potência alta, por 20 minutos ou até que ela fique macia e firme. Retire do microondas e reserve até esfriar."
        },
        {
          "nome": "Bobó de Camarão",
          "receita": "Ingredientes:\n1 kg de camarão fresco\nsal\n3 dentes de alho picados e amassados\nsuco de 1 limão\npimenta-do-reino\n1 kg de mandioca (prefira as que já vem embaladas e descascadas, é mais prático)\n3 cebolas (1 cortada em rodelas e 2 raladas)\n1 folha de louro\n6 colheres (sopa) de azeite de oliva\n2 vidros de leite de coco\n1 maço de cheiro-verde picado\n2 latas de molho pronto de tomate (pomarola)\n2 pimentões verdes bem picadinhos\n2 colheres (sopa) de azeite de dendê\n\n\nModo de Preparo:\nLave os camarões e tempere com sal, alho, pimenta e limão, deixe marinar.\nPegue uma panela com água e cozinhe a mandioca em pedacinhos, com louro e a cebola em rodelas.\nQuando estiver mole, acrescente um vidro de leite de coco.\nDeixe esfriar um pouco e bata no liquidificador.\nEsquente o azeite de oliva, junte a cebola ralada e deixe dourar.\nAcrescente os camarões e frite.\nAdicione as 2 latas de pomarola, o cheiro-verde, o pimentão e deixe cozinhar por alguns minutos.\nJunte na mesma panela, a mandioca batida no liquidificador, outro vidro de leite de coco e o azeite de dendê.\nDeixe levantar fervura e está pronto."
        }
      ]
    }
  }
};