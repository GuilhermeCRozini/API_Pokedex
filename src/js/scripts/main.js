// scripts do slide principal
// https://swiperjs.com

var slide_hero = new Swiper(".slide-hero", {
  effect: 'fade',
  pagination: {
    el: ".slide-hero .main-area .area-explore .swiper-pagination",
  },
});


//*********************************************************//

// como serão vários cards, irei selecionar todos e depois fazer o evento de click somente no que eu cliquei
const cardPokemon = document.querySelectorAll('.js-open-details-pokemon');
const btnCloseModal = document.querySelector('.js-close-modal-details-pokemon');
const countPokemons = document.getElementById('js-count-pokemons');


// mapeando tudo, porque o querySelector retorna para mim um vetor com todos os itens que existem da classe
// percorrendo cada item cada item que existe e fazer o evento de click
// O primeiro parâmetro será o card que é o item que irei clicar
cardPokemon.forEach(card => {
  card.addEventListener('click', openDetailsPokemon);
})

//Se o JS vier na página e encontrar esse elemento, ele vai entrar no if e executar essa função, mas se entrar na página e não encontrar o btnCloseModal, vai dar false, ou seja, vai entrar no if e sair direto sem exibir erro
if(btnCloseModal) {
  btnCloseModal.addEventListener('click', closeDetailsPokemon);
}


//Referente à exibição da lista dos tipos de Pokémon para o Mobile

const btnDropdownSelect = document.querySelector('.js-open-select-custom');

btnDropdownSelect.addEventListener('click', () => {
//Pegando o pai do elemento btnDropdownSelect que é o select-custom 
//toggle - se estiver fechado ele abre e se estiver aberto ele fecha
  btnDropdownSelect.parentElement.classList.toggle('active');
})

const areaPokemons = document.getElementById('js-list-pokemons');

function primeiraLetraMaiuscula(string) {
//O parâmetro string é o nome do Pokémon que está sendo passado
//Colocando a primeira letra do Pokémon em maiúsculo
//O charAt pega a string, transforma em um vetor, e irá pegar cada letra
//Definindo a posição 0 para pegar a primeira letra e o toUpperCase está a deixando maiúscula
//string.slice(1) -> Está pegando toda a minha string sem a primeira posição
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Função criando o HTML pelo JS
function createCardPokemon(code, type, nome, imagePok) {
//Criando o botão que é o próprio card
  let card = document.createElement('button');
//Adicionando três classes ao card
//O tipo será preenchido de acordo com o Pokémon que está vindo
  card.classList = `card-pokemon js-open-details-pokemon ${type}`;
  card.setAttribute('code-pokemon', code);
//Onde eu vou adicionar esse card que estou criando
//Indicando areaPokemon e o que eu criarei dentro dele, que é o card que acabei de criar
  areaPokemons.appendChild(card);

//Criando a div imagem
  let image = document.createElement('div');
  image.classList = 'image';
  card.appendChild(image);

//Imagem que tem dentro da div
//Criando o elemento img
  let imageSrc = document.createElement('img')
  imageSrc.className = 'thumb-img';
//Definindo um atributo src para img, e inserindo o imagePok no atributo
  imageSrc.setAttribute('src', imagePok);
//Inserindo o imageSrc dentro da div image
  image.appendChild(imageSrc);

//Criando a div info
  let infoCardPokemon = document.createElement('div');
  infoCardPokemon.classList = 'info';
  card.appendChild(infoCardPokemon);

//Criando a div text
  let infoTextPokemon = document.createElement('div');
  infoTextPokemon.classList = 'text';
  infoCardPokemon.appendChild(infoTextPokemon);

//Criando o span code
  let codePokemon = document.createElement('span');
//Valor do código do Pokémon
//If ternário é um if só que de forma reduzida
//Se o meu código for menor do que 10 (Porque precisa preencher de 01 até 9), eu quero que o meu texContent preencha com #00${code}, se for falso 
  codePokemon.textContent = (code < 10) ? `#00${code}` : (code < 100) ? `#0${code}` : `#${code}`;
  infoTextPokemon.appendChild(codePokemon);

//Nome do Pokémon
  let namePokemon = document.createElement('h3');
  namePokemon.textContent = primeiraLetraMaiuscula(nome);
  infoTextPokemon.appendChild(namePokemon);

//Criando a div para o icon
  let areaIcon = document.createElement('div');
  areaIcon.classList = 'icon';
  infoCardPokemon.appendChild(areaIcon);

//Adicionando a imagem do tipo
  let imgType = document.createElement('img');
  imgType.setAttribute('src', `src/img/icon-types/${type}.svg`)
  areaIcon.appendChild(imgType);
}


//Função para realizar a listagem dos Pokémons
//O primeiro parâmetro será a url da API que eu irei chamar
function listingPokemons(urlApi) {
    axios({
      method:'GET',
      url:urlApi
    })
    .then((response) => {
      //console.log(response)

  //Deconstruction do JS
  //Pegando apenas o que eu quero
      const { results, next, count } = response.data;     
  //Carrega quantos Pokémons já existem no total
      countPokemons.innerText = count;

  //Agora é preciso percorrer o Result, para buscar todos os Pokémons da resposta que a API trouxe, visando pegar a url para fazer uma nova requisição trazendo os detalhes do Pokémon como a imagem, nome, código, tipo, etc.
  //forEach porque estará percorrendo, Pokémon que é o que cada percorrida irá retornar para mim
      results.forEach(pokemon => {
  //Buscando todos os detalhes de cada Pokémon que veio nessa primeira listagem.
        let urlApiDetails = pokemon.url;
        //console.log(urlApiDetails);

  //Chamando outra API para trazer os detalhes
        axios({
          method: 'GET',
    //Ao entrar aqui, vai realizar uma chamada à API de cada detalhe do Pokémon
          url: `${urlApiDetails}`
        })
        .then(response => {
          //console.log(response.data);

    //Realizando outra desestruturação dentro desse response
    //Esses são os dados que serão mostrados no card principal
          const { name, id, sprites, types } = response.data;

    //Criando um objeto chamado infoCard para organizer meu código, facilitando a leitura
          const infoCard = {
            nome: name,
            code: id,
    //Vai trazer o caminho da imagem de cada Pokémon da API
            imagePok: sprites.other.dream_world.front_default,
    //Pegando types na posição 0, para sempre pegar o primeiro tipo, porque alguns Pokémons possuem mais de um tipo
            type: types[0].type.name
          }

    //Acessando o infoCard
         createCardPokemon(infoCard.code, infoCard.type, infoCard.nome, infoCard.imagePok); 

    //Após criado todos os Pokémons, e fazer a listagem acima, irei mapear todos eles para adicionar o evento de clique para abrir os detalhes do Pokémon
          const cardPokemon = document.querySelectorAll('.js-open-details-pokemon');

          cardPokemon.forEach(card => {
            card.addEventListener('click', openDetailsPokemon);
          })

      })
    })
  })
}

//Chamando a função
//Quando carregar a página, irei executar primeiramente a função para que ela traga os 9 primeiros Pokémons
  listingPokemons('https://pokeapi.co/api/v2/pokemon?limit=9&offset=0')
/*
  https://pokeapi.co/api/v2/pokemon?limit=9&offet=0
  Limit -> Mostra apenas 9
  Offset -> Definido como 0 para que não pule nenhum, se eu colocar por exemplo 100, irá mostrar só a partir dos que vierem depois do 100
*/

//Função de abrir
//Essa função deve ficar depois de criar os elementos porque se ficar antes ela não funcionará
function openDetailsPokemon() {
  // Adicionando a classe open-modal no meu HTML
    document.documentElement.classList.add('open-modal');

  //O this pega onde estou clicando
    let codePokemon = this.getAttribute('code-pokemon');
    let imagePokemon = this.querySelector('.thumb-img');
    let iconTypePokemon = this.querySelector('.info .icon img');
    let namePokemon = this.querySelector('.info h3');
    let codeStringPokemon = this.querySelector('.info span');

    const modalDetails = document.getElementById('js-modal-details');
    const imgPokemonModal = document.getElementById('js-image-pokemon-modal');
    const iconTypePokemonModal = document.getElementById('js-image-type-modal');
    const namePokemonModal = document.getElementById('js-name-pokemon-modal');
    const codePokemonModal =  document.getElementById('js-code-pokemon-modal');
    const heightPokemonModal = document.getElementById('js-height-pokemon');
    const weightPokemonModal = document.getElementById('js-weight-pokemon');
    const mainAbilitiesPokemonModal = document.getElementById('js-main-abilities-pokemon');

//Pegando o src da imagem do card e atrelando no src da imagem do modal
    imgPokemonModal.setAttribute('src', imagePokemon.getAttribute('src'));
    modalDetails.setAttribute('type-pokemon-modal', this.classList[2]);
    iconTypePokemonModal.setAttribute('src', iconTypePokemon.getAttribute('src'));
    
    namePokemonModal.textContent = namePokemon.textContent;
    codePokemonModal.textContent = codeStringPokemon.textContent;

    axios({
      method: 'GET',
      url: `https://pokeapi.co/api/v2/pokemon/${codePokemon}`
    })
    .then(response => {
      let data = response.data;

      let infoPokemon = {
        mainAbilities : primeiraLetraMaiuscula(data.abilities[0].ability.name),
        types: data.types,
        weight: data.weight,
        height: data.height,
        abilities: data.abilities,
        stats: data.stats,
//Acessando o tipo princiál do Pokémon, para pegar todas as fraquezas relacionadas à esse tipo
        urlType: data.types[0].type.url
      }

//Vou pegar o Array de types, fazer um forEach nele, para cirar a tag no layout e listar
      function listingTypesPokemon() {
        const areaTypesModal = document.getElementById('js-types-pokemon');

        areaTypesModal.innerHTML = '';

        let arrayTypes = infoPokemon.types;

        arrayTypes.forEach(itemType => {
          let itemList = document.createElement('li');
          areaTypesModal.appendChild(itemList);

          let spanList = document.createElement('span');
          spanList.classList = `tag-type ${itemType.type.name}`;
          spanList.textContent = primeiraLetraMaiuscula(itemType.type.name);
          itemList.appendChild(spanList);
        })
      }

      function listingWeaknesses() {
        const areaWeak = document.getElementById('js-area-weak');

        areaWeak.innerHTML = '';

//Percorrendo a API com o tipo que eu tenho para retornar as fraquezas
        axios({
          method: 'GET',
          url: `${infoPokemon.urlType}`
        })
        .then(response => {
          let weaknesses = response.data.damage_relations.double_damage_from;

            weaknesses.forEach(itemType => {
              let itemListWeak = document.createElement('li');
              areaWeak.appendChild(itemListWeak);
      
              let spanList = document.createElement('span');
              spanList.classList = `tag-type ${itemType.name}`;
              spanList.textContent = primeiraLetraMaiuscula(itemType.name);
              itemListWeak.appendChild(spanList);
          })
        })
      }

      heightPokemonModal.textContent = `${infoPokemon.height / 10}m`;
//Apareceu 69, para converter para 6.9, vou dividir por 10
      weightPokemonModal.textContent = `${infoPokemon.weight / 10}Kg`;
      mainAbilitiesPokemonModal.textContent = infoPokemon.mainAbilities;

      const statsHp = document.getElementById('js-stats-hp');
      statsHp.style.width = `${infoPokemon.stats[0].base_stat}%`

      const statsAttack = document.getElementById('js-stats-attack');
      statsAttack.style.width = `${infoPokemon.stats[1].base_stat}%`

      const statsDefense = document.getElementById('js-stats-defense');
      statsDefense.style.width = `${infoPokemon.stats[2].base_stat}%`

      const statsSpAttack = document.getElementById('js-stats-sp-attack');
      statsSpAttack.style.width = `${infoPokemon.stats[3].base_stat}%`

      const statsSpDefense = document.getElementById('js-stats-sp-defense');
      statsSpDefense.style.width = `${infoPokemon.stats[4].base_stat}%`

      const statsSpeed = document.getElementById('js-stats-speed');
      statsSpeed.style.width = `${infoPokemon.stats[5].base_stat}%`

      listingTypesPokemon();
      listingWeaknesses(); 
    })
  }
  
  //Função de fechar
  function closeDetailsPokemon() {
    // Adicionando a classe open-modal no meu HTML
      document.documentElement.classList.remove('open-modal');
    }

// Script para listar todos os tipo de Pokémon

const areaTypes =  document.getElementById('js-type-area');
const areaTypesMobile =  document.querySelector('.dropdown-select');

    axios({
      method: 'GET',
      url: 'https://pokeapi.co/api/v2/type'
    })
    .then(response => {
      const { results } = response.data;
//Pegando o index porque é referente à posição de cada tipo
      results.forEach((type, index) => {

        if(index < 18) {

          let itemType = document.createElement('li');
//Inserindo todos os li no areaTypes
          areaTypes.appendChild(itemType);
          
          let buttonType = document.createElement('button');
          buttonType.classList = `type-filter ${type.name}`;
//+1 Porque o id não começa do 0 e sim do 1
          buttonType.setAttribute('code-type', index + 1);
          itemType.appendChild(buttonType);

          let iconType = document.createElement('div');
          iconType.classList = 'icon';
          buttonType.appendChild(iconType);

          let srcType = document.createElement('img');
          srcType.setAttribute('src', `src/img/icon-types/${type.name}.svg`);
          iconType.appendChild(srcType);

          let nameType = document.createElement('span');
          nameType.textContent = primeiraLetraMaiuscula(type.name);
          buttonType.appendChild(nameType);

    //******************* Preenchimento do select MOBILE dos tipos *******************

          let itemTypeMobile = document.createElement('li');
          areaTypesMobile.appendChild(itemTypeMobile);

          let buttonTypeMobile = document.createElement('button');
          buttonTypeMobile.classList = `type-filter ${type.name}`;
          buttonTypeMobile.setAttribute('code-type', index + 1);
          itemTypeMobile.appendChild(buttonTypeMobile);

          let iconTypeMobile = document.createElement('div');
          iconTypeMobile.classList = 'icon';
          buttonTypeMobile.appendChild(iconTypeMobile);

          let srcTypeMobile = document.createElement('img');
          srcTypeMobile.setAttribute('src', `src/img/icon-types/${type.name}.svg`);
          iconTypeMobile.appendChild(srcTypeMobile);

          let nameTypeMobile = document.createElement('span');
          nameTypeMobile.textContent = primeiraLetraMaiuscula(type.name);
          buttonTypeMobile.appendChild(nameTypeMobile);

          const allTypes = document.querySelectorAll('.type-filter');

          allTypes.forEach(btn => {
            btn.addEventListener('click', filterByTypes);
          })
        }
      })
    })

//*********** Funcionalidade do LOAD MORE ***********/

const btnLoadMore = document.getElementById('js-btn-load-more');  

//Toda vez que for clicar no Botão Load More, vamos criar um contador que irá incrementar o número 9 (limit)
//Quero manter os Pokémons que estavam aparecendo e que os novos que aparecerem ao clicar no botão se junte a eles
//O contador começará de 10, já que possuo 9 Pokémons já carregados na página
let countPagination = 10;

    function showMorePokemon() {
      listingPokemons(`https://pokeapi.co/api/v2/pokemon?limit=9&offset=${countPagination}`);

//Pegando o meu valor atual e somando 9, por exemplo se o valor do countPagination for 10, na próxia vez que clicar no botão, será 19 e seguirá o loop assim por diante
      countPagination = countPagination + 9;
    }

    btnLoadMore.addEventListener('click', showMorePokemon);

/********************** FUNÇÃO PARA FILTRAR OS POKÉMONS POR TIPO **********************/

  function filterByTypes() {
    let idPokemon = this.getAttribute('code-type');

    const areaPokemons = document.getElementById('js-list-pokemons');
    const btnLoadMore = document.getElementById('js-btn-load-more');

    const allTypes = document.querySelectorAll('.type-filter');

    areaPokemons.innerHTML = '';
    btnLoadMore.style.display = 'none';

    const sectionPokemons = document.querySelector('.s-all-info-pokemons');
    
//Pegando a posição inicial sessão
//Mostra onde se inicia a sessão, nesse caso mostra 706
    const topSection = sectionPokemons.offsetTop;    
//  console.log(topSection);

//Criando a função de Smooth, para dar o Scroll e parar na posição certa
    window.scrollTo({
      top: topSection + 288,
      behavior: 'smooth'
    })

//Percorrendo todos os tipos e removendo a classe active
    allTypes.forEach(type => {
      type.classList.remove('active');
    })

//Depois que percorreu todos, executa essa linha de comando e só ativa o que eu cliquei    
    this.classList.add('active');

//Antes da minha chamada da API, se encontrar algum número é porque será verdadeiro, então entrará dentro desse if, se for falso vai resetar a minha área, dar um display block no botão btnLoadMore e chamar o listingPokemons, que é de quando carrega a página    
    if(idPokemon) {
      axios({
        method: 'GET',
        url: `https://pokeapi.co/api/v2/type/${idPokemon}`
      })
      .then(response => {
  
        const { pokemon } =  response.data;
  
  //Quando eu clicar no tipo do Pokémon, mostrará quantos Pokémons do tipo escolhido existem
        countPokemons.textContent = pokemon.length;
  
  //Pegando url de cada Pokémon
        pokemon.forEach(pok => {
          const { url } = pok.pokemon;
  
          axios({
            method: 'GET',
            url: `${url}`
          })
          .then(response => {
              const { name, id, sprites, types } = response.data;
  
              const infoCard = {
                nome: name,
                code: id,
                imagePok: sprites.other.dream_world.front_default,
                type: types[0].type.name
              }
              
  //Só cria o card se tiver a imagem do Pokémon
              if(infoCard.imagePok) {
                createCardPokemon(infoCard.code, infoCard.type, infoCard.nome, infoCard.imagePok); 
              }
  
            const cardPokemon = document.querySelectorAll('.js-open-details-pokemon');
    
            cardPokemon.forEach(card => {
              card.addEventListener('click', openDetailsPokemon);
            })
          })
        })
      })
    } else {
//Lembrando que deve sempre limpar antes e listar depois e não o contrário
    areaPokemons.innerHTML = '';

    listingPokemons('https://pokeapi.co/api/v2/pokemon?limit=9&offset=0');

    btnLoadMore.style.display = 'block';
    }
  }


/********************** FUNCIONALIDADE DO SEARCH **********************/

const btnSearch = document.getElementById('js-btn-search');
const inputSearch = document.getElementById('js-input-search');

btnSearch.addEventListener('click', searchPokemon)

inputSearch.addEventListener('keyup', (event) => {
//Capturando o evento do ENTER (Quando clica no enter do teclado para buscar)
//Verificação se o botão que eu cliquei é o ENTER
  if(event.code === 'Enter') {
    searchPokemon();
  }
})

  function searchPokemon() {
//Pegando o que foi digitado no campo
    let valueInput = inputSearch.value.toLowerCase();
    const typeFilter = document.querySelectorAll('.type-filter');

//Quando pesquisar, irá tirar o active de todos os icones tipos
    typeFilter.forEach(type => {
      type.classList.remove('active');
    })

    axios({
      method: 'GET',
      url: `https://pokeapi.co/api/v2/pokemon/${valueInput}`
    })
    .then(response => {

      areaPokemons.innerHTML = '';
      btnLoadMore.style.display = 'none';
//O contador de Pokémons mostrará 1, porque OBVIAMENTE não existe mais de um Pokémon com o mesmo nome e código
      countPokemons.textContent = 1;

        const { name, id, sprites, types } = response.data;
    
        const infoCard = {
          nome: name,
          code: id,
          imagePok: sprites.other.dream_world.front_default,
          type: types[0].type.name
        }
        
        if(infoCard.imagePok) {
          createCardPokemon(infoCard.code, infoCard.type, infoCard.nome, infoCard.imagePok); 
        }

      const cardPokemon = document.querySelectorAll('.js-open-details-pokemon');

      cardPokemon.forEach(card => {
        card.addEventListener('click', openDetailsPokemon);
      })
    })
//Função com tratamento de erro do Axios
//Caso contenha algum erro, irá cair dentro do catch
    .catch((error) => {
      if(error.response) {
        areaPokemons.innerHTML = '';
        btnLoadMore.style.display = 'none';
//Recebendo 0 porque não encontrou nada
        countPokemons.textContent = 0;
        alert('Não foi encontrado nenhum resultado com esta pesquisa!');
      }
    })    
  }