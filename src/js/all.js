/*
  API Pokédex – script principal
  - Ordenação correta por ID
  - Busca com autocomplete + filtro ao digitar (live search)
  - Correções de bugs antigos da busca/filtro por tipo
*/

(() => {
  'use strict';

  // -----------------------------
  // Elementos base
  // -----------------------------
  const areaPokemons = document.getElementById('js-list-pokemons');
  const countPokemons = document.getElementById('js-count-pokemons');
  const btnLoadMore = document.getElementById('js-btn-load-more');
  const btnSearch = document.getElementById('js-btn-search');
  const inputSearch = document.getElementById('js-input-search');
  const datalistSuggestions = document.getElementById('js-pokemon-suggestions');
  const btnCloseModal = document.querySelector('.js-close-modal-details-pokemon');

  const btnDropdownSelect = document.querySelector('.js-open-select-custom');
  const areaTypes = document.getElementById('js-type-area');
  const areaTypesMobile = document.querySelector('.dropdown-select');

  // Guardas
  // Guardas (importante para iniciantes):
  // - Se a página não tiver os elementos essenciais da LISTA, não faz sentido continuar.
  // - Elementos de busca/filtro são opcionais: se faltarem, a lista ainda pode funcionar.
  if (!areaPokemons || !countPokemons || !btnLoadMore) {
    // Se a página não tiver os elementos esperados, não fazemos nada.
    return;
  }

  // -----------------------------
  // Estado
  // -----------------------------
  const PAGE_SIZE_ALL = 9;
  const PAGE_SIZE_SEARCH = 30;

  // state (estado) guarda o 'modo atual' da tela e dados da busca.
  // Isso evita variáveis soltas e facilita entender o fluxo.
  const state = {
    mode: 'all', // all | type | search | exact
    allOffset: 0,
    activeTypeId: null,
    // Índice de pokémons (nome/url/id) para autocomplete + busca instantânea
    indexLoaded: false,
    pokemonIndex: /** @type {{name:string,url:string,id:number}[]} */ ([]),
    // Busca por prefixo ("começa com")
    search: {
      query: '',
      matches: /** @type {{name:string,url:string,id:number}[]} */ ([]),
      offset: 0,
    },
  };

  // Cache para evitar refetch durante digitação
  /** @type {Map<number, {id:number,name:string,type:string,image:string}>} */
  const pokemonCache = new Map();

  // -----------------------------
  // Utilitários
  // -----------------------------
  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const formatCode = (id) => {
    if (id < 10) return `#00${id}`;
    if (id < 100) return `#0${id}`;
    return `#${id}`;
  };

  const getIdFromUrl = (url) => {
    const parts = String(url).split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    const id = Number.parseInt(last, 10);
    return Number.isFinite(id) ? id : 0;
  };

  const getFallbackImage = (sprites) => {
    return (
      sprites?.other?.dream_world?.front_default ||
      sprites?.other?.['official-artwork']?.front_default ||
      sprites?.front_default ||
      ''
    );
  };

async function fetchJson(url) {
  // Para iniciantes:
  // - O projeto originalmente usa Axios (biblioteca) para fazer requisições.
  // - Se por algum motivo o Axios não carregar (ex.: cache/arquivo não encontrado),
  //   usamos o fetch() nativo do navegador como fallback para NÃO quebrar a página.
  if (typeof axios !== 'undefined' && axios?.get) {
    const res = await axios.get(url);
    return res.data;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ao acessar ${url}`);
  }
  return await res.json();
}

  async function fetchInBatches(urls, batchSize = 20) {
    const out = [];
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((u) =>
          fetchJson(u).catch(() => null)
        )
      );
      results.forEach((r) => {
        if (r) out.push(r);
      });
    }
    return out;
  }

  
  // -----------------------------
  // Busca por prefixo (começa com)
  // -----------------------------
  // Regra principal pedida:
  // - Se você digita "c", deve aparecer só quem COMEÇA com "c" (ex.: caterpie, charmander...)
  // - Se você digita "ch", deve aparecer só quem COMEÇA com "ch" (ex.: charmander, charmeleon...)
  // - Se você digita "cha", deve aparecer só quem COMEÇA com "cha"...
  //
  // Por isso usamos startsWith() em vez de includes().
  // startsWith("cha") garante que o texto comece com "cha".
  function matchesNamePrefix(pokemonName, query) {
    return pokemonName.startsWith(query);
  }

function clearPokemonList() {
    areaPokemons.innerHTML = '';
  }

  function renderError(message) {
    clearPokemonList();
    const divConteudoErro = document.createElement('div');
    divConteudoErro.className = 'conteudo-erro';
    areaPokemons.appendChild(divConteudoErro);

    const spanErro = document.createElement('span');
    divConteudoErro.appendChild(spanErro);

    const textoErro = document.createElement('h2');
    textoErro.textContent = message;
    textoErro.className = 'text-erro';
    spanErro.appendChild(textoErro);

    const imgErro = document.createElement('img');
    imgErro.setAttribute('src', 'src/img/sad-pikachu.png');
    imgErro.className = 'imgErro';
    spanErro.appendChild(imgErro);
  }

  /**
 * Mantém o campo de busca visível sem "puxar" a página demais.
 *
 * Antes: rolava para section.offsetTop + 288 (podia descer muito e esconder o input).
 * Agora: rola o mínimo necessário para o input continuar visível na tela.
 *
 * Dica para iniciante:
 * - getBoundingClientRect() dá a posição do elemento na tela (viewport), não no documento todo.
 * - Se o input já está visível, NÃO fazemos nada (evita a página "andar" ao digitar).
 */
function scrollToPokemonSection() {
  if (!inputSearch) return;

  const margin = 16; // "respiro" para o input não ficar colado na borda da tela
  const rect = inputSearch.getBoundingClientRect();

  // Caso 1: o topo do input ficou acima da área visível
  if (rect.top < margin) {
    window.scrollTo({
      top: window.scrollY + rect.top - margin,
      behavior: 'smooth',
    });
    return;
  }

  // Caso 2: o fim do input passou do limite inferior visível
  const bottomLimit = window.innerHeight - margin;
  if (rect.bottom > bottomLimit) {
    window.scrollTo({
      top: window.scrollY + (rect.bottom - window.innerHeight) + margin,
      behavior: 'smooth',
    });
  }
}

  // -----------------------------
  // Swiper
  // -----------------------------
  try {
    if (window.Swiper) {
      // eslint-disable-next-line no-new
      new Swiper('.slide-hero', {
        pagination: { el: '.slide-hero .main-area .area-explore .swiper-pagination' },
        effect: 'fade',
        autoplay: { delay: 4000, disableOnInteraction: false },
        keyboard: { enabled: true },
      });
    }
  } catch (e) {
    // Sem swiper, não quebra o app.
  }

  // -----------------------------
  // Cards
  // -----------------------------
  function createCardPokemon(model) {
    const { id, type, types = [type], name, image } = model;

    const card = document.createElement('button');
    card.classList = `card-pokemon js-open-details-pokemon ${type}`;
    card.setAttribute('code-pokemon', String(id));

    // imagem
    const imageWrap = document.createElement('div');
    imageWrap.classList = 'image';
    card.appendChild(imageWrap);

    const img = document.createElement('img');
    img.className = 'thumb-img';
    img.setAttribute('src', image);
    imageWrap.appendChild(img);

    // info
    const info = document.createElement('div');
    info.classList = 'info';
    card.appendChild(info);

    const text = document.createElement('div');
    text.classList = 'text';
    info.appendChild(text);

    const spanCode = document.createElement('span');
    spanCode.textContent = formatCode(id);
    text.appendChild(spanCode);

    const h3 = document.createElement('h3');
    h3.textContent = capitalize(name);
    text.appendChild(h3);

const icon = document.createElement('div');
icon.classList = 'icon';
info.appendChild(icon);

// Ícones de type (principal + secundário quando existir)
// - Ex.: Bulbasaur -> [grass, poison]
const uniqueTypes = Array.from(new Set((types || []).filter(Boolean))).slice(0, 2);

if (uniqueTypes.length > 1) {
  // Ajuda o CSS a identificar que existem 2 ícones (sem mudar o layout do desktop).
  icon.classList.add('icon--double');
}

uniqueTypes.forEach((t) => {
  const imgType = document.createElement('img');
  imgType.setAttribute('src', `src/img/icon-types/${t}.svg`);
  imgType.setAttribute('alt', `${t} icon`);
  icon.appendChild(imgType);
});

    card.addEventListener('click', openDetailsPokemon);
    areaPokemons.appendChild(card);
  }

function toCardModel(pokemonData) {
  const id = pokemonData.id;
  const name = pokemonData.name;

  // Types (ordem principal -> secundário)
  // A PokeAPI traz "slot" para indicar qual é o type principal (slot 1) e o secundário (slot 2).
  const types = (pokemonData.types || [])
    .slice()
    .sort((a, b) => (a.slot || 0) - (b.slot || 0))
    .map((t) => t.type?.name)
    .filter(Boolean);

  const type = types[0] || 'normal'; // type principal (usado no tema/classe do card)
  const image = getFallbackImage(pokemonData.sprites);

  return { id, name, type, types, image };
}

  function upsertCache(model) {
    if (!model || !model.id) return;
    if (!pokemonCache.has(model.id)) {
      pokemonCache.set(model.id, model);
    }
  }

// -----------------------------
// Ícones de type no MODAL (principal + secundário)
// -----------------------------
function setModalTypeIcons(modalEl, typeNames) {
  const iconWrap = modalEl?.querySelector('.left-container .icon');
  if (!iconWrap) return;

  // Ícone principal (já existe no HTML com id="js-image-type-modal")
  const imgPrimary = iconWrap.querySelector('#js-image-type-modal');

  // Ícone secundário (criamos via JS para não precisar mudar o HTML)
  let imgSecondary = iconWrap.querySelector('img.js-image-type-modal-secondary');

  // Normaliza e limita a 2 tipos
  const types = Array.from(new Set((typeNames || []).filter(Boolean))).slice(0, 2);

  if (imgPrimary) {
    imgPrimary.setAttribute('src', types[0] ? `src/img/icon-types/${types[0]}.svg` : '');
    imgPrimary.setAttribute('alt', types[0] ? `${types[0]} icon` : '');
  }

  // Cria o segundo <img> só quando precisar (para não afetar layout do desktop quando não for necessário)
  if (types.length > 1) {
    if (!imgSecondary) {
      imgSecondary = document.createElement('img');
      imgSecondary.className = 'js-image-type-modal-secondary';
      // Colocamos o secundário DEPOIS do principal (ordem esquerda -> direita)
      iconWrap.appendChild(imgSecondary);
    }
    imgSecondary.style.display = '';
    imgSecondary.setAttribute('src', `src/img/icon-types/${types[1]}.svg`);
    imgSecondary.setAttribute('alt', `${types[1]} icon`);
    iconWrap.classList.add('icon--double');
  } else if (imgSecondary) {
    imgSecondary.style.display = 'none';
    imgSecondary.setAttribute('src', '');
    imgSecondary.setAttribute('alt', '');
    iconWrap.classList.remove('icon--double');
  }
}

  // -----------------------------
  // Modal
  // -----------------------------
  async function openDetailsPokemon() {
    document.documentElement.classList.add('open-modal');
    document.documentElement.style.overflow = 'hidden';

    const codePokemon = this.getAttribute('code-pokemon');
    const modal = document.getElementById('js-modal-details');
    if (!modal) return;

    // Preenche o básico a partir do card (resposta imediata)
const cardImg = this.querySelector('.thumb-img');
const cardName = this.querySelector('.info h3');
const cardCode = this.querySelector('.info span');

const elImage = document.getElementById('js-image-pokemon-modal');
const elName = document.getElementById('js-name-pokemon-modal');
const elCode = document.getElementById('js-code-pokemon-modal');

if (elImage && cardImg) elImage.setAttribute('src', cardImg.getAttribute('src'));
if (elName && cardName) elName.textContent = cardName.textContent;
if (elCode && cardCode) elCode.textContent = cardCode.textContent;

// Ícones de type no modal:
// - Lemos os types direto do card (se tiver 1 ou 2 ícones).
const cardTypeIcons = Array.from(this.querySelectorAll('.info .icon img'));
const typeNamesFromCard = cardTypeIcons
  .map((img) => (img.getAttribute('src') || '').split('/').pop()?.replace('.svg', ''))
  .filter(Boolean);

setModalTypeIcons(modal, typeNamesFromCard);

    // Define tema (background) do modal
    const typeClass = this.classList[2];
    if (typeClass) modal.setAttribute('type-pokemon-modal', typeClass);

    // Busca detalhes completos
    try {
      const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${codePokemon}`);

      // Height / Weight
      const elHeight = document.getElementById('js-height-pokemon');
      const elWeight = document.getElementById('js-weight-pokemon');
      if (elHeight) elHeight.textContent = `${(data.height || 0) / 10}m`;
      if (elWeight) elWeight.textContent = `${(data.weight || 0) / 10}Kg`;

      // Stats – base_stat (0..255). Normaliza para %.
      const maxStat = 255;
      const setStat = (id, base) => {
        const el = document.getElementById(id);
        if (!el) return;
        const pct = Math.max(0, Math.min(100, Math.round((Number(base || 0) / maxStat) * 100)));
        el.style.width = `${pct}%`;
      };

      setStat('js-stats-hp', data.stats?.[0]?.base_stat);
      setStat('js-stats-attack', data.stats?.[1]?.base_stat);
      setStat('js-stats-defense', data.stats?.[2]?.base_stat);
      setStat('js-stats-sp-attack', data.stats?.[3]?.base_stat);
      setStat('js-stats-sp-defense', data.stats?.[4]?.base_stat);
      setStat('js-stats-speed', data.stats?.[5]?.base_stat);

      // Types
      const elTypes = document.getElementById('js-types-pokemon');
      if (elTypes) {
        elTypes.innerText = '';
        (data.types || []).forEach((t) => {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.classList = `tag-type ${t.type.name}`;
          span.textContent = capitalize(t.type.name);
          li.appendChild(span);
          elTypes.appendChild(li);
        });
      }

// Atualiza também os ícones do modal (principal + secundário)
// usando a resposta da API (garante ordem correta: slot 1 -> slot 2).
const typeNames = (data.types || [])
  .slice()
  .sort((a, b) => (a.slot || 0) - (b.slot || 0))
  .map((t) => t.type?.name)
  .filter(Boolean);

setModalTypeIcons(modal, typeNames);

      // Weaknesses
      const elWeak = document.getElementById('js-area-weak');
      if (elWeak) elWeak.innerHTML = '';

      const firstTypeUrl = data.types?.[0]?.type?.url;
      if (firstTypeUrl && elWeak) {
        const typeData = await fetchJson(firstTypeUrl);
        (typeData.damage_relations?.double_damage_from || []).forEach((w) => {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.classList = `tag-type ${w.name}`;
          span.textContent = capitalize(w.name);
          li.appendChild(span);
          elWeak.appendChild(li);
        });
      }

      // Abilities
      const elAbilityWrap = document.getElementById('div-ability');
      if (elAbilityWrap) {
        elAbilityWrap.innerHTML = '';
        (data.abilities || []).forEach((a) => {
          const strong = document.createElement('strong');
          strong.classList = 'abilityList';
          strong.textContent = capitalize(a.ability.name);
          elAbilityWrap.appendChild(strong);
        });
      }
    } catch (e) {
      // Se falhar, mantemos os dados básicos do card.
      // (sem alert/throw para não quebrar o modal)
    }
  }

  function closeDetailsPokemon() {
    document.documentElement.classList.remove('open-modal');
    document.documentElement.style.overflow = 'auto';
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeDetailsPokemon);
  }

  // -----------------------------
  // Listagem (All)
  // -----------------------------
  async function renderAllPage({ offset, append }) {
    try {
    const url = `https://pokeapi.co/api/v2/pokemon/?limit=${PAGE_SIZE_ALL}&offset=${offset}`;
    const data = await fetchJson(url);

    // Mantém a contagem total no modo "all"
    if (state.mode === 'all') {
      countPokemons.textContent = String(data.count ?? '');
    }

    const details = await fetchInBatches(data.results.map((r) => r.url), 25);
    const models = details
      .map(toCardModel)
      .filter((m) => m.image)
      .sort((a, b) => a.id - b.id);

    models.forEach((m) => {
      upsertCache(m);
      createCardPokemon(m);
    });

    // Não faz scroll automático na listagem "All" para não mover a página ao carregar.
} catch (e) {
  console.error('[Pokedex] Falha ao carregar página (All):', e);
  renderError('Falha ao carregar a lista de Pokémons. Tente recarregar a página.');
  // Esconde o botão de "Load more" para não ficar clicando e gerando mais erros.
  btnLoadMore.style.display = 'none';
}
  }

  async function loadInitialAll() {
    state.mode = 'all';
    state.activeTypeId = null;
    state.allOffset = 0;
    clearPokemonList();
    btnLoadMore.style.display = 'block';
    await renderAllPage({ offset: 0, append: false });
    state.allOffset += PAGE_SIZE_ALL;
  }

  async function loadMoreAll() {
    await renderAllPage({ offset: state.allOffset, append: true });
    state.allOffset += PAGE_SIZE_ALL;
  }

  // -----------------------------
  // Listagem por Tipo
  // -----------------------------
  async function filterByTypes() {
    const idType = this.getAttribute('code-type');
    const label = this.querySelector('span')?.textContent;

    // Fecha dropdown mobile ao selecionar
    if (btnDropdownSelect?.parentElement?.classList.contains('active')) {
      btnDropdownSelect.parentElement.classList.remove('active');
    }

    // Atualiza label do select custom no mobile
    if (label) {
      const selected = document.querySelector('.select-custom .item-selected strong');
      if (selected) selected.textContent = label;
    }

    // Limpa busca ao trocar tipo
    inputSearch.value = '';
    // Botão de busca pode não existir em versões antigas do HTML.
    if (btnSearch) btnSearch.disabled = true;
    updateSuggestions('');

    // Mantém o estado "active" sincronizado entre desktop e mobile
    document.querySelectorAll('.type-filter').forEach((btn) => btn.classList.remove('active'));
    const code = idType ?? '';
    document.querySelectorAll(`.type-filter[code-type="${code}"]`).forEach((btn) => btn.classList.add('active'));

    // "All" (sem id)
    if (!idType) {
    try {
      await loadInitialAll();
    } catch (e) {
      console.error('[Pokedex] Falha ao carregar lista inicial:', e);
      renderError('Não foi possível carregar os Pokémons agora. Verifique sua conexão e recarregue a página.');
    }
      return;
    }

    state.mode = 'type';
    state.activeTypeId = idType;
    btnLoadMore.style.display = 'none';
    clearPokemonList();
    scrollToPokemonSection();

    try {
      const typeData = await fetchJson(`https://pokeapi.co/api/v2/type/${idType}`);
      const refs = (typeData.pokemon || [])
        .map((p) => ({
          name: p.pokemon.name,
          url: p.pokemon.url,
          id: getIdFromUrl(p.pokemon.url),
        }))
        .sort((a, b) => a.id - b.id);

      countPokemons.textContent = String(refs.length);

      // Evita explodir requisições: carrega em batches.
      const details = await fetchInBatches(refs.map((r) => r.url), 25);
      const models = details
        .map(toCardModel)
        .filter((m) => m.image)
        .sort((a, b) => a.id - b.id);

      models.forEach((m) => {
        upsertCache(m);
        createCardPokemon(m);
      });
    } catch (e) {
      renderError('Falha ao filtrar por tipo. Tente novamente.');
    }
  }

  // -----------------------------
  // Autocomplete + Busca instantânea
  // -----------------------------
  function updateSuggestions(query) {
    if (!datalistSuggestions) return;
    datalistSuggestions.innerHTML = '';
    const q = (query || '').trim().toLowerCase();
    if (!q || !state.indexLoaded) return;

    // Sugestões (autocomplete):
    // Exibimos em ordem de ID (Pokédex) para manter consistência com a listagem.
    // Aqui a regra é "começa com" (prefixo). Assim, ao digitar "pi" você vê "pikachu", "pidgey"...,
    // e não nomes que só CONTÊM "pi" no meio/final.
    const candidates = state.pokemonIndex
      .filter((p) => matchesNamePrefix(p.name, q))
      .sort((a, b) => a.id - b.id);

    candidates
      .slice(0, 12)
      .forEach((p) => {
        const opt = document.createElement('option');
        // A PokeAPI usa nomes em lowercase (ex.: 'pikachu').
        // Por isso colocamos o valor da sugestão exatamente assim.
        opt.value = p.name;
        datalistSuggestions.appendChild(opt);
      });
  }

  // Carrega (uma única vez) um índice leve com TODOS os Pokémons: { id, name, url }.
  // Isso é bem mais rápido do que buscar detalhes (sprites, stats...) para todos de uma vez.
  // Usamos esse índice para:
  // - filtrar rapidamente enquanto você digita
  // - montar as sugestões de autocomplete
  async function ensurePokemonIndex() {
    try {
      const data = await fetchJson('https://pokeapi.co/api/v2/pokemon?limit=200000&offset=0');
      state.pokemonIndex = (data.results || []).map((p) => ({
        name: p.name,
        url: p.url,
        id: getIdFromUrl(p.url),
      }));
      state.indexLoaded = true;
    } catch (e) {
      // Sem índice, ainda funciona a listagem normal.
      state.indexLoaded = false;
    }
  }

  // Renderiza a página no modo "search" (filtrando a lista conforme o texto digitado)
  // - reset=true: limpa a lista e começa do zero
  // - reset=false: continua (Load more)
  async function renderSearchPage({ query, reset, scroll = true }) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return;

    if (!state.indexLoaded) {
      // Fallback: tenta buscar exato
      await renderExactPokemon(q);
      return;
    }

    state.mode = 'search';
    state.search.query = q;

    if (reset) {
  state.search.offset = 0;
  clearPokemonList();

  // Para iniciante:
  // - Em "live search" (enquanto digita), NÃO queremos rolar a página a cada tecla.
  // - Por isso o caller (scheduleSearch) passa scroll=false.
  if (scroll) scrollToPokemonSection();
}

    // Match por nome (prefixo) ou por id (prefixo)
    const isNumeric = /^[0-9]+$/.test(q);
    // Filtra por ID (prefixo) ou por NOME (prefixo).
    // Ex.: digitando "pi" deve trazer "pidgey", "pikachu"... e NÃO "vulpix" (que contém "pi" no final).

    // Aqui definimos quais pokémons entram no resultado:
    // - Se o usuário digitou números, filtramos por ID que COMEÇA com esse número (ex.: "1" -> 1, 10, 11...)
    // - Se o usuário digitou letras, filtramos por NOME que COMEÇA com essas letras (ex.: "cha" -> charmander, charmeleon...)
    // Isso implementa o comportamento clássico de "autocomplete".
    const matches = isNumeric
      ? state.pokemonIndex.filter((p) => String(p.id).startsWith(q))
      : state.pokemonIndex.filter((p) => matchesNamePrefix(p.name, q));

    // Ordenação dos resultados:
    // - Se for busca numérica, ordena por ID (1, 2, 3...)
    // - Se for busca por nome, ordena por nome (A → Z), que combina melhor com o que você está digitando
    // Ordenação dos resultados (sempre por ID crescente)
// Para iniciante:
// - Mesmo filtrando por nome (prefixo), a exibição fica em "ordem de Pokédex".
// - Isso é mais consistente com a página inicial.
state.search.matches = matches.sort((a, b) => a.id - b.id);
countPokemons.textContent = String(state.search.matches.length);

    if (state.search.matches.length === 0) {
      btnLoadMore.style.display = 'none';
      renderError('Não foi encontrado nenhum resultado com esta pesquisa!');
      return;
    }

    const slice = state.search.matches.slice(state.search.offset, state.search.offset + PAGE_SIZE_SEARCH);
    state.search.offset += slice.length;

    // Mostra botão se ainda há mais
    btnLoadMore.style.display = state.search.offset < state.search.matches.length ? 'block' : 'none';

    // Usa cache quando possível.
    // Importante: manter a ORDEM do "slice" (que já está ordenado por ID ou por NOME).
    // Se a gente ordenar os modelos por conta, o resultado na tela pode ficar fora da ordem do que você digitou.
    const toFetch = [];
    const modelsById = new Map(); // id -> modelo pronto para renderizar

    slice.forEach((p) => {
      const cached = pokemonCache.get(p.id);
      if (cached) {
        modelsById.set(p.id, cached);
      } else {
        toFetch.push(p.url);
      }
    });

    if (toFetch.length) {
      const details = await fetchInBatches(toFetch, 25);
      details
        .map(toCardModel)
        .filter((m) => m && m.image)
        .forEach((m) => {
          upsertCache(m);
          modelsById.set(m.id, m);
        });
    }

    // Renderiza seguindo exatamente a ordem do slice:
    // - Busca por ID: 1,2,3...
    // - Busca por nome: A→Z (prefixo)
    slice.forEach((p) => {
      const model = modelsById.get(p.id);
      if (model && model.image) createCardPokemon(model);
    });
}

  async function renderExactPokemon(value) {
    const q = String(value || '').trim().toLowerCase();
    if (!q) return;

    state.mode = 'exact';
    btnLoadMore.style.display = 'none';
    clearPokemonList();
    scrollToPokemonSection();

    try {
      const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${q}`);
      const model = toCardModel(data);
      if (!model.image) {
        countPokemons.textContent = '0';
        renderError('Não foi encontrado nenhum resultado com esta pesquisa!');
        return;
      }
      upsertCache(model);
      createCardPokemon(model);
      countPokemons.textContent = '1';
    } catch (e) {
      countPokemons.textContent = '0';
      renderError('Não foi encontrado nenhum resultado com esta pesquisa!');
    }
  }

  // Debounce da busca para evitar travar enquanto digita
  // - O evento "input" dispara a cada tecla.
  // - Com debounce, esperamos alguns ms antes de filtrar/renderizar.
  // - Se o usuário digitar de novo nesse tempo, reiniciamos o timer.
  // Também atualizamos o autocomplete (datalist) ao mesmo tempo.
  let searchTimer = null;
  function scheduleSearch() {
    if (!inputSearch) return;
    const q = inputSearch.value.trim().toLowerCase();
    if (btnSearch) btnSearch.disabled = q.length === 0;
    updateSuggestions(q);

    if (searchTimer) window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(async () => {
      const qq = inputSearch.value.trim().toLowerCase();

      // Se limpar, volta para ALL
      if (!qq) {
        document.querySelectorAll('.type-filter').forEach((btn) => btn.classList.remove('active'));
        document.querySelectorAll('.type-filter.all').forEach((btn) => btn.classList.add('active'));
        const selected = document.querySelector('.select-custom .item-selected strong');
        if (selected) selected.textContent = 'All';
        btnLoadMore.style.display = 'block';
        await loadInitialAll();
        return;
      }

      // Busca por prefixo ("começa com") (live) ao digitar
      // Importante: aqui NÃO fazemos scroll (scroll=false), para a tela não ficar "descendo" a cada tecla.
      // Remove o "active" dos tipos para evitar confusão visual durante a busca
      document.querySelectorAll('.type-filter').forEach((btn) => btn.classList.remove('active'));
      btnLoadMore.style.display = 'block';
      await renderSearchPage({ query: qq, reset: true, scroll: false });
    }, 180);
  }

  inputSearch.addEventListener('input', scheduleSearch);

  // Clique no botão / Enter:
// - Se o usuário digitou um ID (número) OU um nome completo exatamente igual ao da API,
//   a gente busca aquele Pokémon específico (modo 'exact').
// - Caso contrário, mantém o comportamento de filtrar a lista (live search).
  async function handleSearchCommit() {
    const q = inputSearch.value.trim().toLowerCase();
    if (!q) return;

    const isNumeric = /^[0-9]+$/.test(q);
    const isExactName = state.indexLoaded && state.pokemonIndex.some((p) => p.name === q);
    if (isNumeric || isExactName) {
      await renderExactPokemon(q);
    } else {
      await renderSearchPage({ query: q, reset: true });
    }
  }

  if (btnSearch) {
    btnSearch.addEventListener('click', handleSearchCommit);
  }
  if (inputSearch) {
    inputSearch.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' && inputSearch.value.trim().length > 0) {
        handleSearchCommit();
      }
    });
  }

  // Load more (depende do modo)
  btnLoadMore.addEventListener('click', async () => {
    if (state.mode === 'all') {
      await loadMoreAll();
      return;
    }
    if (state.mode === 'search') {
      await renderSearchPage({ query: state.search.query, reset: false });
      return;
    }
  });

  // -----------------------------
  // Dropdown mobile (tipos)
  // -----------------------------
  if (btnDropdownSelect) {
    btnDropdownSelect.addEventListener('click', () => {
      btnDropdownSelect.parentElement?.classList.toggle('active');
    });
  }

  // -----------------------------
  // Inicialização de Tipos
  // -----------------------------
  async function initTypes() {
    try {
      const data = await fetchJson('https://pokeapi.co/api/v2/type');
      (data.results || []).slice(0, 18).forEach((type, idx) => {
        const typeId = String(idx + 1);

        // Desktop
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.classList = `type-filter ${type.name}`;
        btn.setAttribute('code-type', typeId);
        const icon = document.createElement('div');
        icon.classList = 'icon';
        const img = document.createElement('img');
        img.setAttribute('src', `src/img/icon-types/${type.name}.svg`);
        icon.appendChild(img);
        const span = document.createElement('span');
        span.textContent = capitalize(type.name);
        btn.appendChild(icon);
        btn.appendChild(span);
        li.appendChild(btn);
        areaTypes?.appendChild(li);
        btn.addEventListener('click', filterByTypes);

        // Mobile
        const liM = document.createElement('li');
        const btnM = document.createElement('button');
        btnM.classList = `type-filter ${type.name}`;
        btnM.setAttribute('code-type', typeId);
        const iconM = document.createElement('div');
        iconM.classList = 'icon';
        const imgM = document.createElement('img');
        imgM.setAttribute('src', `src/img/icon-types/${type.name}.svg`);
        iconM.appendChild(imgM);
        const spanM = document.createElement('span');
        spanM.textContent = capitalize(type.name);
        btnM.appendChild(iconM);
        btnM.appendChild(spanM);
        liM.appendChild(btnM);
        areaTypesMobile?.appendChild(liM);
        btnM.addEventListener('click', filterByTypes);
      });
    } catch (e) {
      // se falhar, apenas ignora
    }
  }

  // -----------------------------
  // Boot
  // -----------------------------
  (async () => {
    // Index para autocomplete e busca instantânea
    ensurePokemonIndex();

    // Botão "All" já existe no HTML (desktop e mobile)
    document.querySelectorAll('.type-filter.all').forEach((btn) => {
      btn.addEventListener('click', filterByTypes);
    });

    // Tipos
    // Importante: se falhar (rede/API), não queremos quebrar o restante da página.
    initTypes().catch((e) => {
      console.error('[Pokedex] Falha ao carregar tipos:', e);
    });

    // Listener do botão "All" (já existe no HTML)
    document.querySelectorAll('.type-filter.all').forEach((btn) => {
      btn.addEventListener('click', filterByTypes);
    });

    // Listagem inicial (All)
    document.querySelectorAll('.type-filter.all').forEach((btn) => btn.classList.add('active'));
    if (btnSearch) btnSearch.disabled = true;
    await loadInitialAll();
  })();
})();